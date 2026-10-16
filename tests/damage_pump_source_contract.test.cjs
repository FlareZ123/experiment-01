'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('../simulation/twinleaf/headless.cjs');
const { installDamagePumpSingleSourceHook } =
  require('../simulation/twinleaf/damage-pump-single-source-hook.cjs');

const root = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const engine = name => require(path.join(root, name));
const { Player } = engine('game/store/state/player');
const { State } = engine('game/store/state/state');
const { PokemonCardList } = engine('game/store/state/pokemon-card-list');
const { TrainerEffect } = engine('game/store/effects/play-card-effects');
const { PlayerType, SlotType } = engine('game/store/actions/play-card-action');

/**
 * Builds a real card-reducer fixture, using a prompt recorder so illegal
 * transfers can be replayed without the game client's own validation.
 * The target Exeggcute has 30 HP and begins with 20 damage.
 *
 * @returns {object} Reducer, source/target lists and prompt recorder.
 */
function fixture() {
  const cards = initializeCards();
  const get = fullname => {
    const card = cards.getCardByName(fullname);
    assert.ok(card, 'Missing pinned print ' + fullname);
    return card;
  };
  const player = new Player();
  player.id = 101;
  player.name = 'Rank 26';
  player.active.cards.push(get('Meloetta ex SV11B'));
  const pokemon = ['Unown AOR', 'Squawkabilly ex PAL', 'Exeggcute PLF'];
  const slots = pokemon.map(fullname => {
    const slot = new PokemonCardList();
    slot.cards.push(get(fullname));
    slot.damage = 20;
    player.bench.push(slot);
    return slot;
  });
  const state = new State();
  state.players = [player];
  const pump = get('Damage Pump LOR');
  let prompt;
  let resolve;
  const store = {
    reduceEffect(current) { return current; },
    prompt(current, nextPrompt, callback) {
      prompt = nextPrompt;
      resolve = callback;
      return current;
    }
  };
  pump.reduceEffect(store, state, new TrainerEffect(player, pump));
  assert.ok(prompt, 'Pinned Damage Pump failed to request damage movement');
  const bench = index => ({
    player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index
  });
  const differentSources = [
    {from: bench(0), to: bench(2)},
    {from: bench(1), to: bench(2)}
  ];
  const sameSource = [
    {from: bench(0), to: bench(2)},
    {from: bench(0), to: bench(2)}
  ];
  return {
    player, state, slots, prompt, resolve,
    differentSources, sameSource, bench
  };
}

test('pinned Damage Pump wrongly accepts separate counter sources', () => {
  const f = fixture();
  assert.equal(f.prompt.options.singleSourceTarget, false);
  assert.equal(f.prompt.validate(f.differentSources, f.state), true);
  f.resolve(f.differentSources);
  assert.deepEqual(f.slots.map(slot => slot.damage), [10, 10, 40]);
  assert.equal(f.slots[2].damage >= 30, true);
});

test('research hook rejects multi-source transfers before board mutation', () => {
  const restore = installDamagePumpSingleSourceHook();
  try {
    const f = fixture();
    assert.equal(f.prompt.options.singleSourceTarget, true);
    assert.equal(f.prompt.validate(f.differentSources, f.state), false);
    assert.throws(() => f.resolve(f.differentSources),
      {message: 'INVALID_PROMPT_RESULT'});
    assert.deepEqual(f.slots.map(slot => slot.damage), [20, 20, 20]);
  } finally {
    restore();
  }
});

test('research hook preserves legal two-counter same-source transfers', () => {
  const restore = installDamagePumpSingleSourceHook();
  try {
    const f = fixture();
    assert.equal(f.prompt.validate(f.sameSource, f.state), true);
    f.resolve(f.sameSource);
    assert.deepEqual(f.slots.map(slot => slot.damage), [0, 20, 40]);
  } finally {
    restore();
  }
});

test('research hook rejects moving damage onto its own source', () => {
  const restore = installDamagePumpSingleSourceHook();
  try {
    const f = fixture();
    assert.throws(() => f.resolve([
      {from: f.bench(0), to: f.bench(0)}
    ]), {message: 'INVALID_PROMPT_RESULT'});
    assert.deepEqual(f.slots.map(slot => slot.damage), [20, 20, 20]);
  } finally {
    restore();
  }
});

test('research hook rejects attempts to move more counters than source holds', () => {
  const restore = installDamagePumpSingleSourceHook();
  try {
    const f = fixture();
    f.slots[0].damage = 10;
    assert.throws(() => f.resolve(f.sameSource),
      {message: 'INVALID_PROMPT_RESULT'});
    assert.deepEqual(f.slots.map(slot => slot.damage), [10, 20, 20]);
  } finally {
    restore();
  }
});
