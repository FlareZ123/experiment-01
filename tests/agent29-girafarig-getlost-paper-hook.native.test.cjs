'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');
const {installGirafarigGetLostPaperHook} =
  require('../simulation/twinleaf/agent29-girafarig-getlost-paper-hook.cjs');
const {requiredGetLostCount} =
  require('../simulation/twinleaf/agent29-getlost-choice-count.cjs');

const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const load = name => require(path.join(output, name));

/** Actual native State, card printings and Store reducer with n public discards. */
function fixture(n) {
  const manager = initializeCards();
  const card = name => {
    const result = manager.getCardByName(name);
    assert.ok(result, 'Missing pinned printing: ' + name);
    return result;
  };
  const {Store} = load('game/store/store');
  const {Player} = load('game/store/state/player');
  const {State} = load('game/store/state/state');
  const {AttackEffect} = load('game/store/effects/game-effects');
  const owner = new Player();
  owner.id = 101;
  owner.name = 'Girafarig player';
  const girafarig = card('Girafarig LOT');
  owner.active.cards.push(girafarig);
  const opponent = new Player();
  opponent.id = 202;
  opponent.name = 'Opposing player';
  opponent.active.cards.push(card('Dratini OBF'));
  for (let i = 0; i < n; i++) opponent.discard.cards.push(
    card(i % 2 === 0 ? 'Darkness Energy MEE' : 'Psychic Energy SVE'));
  const initial = [...opponent.discard.cards];
  const state = new State();
  state.players = [owner, opponent];
  const store = new Store({onStateChange() {}});
  store.state = state;
  const announce = (index = 0) => store.reduceEffect(state,
    new AttackEffect(owner, opponent, girafarig.attacks[index]));
  return {store, state, owner, opponent, initial, announce};
}

/** @param {object} fixtureState @param {object[]|null} cards */
function resolve(fixtureState, cards) {
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const pending = fixtureState.state.prompts.find(p => p.result === undefined);
  assert.ok(pending);
  fixtureState.store.dispatch(new ResolvePromptAction(pending.id, cards));
}

test('pinned unpatched singleton Get Lost disallows one and permits null', () => {
  const f = fixture(1);
  f.announce();
  const p = f.state.prompts[0];
  assert.equal(p.options.min, 2);
  assert.equal(p.options.max, 2);
  assert.equal(p.options.allowCancel, true);
  assert.equal(p.validate([f.initial[0]]), false);
  assert.equal(p.validate(null), true);
});

for (const n of [0, 1, 2, 3]) {
  test('corrected real Store moves exactly the mandatory public cards: ' + n, () => {
    const restore = installGirafarigGetLostPaperHook();
    try {
      const f = fixture(n);
      f.announce();
      const prompt = f.state.prompts[0];
      assert.equal(prompt.options.min, requiredGetLostCount(n));
      assert.equal(prompt.options.max, requiredGetLostCount(n));
      assert.equal(prompt.options.allowCancel, false);
      const chosen = f.initial.slice(0, requiredGetLostCount(n));
      assert.equal(prompt.validate(chosen), true);
      assert.equal(prompt.validate(null), false);
      resolve(f, chosen);
      for (const physical of chosen) {
        assert.ok(!f.opponent.discard.cards.includes(physical));
        assert.ok(f.opponent.lostzone.cards.includes(physical));
      }
      assert.equal(f.opponent.discard.cards.length, n - chosen.length);
      assert.equal(f.opponent.lostzone.cards.length, chosen.length);
    } finally {
      restore();
    }
  });
}

test('other printed Girafarig attack produces no Get Lost prompt', () => {
  const restore = installGirafarigGetLostPaperHook();
  try {
    const f = fixture(1);
    f.announce(1);
    assert.equal(f.state.prompts.length, 0);
  } finally {
    restore();
  }
});

test('hook is idempotent and restores the pinned card reducer', () => {
  const {Girafarig} = load(
    'sets/08-sun-and-moon/set-lost-thunder/girafarig');
  const original = Girafarig.prototype.reduceEffect;
  const first = installGirafarigGetLostPaperHook();
  const second = installGirafarigGetLostPaperHook();
  assert.equal(first, second);
  first();
  assert.strictEqual(Girafarig.prototype.reduceEffect, original);
});

test('nonnegative public discard count has a mandatory 0,1,2 ceiling', () => {
  assert.deepEqual([0, 1, 2, 3].map(requiredGetLostCount), [0, 1, 2, 2]);
  assert.throws(() => requiredGetLostCount(-1), RangeError);
});
