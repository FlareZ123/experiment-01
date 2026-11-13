'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  binomialAtMostTwoFailures,
  fourStrataAtMostTwoFailuresProbability,
  twoNonwinPerOpponentDesign,
  minimumGamesPerStratumForTwoNonwins
} = require('../scripts/agent39-exact-two-nonwin-balanced-matchup-bound.cjs');

test('exact two-nonwin boundary is 534 games per stratum', () => {
  const failed = twoNonwinPerOpponentDesign({gamesPerStratum: 533});
  const passed = twoNonwinPerOpponentDesign({gamesPerStratum: 534});
  assert.equal(failed.heterogeneityProofApplies, false);
  assert.equal(failed.passes, false);
  assert.ok(Math.abs(failed.equalStratumPValue -
    0.001578123901916346) < 1e-15);
  assert.equal(failed.worstCasePValue, null);
  assert.equal(passed.heterogeneityProofApplies, true);
  assert.equal(passed.passes, true);
  assert.equal(passed.gamesPerOpponent, 2136);
  assert.equal(passed.totalForField, 68352);
  assert.ok(Math.abs(passed.alphaEach - 0.0015625) < 1e-15);
  assert.ok(Math.abs(passed.worstCasePValue -
    0.001552073004243903) < 1e-15);
});

test('minimum design finder reproduces the 534-cell threshold', () => {
  const result = minimumGamesPerStratumForTwoNonwins();
  assert.equal(result.gamesPerStratum, 534);
  assert.equal(result.gamesPerOpponent, 2136);
  assert.equal(result.totalForField, 68352);
  assert.equal(result.passes, true);
});

test('equal failure probabilities maximize the two-nonwin tail in adversarial fixtures', () => {
  const n = 534;
  const equal = fourStrataAtMostTwoFailuresProbability(
    [0.005, 0.005, 0.005, 0.005], n);
  const concentrated = fourStrataAtMostTwoFailuresProbability(
    [0.02, 0, 0, 0], n);
  const split = fourStrataAtMostTwoFailuresProbability(
    [0.01, 0.01, 0, 0], n);
  const threeWay = fourStrataAtMostTwoFailuresProbability(
    [0.02 / 3, 0.02 / 3, 0.02 / 3, 0], n);
  assert.ok(concentrated < equal);
  assert.ok(split < equal);
  assert.ok(threeWay < equal);
  assert.ok(Math.abs(equal - binomialAtMostTwoFailures(4 * n, 0.005)) < 1e-15);
});

test('four-stratum convolution equals the binomial tail when all cells are equal', () => {
  for (const n of [1, 2, 10, 101, 534]) {
    for (const q of [0, 0.005, 0.02, 0.5, 1]) {
      assert.ok(Math.abs(
        fourStrataAtMostTwoFailuresProbability([q, q, q, q], n) -
        binomialAtMostTwoFailures(4 * n, q)
      ) < 1e-12);
    }
  }
});

test('four-stratum convolution handles zero and unit failure rates', () => {
  assert.equal(fourStrataAtMostTwoFailuresProbability([0, 0, 0, 0], 10), 1);
  assert.equal(fourStrataAtMostTwoFailuresProbability([1, 0, 0, 0], 1), 1);
  assert.equal(fourStrataAtMostTwoFailuresProbability([1, 0, 0, 0], 2), 1);
  assert.equal(fourStrataAtMostTwoFailuresProbability([1, 0, 0, 0], 3), 0);
  assert.equal(fourStrataAtMostTwoFailuresProbability([1, 1, 0, 0], 1), 1);
  assert.equal(fourStrataAtMostTwoFailuresProbability([1, 1, 0, 0], 2), 0);
});

test('invalid inputs fail closed', () => {
  assert.throws(() => binomialAtMostTwoFailures(0, 0.005), /positive/);
  assert.throws(() => binomialAtMostTwoFailures(100, 1.2), /probability/);
  assert.throws(() => fourStrataAtMostTwoFailuresProbability([0, 0, 0], 10), /four/);
  assert.throws(() => fourStrataAtMostTwoFailuresProbability([0, 0, 0, 1.2], 10), /probability/);
  assert.throws(() => twoNonwinPerOpponentDesign({gamesPerStratum: 0}), /positive/);
  assert.throws(() => twoNonwinPerOpponentDesign({gamesPerStratum: 534, confidence: 1}), /confidence/);
  assert.throws(() => minimumGamesPerStratumForTwoNonwins({fieldSize: 0}), /positive/);
});
