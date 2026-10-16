'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {upstreamSmokeDeck} = require('../simulation/twinleaf/headless.cjs');
const {runDamagePumpCorrectedMatch} =
  require('../simulation/twinleaf/damage-pump-corrected-match.cjs');

const root = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');

/** @returns {Function} The pinned Damage Pump card prototype handler. */
function reducer() {
  return require(path.join(root,
    'sets/09-sword-and-shield/set-lost-origin/damage-pump'))
    .DamagePump.prototype.reduceEffect;
}

test('headless rule-fidelity wrapper adds metadata and restores pinned reducer', () => {
  const original = reducer();
  const deck = upstreamSmokeDeck();
  assert.equal(deck.length, 60);
  const outcome = runDamagePumpCorrectedMatch({
    deckA: deck,
    deckB: deck,
    seed: 640216,
    maxActions: 3
  });
  assert.equal(outcome.damagePumpSingleSourceCorrection, true);
  assert.match(outcome.policy, /\+DamagePumpSingleSource-v1$/);
  assert.equal(outcome.engine,
    'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(reducer(), original);
});

test('headless wrapper restores original reducer if the request fails validation', () => {
  const original = reducer();
  assert.throws(() => runDamagePumpCorrectedMatch({
    deckA: [], deckB: [], seed: 1
  }), /60 concrete Twinleaf card fullNames/);
  assert.equal(reducer(), original);
});
