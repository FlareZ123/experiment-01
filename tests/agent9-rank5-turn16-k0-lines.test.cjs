'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {choose,modelRank5K0} =
  require('../scripts/agent9-rank5-turn16-k0-lines.cjs');

/** @param {number} actual @param {number} target */
function close(actual,target) {
  assert.ok(Math.abs(actual-target)<1e-12,
    `Expected ${actual} to equal ${target} within tolerance`);
}

test('exact finite-sample combinatorics preserve K0 hypergeometric counts', () => {
  assert.equal(choose(44,4),135751n);
  assert.equal(choose(17,4),2380n);
  assert.equal(choose(6,4),15n);
});

test('authentic rank5 hidden zone and Mail search probabilities', () => {
  const row=modelRank5K0();
  assert.equal(row.seed,465442104);
  assert.equal(row.hiddenCards,44);
  assert.deepEqual(row.unknownComposition,{
    otherTrainerEligibleForMail:27,
    otherTrainersMail:2,
    pokemon:11,
    doubleColorlessEnergy:4
  });
  assert.equal(row.mewVUnseen,4);
  assert.equal(row.floatStoneUnseen,2);
  close(row.mailTopFourAnyEligibleTrainer,0.9824679007889444);
  close(row.mailTopFourAnyFloatStone,0.17547568710359407);
  close(row.quickBallMewAvailableInDeck,0.9998895035764009);
  close(row.nextDrawDoubleColorlessAfterMewQuickBall,
    0.09336506159014557);
});

test('two tutor-to-Bench actions cannot immediately draw in bloated hand', () => {
  const row=modelRank5K0();
  assert.equal(row.handAfterQuickBallBenchMew,12);
  assert.equal(row.genesectDrawsAtThatState,0);
  assert.equal(row.handAfterNextQuickBallBenchCrobat,10);
  assert.equal(row.crobatDrawsAtThatState,0);
  assert.equal(row.originalNativePolicyQualified,false);
  assert.equal(row.observedGameWinRate,null);
});
