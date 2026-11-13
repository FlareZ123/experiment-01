'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  binomialAtMostOneFailures,
  fourStrataOneLossProbability,
  oneLossPerOpponentDesign,
  minimumGamesPerStratumForOneLoss
} = require('../scripts/agent5-exact-one-loss-balanced-matchup-bound.cjs');

test('exact balanced one-loss boundary is 436 games per stratum', () => {
  const failed = oneLossPerOpponentDesign({gamesPerStratum:435});
  const passed = oneLossPerOpponentDesign({gamesPerStratum:436});
  assert.equal(failed.heterogeneityProofApplies, true);
  assert.equal(failed.passes, false);
  assert.ok(Math.abs(failed.worstCasePValue -
    0.0015881270033271668) < 1e-15);
  assert.equal(passed.passes, true);
  assert.equal(passed.gamesPerOpponent, 1744);
  assert.equal(passed.totalForField, 55808);
  assert.ok(Math.abs(passed.alphaEach - 0.0015625) < 1e-15);
  assert.ok(Math.abs(passed.worstCasePValue -
    0.0015598130329003142) < 1e-15);
});

test('minimum design finder reproduces the 436-cell threshold', () => {
  const result = minimumGamesPerStratumForOneLoss();
  assert.equal(result.gamesPerStratum, 436);
  assert.equal(result.passes, true);
});

test('equal failure probabilities maximize the one-loss tail in adversarial fixtures', () => {
  const n = 436;
  const equal = fourStrataOneLossProbability([0.005,0.005,0.005,0.005],n);
  const concentrated = fourStrataOneLossProbability([0.02,0,0,0],n);
  const split = fourStrataOneLossProbability([0.01,0.01,0,0],n);
  const threeWay = fourStrataOneLossProbability([
    0.02/3,0.02/3,0.02/3,0
  ],n);
  assert.ok(concentrated < equal);
  assert.ok(split < equal);
  assert.ok(threeWay < equal);
  assert.ok(Math.abs(equal - binomialAtMostOneFailures(4*n,0.005)) < 1e-15);
});

test('four-stratum probability handles zero and unit failure rates', () => {
  assert.equal(fourStrataOneLossProbability([0,0,0,0],10),1);
  assert.equal(fourStrataOneLossProbability([1,0,0,0],10),0);
  assert.equal(fourStrataOneLossProbability([1,0,0,0],1),1);
  assert.equal(fourStrataOneLossProbability([1,1,0,0],1),0);
});

test('invalid inputs fail closed', () => {
  assert.throws(()=>oneLossPerOpponentDesign({gamesPerStratum:0}),/positive/);
  assert.throws(()=>oneLossPerOpponentDesign({gamesPerStratum:10,target:1}),/target/);
  assert.throws(()=>minimumGamesPerStratumForOneLoss({target:0.75}),/target/);
  assert.throws(()=>fourStrataOneLossProbability([0,0,0],10),/four/);
  assert.throws(()=>fourStrataOneLossProbability([0,0,0,1.2],10),/probability/);
});
