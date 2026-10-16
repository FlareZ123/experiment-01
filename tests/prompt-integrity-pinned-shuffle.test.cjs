'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {assertValidPromptAction} =
  require('../simulation/twinleaf/prompt-integrity.cjs');

const out = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const {State} = require(path.join(out, 'game/store/state/state'));
const {Player} = require(path.join(out, 'game/store/state/player'));
const {ShuffleDeckPrompt} = require(path.join(out, 'game/store/prompts/shuffle-prompt'));
const {ResolvePromptAction} = require(path.join(out, 'game/store/actions/resolve-prompt-action'));

test('pinned 60-card ShuffleDeckPrompt validator rejects legal numeric permutation', () => {
  const state = new State();
  const player = new Player();
  player.id = 101;
  player.deck.cards.push(...Array(60).fill(null));
  state.players.push(player);
  const prompt = new ShuffleDeckPrompt(101);
  prompt.id = 3;
  state.prompts.push(prompt);

  const result = Array.from({length: 60}, (_, index) => index).reverse();
  assert.equal(prompt.validate(result, state), false);
  assert.doesNotThrow(() => assertValidPromptAction(
    state, new ResolvePromptAction(3, result)));
  assert.throws(() => assertValidPromptAction(
    state, new ResolvePromptAction(3, result.slice(1))), /invalid result/);
});
