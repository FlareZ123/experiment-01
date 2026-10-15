'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('../simulation/twinleaf/headless.cjs');
const { installForestSealSearchHook } =
  require('../simulation/twinleaf/forest-seal-search-hook.cjs');

const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const engine = modulePath => require(path.join(output, modulePath));
const { Player } = engine('game/store/state/player');
const { State } = engine('game/store/state/state');
const { PowerEffect } = engine('game/store/effects/game-effects');
const { GameMessage } = engine('game/game-message');
const { ForestSealStone } = engine(
  'sets/09-sword-and-shield/set-silver-tempest/forest-seal-stone');

/** @param {number} deckSize */
function fixture(deckSize) {
  const manager = initializeCards();
  const stone = manager.getCardByName('Forest Seal Stone SIT');
  const filler = manager.getCardByName('Shadow Rider Calyrex VMAX CRE');
  assert.ok(stone && filler);
  const player = new Player();
  player.id = 101;
  for (let i = 0; i < deckSize; i += 1) player.deck.cards.push(filler);
  const state = new State();
  state.players = [player];
  const prompts = [];
  const store = {
    prompt(current, prompt) {
      prompts.push(prompt);
      return current;
    },
    reduceEffect(current) { return current; }
  };
  const act = () => stone.reduceEffect(store, state,
    new PowerEffect(player, stone.powers[0], stone));
  return { player, prompts, act, filler };
}

test('pinned original Star Alchemy prompt accepts illegal empty unrestricted search', () => {
  const f = fixture(1);
  f.act();
  assert.equal(f.prompts.length, 1);
  assert.equal(f.prompts[0].validate([]), true);
  assert.equal(f.prompts[0].options.min, 0);
});

test('opt-in hook requires one card and keeps valid single-card choice', () => {
  const restore = installForestSealSearchHook();
  try {
    const f = fixture(1);
    f.act();
    assert.equal(f.prompts.length, 1);
    assert.equal(f.prompts[0].options.min, 1);
    assert.equal(f.prompts[0].options.max, 1);
    assert.equal(f.prompts[0].validate([]), false);
    assert.equal(f.prompts[0].validate([f.filler]), true);
    assert.equal(f.player.usedVSTAR, true);
  } finally {
    restore();
  }
});

test('opt-in hook rejects empty deck before consuming VSTAR Power', () => {
  const restore = installForestSealSearchHook();
  try {
    const f = fixture(0);
    assert.throws(f.act, error => error.message === GameMessage.CANNOT_USE_POWER);
    assert.equal(f.player.usedVSTAR, false);
    assert.equal(f.prompts.length, 0);
  } finally {
    restore();
  }
});

test('hook installation is idempotent and restores pinned prompt behavior', () => {
  const original = ForestSealStone.prototype.reduceEffect;
  const restore = installForestSealSearchHook();
  const again = installForestSealSearchHook();
  assert.equal(restore, again);
  restore();
  assert.equal(ForestSealStone.prototype.reduceEffect, original);
  const f = fixture(1);
  f.act();
  assert.equal(f.prompts[0].options.min, 0);
});
