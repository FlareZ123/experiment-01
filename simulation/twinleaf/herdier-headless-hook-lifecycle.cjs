'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards, runMatch} = require('./headless.cjs');

/**
 * Exercise only the opt-in hook lifetime and provenance in real headless
 * games. The printed Ability semantics are tested separately through Store.
 * @returns {object}
 */
function runTest() {
  initializeCards();
  const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const {Herdier} = require(path.join(output,
    'sets/08-sun-and-moon/set-sun-and-moon/herdier'));
  const pristine = Herdier.prototype.reduceEffect;
  const assertClean = () => assert.equal(Herdier.prototype.reduceEffect,
    pristine, 'Herdier reducer leaked across games');
  const common = {
    deckA: [...Array(4).fill('Iron Thorns ex TWM'),
      ...Array(56).fill('Lightning Energy SVE')],
    deckB: [...Array(4).fill('Lillipup CEC'),
      ...Array(4).fill('Herdier SUM'),
      ...Array(52).fill('Psychic Energy SVE')],
    seed: 20261018,
    maxActions: 30
  };
  const raw = runMatch(common);
  assertClean();
  const corrected = runMatch({...common, herdierTreasureHuntCorrection:true});
  assertClean();
  assert.equal(raw.herdierTreasureHuntCorrection, false);
  assert.equal(corrected.herdierTreasureHuntCorrection, true);
  assert.ok(!raw.policy.includes('+HerdierTreasureHuntPaper-v1'));
  assert.ok(corrected.policy.includes('+HerdierTreasureHuntPaper-v1'));
  assert.throws(() => runMatch({...common,maxActions:0,
    herdierTreasureHuntCorrection:true}), /maxActions must be a positive integer/);
  assertClean();
  return {
    schema:'headless-herdier-opt-in-lifecycle-v1',
    engine:corrected.engine,
    pristineReducerRestored:true,
    defaultPolicy:raw.policy,
    correctedPolicy:corrected.policy,
    testScope:'short synthetic full-deck run; no competitive inference',
    rawActions:raw.actions,
    correctedActions:corrected.actions,
    qualifiedForCompetitiveInference:false
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(runTest(), null, 2) + '\n');
}
module.exports = {runTest};
