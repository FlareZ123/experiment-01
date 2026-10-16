'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('../simulation/twinleaf/headless.cjs');
const { installDamagePumpSingleSourceHook } =
  require('../simulation/twinleaf/damage-pump-single-source-hook.cjs');

const root = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const engine = name => require(path.join(root, name));
const { Store } = engine('game/store/store');
const { Player } = engine('game/store/state/player');
const { PokemonCardList } = engine('game/store/state/pokemon-card-list');
const { CardList } = engine('game/store/state/card-list');
const { GamePhase } = engine('game/store/state/state');
const { GameSettings } = engine('game/core/game-settings');
const { TrainerEffect } = engine('game/store/effects/play-card-effects');
const { MoveDamagePrompt } = engine('game/store/prompts/move-damage-prompt');
const { ResolvePromptAction } = engine('game/store/actions/resolve-prompt-action');
const { PlayerType, SlotType } = engine('game/store/actions/play-card-action');

/**
 * Create a live pinned Store with both Active Pokemon, six occupied Prize
 * cards each, two damaged donors and a healthy Exeggcute. These conditions
 * isolate transfer legality without triggering any Knock Out.
 *
 * @returns {object} Real Store state and prompt-action fixture.
 */
function board() {
  const manager = initializeCards();
  const get = fullname => {
    const card = manager.getCardByName(fullname);
    assert.ok(card, 'Missing print ' + fullname);
    return card;
  };
  const store = new Store({onStateChange() {}});
  const state = store.state;
  const settings = new GameSettings();
  state.gameSettings = settings;
  state.rules = settings.rules;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 3;
  state.activePlayer = 0;
  const player = new Player();
  player.id = 101;
  player.name = 'Meloetta';
  player.active.cards.push(get('Meloetta ex SV11B'));
  const opponent = new Player();
  opponent.id = 202;
  opponent.name = 'Defender';
  opponent.active.cards.push(get('Shadow Rider Calyrex V CRE'));
  const prize = () => {
    const pile = new CardList();
    pile.cards.push(get('Psychic Energy SVE'));
    return pile;
  };
  player.prizes = Array.from({length: 6}, prize);
  opponent.prizes = Array.from({length: 6}, prize);
  state.players = [player, opponent];
  const cards = ['Unown AOR', 'Squawkabilly ex PAL', 'Exeggcute PLF'];
  const slots = cards.map((fullname, index) => {
    const slot = new PokemonCardList();
    slot.cards.push(get(fullname));
    slot.damage = index < 2 ? 20 : 0;
    player.bench.push(slot);
    return slot;
  });
  const pump = get('Damage Pump LOR');
  player.hand.cards.push(pump);
  store.reduceEffect(state, new TrainerEffect(player, pump));
  const prompt = state.prompts.find(p => p instanceof MoveDamagePrompt &&
    p.result === undefined);
  assert.ok(prompt, 'Pinned real Store produced no Damage Pump prompt');
  const target = index => ({player: PlayerType.BOTTOM_PLAYER,
    slot: SlotType.BENCH, index});
  const illegal = [
    {from: target(0), to: target(2)},
    {from: target(1), to: target(2)}
  ];
  const legal = [
    {from: target(0), to: target(2)},
    {from: target(0), to: target(2)}
  ];
  return {store, state, player, opponent, slots, prompt, illegal, legal};
}

test('real pinned Store accepts and applies forbidden two-donor Damage Pump', () => {
  const f = board();
  assert.equal(f.prompt.options.singleSourceTarget, false);
  f.store.dispatch(new ResolvePromptAction(f.prompt.id, f.illegal));
  assert.deepEqual(f.slots.map(slot => slot.damage), [10, 10, 20]);
  assert.equal(f.opponent.getPrizeLeft(), 6);
});

test('corrected real Store rejects two donors before either one moves', () => {
  const restore = installDamagePumpSingleSourceHook();
  try {
    const f = board();
    assert.equal(f.prompt.options.singleSourceTarget, true);
    assert.throws(() =>
      f.store.dispatch(new ResolvePromptAction(f.prompt.id, f.illegal)),
    {message: 'INVALID_PROMPT_RESULT'});
    assert.deepEqual(f.slots.map(slot => slot.damage), [20, 20, 0]);
  } finally {
    restore();
  }
});

test('corrected real Store applies legal two-counter one-donor transfer', () => {
  const restore = installDamagePumpSingleSourceHook();
  try {
    const f = board();
    f.store.dispatch(new ResolvePromptAction(f.prompt.id, f.legal));
    assert.deepEqual(f.slots.map(slot => slot.damage), [0, 20, 20]);
    assert.equal(f.opponent.getPrizeLeft(), 6);
  } finally {
    restore();
  }
});
