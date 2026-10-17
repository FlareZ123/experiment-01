'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { assertValidPromptAction } =
  require('../simulation/twinleaf/prompt-integrity.cjs');

const out = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const { State } = require(path.join(out, 'game/store/state/state'));
const { Player } = require(path.join(out, 'game/store/state/player'));
const { CardList } = require(path.join(out, 'game/store/state/card-list'));
const { ResolvePromptAction } =
  require(path.join(out, 'game/store/actions/resolve-prompt-action'));
const { OrderCardsPrompt } =
  require(path.join(out, 'game/store/prompts/order-cards-prompt'));
const { ShufflePrizesPrompt } =
  require(path.join(out, 'game/store/prompts/shuffle-prizes-prompt'));
const { ShuffleHandPrompt } =
  require(path.join(out, 'game/store/prompts/shuffle-hand-prompt'));

/** @returns {{state: object, player: object}} */
function fixture() {
  const state = new State();
  const player = new Player();
  player.id = 101;
  state.players.push(player);
  return { state, player };
}

/** @param {object} state @param {object} prompt @param {unknown} result */
function check(state, prompt, result) {
  return () => assertValidPromptAction(state,
    new ResolvePromptAction(prompt.id, result));
}

/** @param {number} length */
function indices(length) {
  return Array.from({ length }, (_, index) => index).reverse();
}

test('pinned OrderCardsPrompt accepts valid 12-card index permutation in strict mode', () => {
  const { state } = fixture();
  const cards = new CardList();
  cards.cards.push(...Array(12).fill(null));
  const prompt = new OrderCardsPrompt(101, null, cards, { allowCancel: false });
  prompt.id = 7;
  state.prompts.push(prompt);
  const legal = indices(12);
  assert.equal(prompt.validate(legal, state), false,
    'Pinned default lexicographic sort incorrectly rejects 10+ positions');
  assert.doesNotThrow(check(state, prompt, legal));
  assert.throws(check(state, prompt, [...legal.slice(0, -1), legal[0]]),
    /invalid result/);
  const sparse = legal.slice();
  delete sparse[3];
  assert.throws(check(state, prompt, sparse), /invalid result/,
    'Sparse array holes must not masquerade as missing permutation indices');
  assert.throws(check(state, prompt, null), /invalid result/);
});

test('OrderCardsPrompt preserves its original allowCancel flag', () => {
  const { state } = fixture();
  const cards = new CardList();
  cards.cards.push(null);
  const prompt = new OrderCardsPrompt(101, null, cards, { allowCancel: true });
  prompt.id = 8;
  state.prompts.push(prompt);
  assert.doesNotThrow(check(state, prompt, null));
});

test('ShufflePrizesPrompt validates the physical number of Prize cards', () => {
  const { state, player } = fixture();
  for (let i = 0; i < 6; i++) {
    const prize = new CardList();
    prize.cards.push({});
    player.prizes.push(prize);
  }
  const prompt = new ShufflePrizesPrompt(101);
  prompt.id = 9;
  state.prompts.push(prompt);
  assert.doesNotThrow(check(state, prompt, indices(6)));
  assert.throws(check(state, prompt, [0, 0, 2, 3, 4, 5]),
    /invalid result/);
  assert.throws(check(state, prompt, null), /invalid result/);
});

test('ShufflePrizesPrompt uses numeric permutation semantics above index 9', () => {
  const { state, player } = fixture();
  for (let i = 0; i < 6; i++) {
    const prize = new CardList();
    prize.cards.push({}, {});
    player.prizes.push(prize);
  }
  const prompt = new ShufflePrizesPrompt(101);
  prompt.id = 10;
  state.prompts.push(prompt);
  const legal = indices(12);
  assert.equal(prompt.validate(legal, state), false);
  assert.doesNotThrow(check(state, prompt, legal));
});

test('ShuffleHandPrompt length follows hand cards, not Prize-slot count', () => {
  const { state, player } = fixture();
  player.hand.cards.push(...Array(12).fill(null));
  for (let i = 0; i < 6; i++) player.prizes.push(new CardList());
  const prompt = new ShuffleHandPrompt(101);
  prompt.id = 11;
  state.prompts.push(prompt);
  const legal = indices(12);
  assert.equal(prompt.validate(legal, state), false,
    'Pinned validator incorrectly compares result length with prizes.length');
  assert.doesNotThrow(check(state, prompt, legal));
  assert.throws(check(state, prompt, indices(6)), /invalid result/);
  assert.throws(check(state, prompt, null), /invalid result/);
});
