'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {choose,assess,assessLegalOpening} = require('../simulation/evaluation/new-moon-prize-access.cjs');

test('exact combinatorial helper and complete six-Prize partition', () => {
  assert.equal(choose(60,6),50063860n);
  assert.equal(choose(2,1),2n);
  assert.equal(choose(60,61),0n);
  const result = assess();
  assert.equal(result.sampleSpace,50063860);
  assert.equal(result.scenarios.length,12);
  assert.equal(result.scenarios.reduce((n,r)=>n+r.prizeConfigurations,0),50063860);
});

test('source-preserved one-one-two prize risks have exact counts', () => {
  const result = assess();
  assert.deepEqual(result.composition,{
    lunatone:1,solrock:1,hisuianHeavyBall:2,other:56
  });
  assert.equal(result.atLeastOneKeyPrized.configurations,9588502);
  assert.equal(result.bothKeyPrized.configurations,424270);
  assert.equal(result.physicallyInsufficientUnprizedHeavyBalls.configurations,112420);
  assert.equal(result.decomposition.exactlyOneKeyWithBothBallsPrized.configurations,55440);
  assert.equal(result.decomposition.bothKeysWithAtLeastOneBallPrized.configurations,56980);
  assert.equal(
    result.decomposition.exactlyOneKeyWithBothBallsPrized.configurations+
    result.decomposition.bothKeysWithAtLeastOneBallPrized.configurations,
    result.physicallyInsufficientUnprizedHeavyBalls.configurations
  );
});

test('legal seven-card Basic condition recomputes joint Prize shortage exactly', () => {
  const result = assessLegalOpening();
  assert.equal(result.basics, 17);
  assert.equal(result.allJointDeals, '8866337641761600');
  assert.equal(result.eligibleJointDeals, '8126553189088880');
  assert.ok(Math.abs(result.eligibleOpeningProbability - 0.9165625670301298) < 1e-12);
  assert.ok(Math.abs(result.insufficientHeavyBallsProbability - 0.002221128480172258) < 1e-12);
  assert.ok(Math.abs(result.atLeastOneKeyPrizedProbability - 0.18934023778651374) < 1e-12);
  assert.ok(Math.abs(result.bothKeysPrizedProbability - 0.00825511713781343) < 1e-12);
  assert.ok(result.insufficientHeavyBallsProbability < assess().physicallyInsufficientUnprizedHeavyBalls.fractionOfInitialPrizeSets);
});
