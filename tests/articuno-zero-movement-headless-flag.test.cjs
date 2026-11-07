'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {
  runMatch,
  initializeCards,
  upstreamSmokeDeck
} = require('../simulation/twinleaf/headless.cjs');

const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');

/** @returns {object} The Store class from the pinned compiled Twinleaf revision. */
function loadStore() {
  return require(path.join(output, 'game/store/store')).Store;
}

/**
 * @param {boolean} enabled
 * @returns {object} A one-root bounded run with the pinned upstream smoke deck.
 */
function runFlagSmoke(enabled) {
  const deck = upstreamSmokeDeck();
  assert.equal(deck.length, 60, 'upstream smoke deck must remain a full 60');
  return runMatch({
    deckA: deck.slice(),
    deckB: deck.slice(),
    seed: 0x32a71c,
    maxActions: 1,
    articunoZeroMovementPromptCorrection: enabled
  });
}

test('runMatch installs, fingerprints, and restores the opt-in Articuno D-02 hook', () => {
  initializeCards();
  const Store = loadStore();
  const originalDispatch = Store.prototype.dispatch;
  const result = runFlagSmoke(true);

  assert.equal(result.articunoZeroMovementPromptCorrection, true);
  assert.match(result.policy, /ArticunoZeroMovementPrompt-v1/);
  assert.equal(result.engine,
    'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.strictEqual(Store.prototype.dispatch, originalDispatch,
    'runMatch must restore Store.dispatch after the opt-in hook');
});

test('runMatch keeps the Articuno D-02 hook disabled by default', () => {
  initializeCards();
  const Store = loadStore();
  const originalDispatch = Store.prototype.dispatch;
  const deck = upstreamSmokeDeck();
  const result = runMatch({
    deckA: deck.slice(),
    deckB: deck.slice(),
    seed: 0x32a71c,
    maxActions: 1
  });

  assert.equal(result.articunoZeroMovementPromptCorrection, false);
  assert.doesNotMatch(result.policy, /ArticunoZeroMovementPrompt-v1/);
  assert.strictEqual(Store.prototype.dispatch, originalDispatch,
    'default runMatch must leave no Store.dispatch wrapper installed');
});
