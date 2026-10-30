'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  allWinLowerBound, minimumAllWinGames, fieldCoverageEnvelope
} = require('../scripts/agent26-field-certification-envelope.cjs');

test('single aggregate all-win 95% bound requires exactly 598 games', () => {
  const n = minimumAllWinGames();
  assert.equal(n, 598);
  assert.ok(allWinLowerBound(n) >= 0.995);
  assert.ok(allWinLowerBound(n - 1) < 0.995);
  assert.ok(Math.abs(allWinLowerBound(32) - 0.9106318010137352) < 1e-12);
});

test('32-way Bonferroni all-win bound requires exactly 1290 per rank', () => {
  const familySize = 32;
  const n = minimumAllWinGames(0.995, {familySize});
  assert.equal(n, 1290);
  assert.equal(n * familySize, 41280);
  assert.ok(allWinLowerBound(n, {familySize}) >= 0.995);
  assert.ok(allWinLowerBound(n - 1, {familySize}) < 0.995);
});

test('missing ranks leave a 9.375-point logical outcome envelope', () => {
  const result = fieldCoverageEnvelope({
    fieldSize:32, knownRanks:29, knownWinRate:1
  });
  assert.equal(result.unknownRanks, 3);
  assert.equal(result.lower, 29/32);
  assert.equal(result.upper, 1);
  assert.ok(Math.abs(result.requiredUnknownAverage - 0.9466666666666667) < 1e-12);
});

test('all-opponent evidence reduces the logical envelope to a point', () => {
  const result = fieldCoverageEnvelope({
    fieldSize:32, knownRanks:32, knownWinRate:0.9
  });
  assert.equal(result.unknownRanks, 0);
  assert.equal(result.lower, 0.9);
  assert.equal(result.upper, 0.9);
  assert.equal(result.requiredUnknownAverage, null);
});

test('invalid parameter combinations fail closed', () => {
  assert.throws(() => allWinLowerBound(0));
  assert.throws(() => allWinLowerBound(4, {alpha:1}));
  assert.throws(() => allWinLowerBound(4, {familySize:0}));
  assert.throws(() => minimumAllWinGames(1));
  assert.throws(() => fieldCoverageEnvelope({
    fieldSize:32, knownRanks:33, knownWinRate:1
  }));
});
