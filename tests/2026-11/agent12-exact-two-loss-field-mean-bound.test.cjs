'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  STRATA,
  FAILURE_RATE,
  ALPHA,
  probabilityAtMostTwoNonwins,
  evaluateFixedTwoNonwinFieldMeanDesign,
} = require('../../scripts/agent12-exact-two-loss-field-mean-bound.cjs');

function close(actual, expected, tolerance = 1e-14) {
  assert.ok(Math.abs(actual - expected) <= tolerance,
    'expected ' + actual + ' to be within ' + tolerance + ' of ' + expected);
}

test('the fixed 10-per-cell, at-most-two-nonwin design has the exact binomial tail', () => {
  const result = evaluateFixedTwoNonwinFieldMeanDesign();
  assert.equal(result.strata, 128);
  assert.equal(result.gamesPerCell, 10);
  assert.equal(result.totalGames, 1280);
  assert.equal(result.maximumNonwins, 2);
  close(result.worstCaseNullPValue, 0.04595004378565184);
  assert.ok(result.worstCaseNullPValue < ALPHA);
  assert.equal(result.passes, true);
});

test('nine games per cell cannot pass the same at-most-two-nonwin rule', () => {
  const result = evaluateFixedTwoNonwinFieldMeanDesign();
  assert.equal(result.previousGamesPerCell, 9);
  assert.equal(result.previousTotalGames, 1152);
  close(result.previousEqualNullPValue, 0.07308314434173511);
  assert.ok(result.previousEqualNullPValue > ALPHA);
  assert.equal(result.previousFails, true);
});

test('the design is one aggregate field-mean claim, not a per-opponent guarantee', () => {
  const result = evaluateFixedTwoNonwinFieldMeanDesign();
  assert.equal(result.perOpponentGuarantee, false);
  assert.equal(result.fixedSampleOnly, true);
  assert.equal(result.requiresIndependentGames, true);
  assert.equal(result.heterogeneityProof, 'pairwise-smoothing-v1-128x10-two-nonwins');
});

test('the binomial tail is monotone decreasing as balanced games are added', () => {
  const values = [8, 9, 10, 11, 12].map(k => probabilityAtMostTwoNonwins(STRATA * k));
  for (let i = 1; i < values.length; i += 1) {
    assert.ok(values[i] < values[i - 1]);
  }
});

test('the probability helper rejects invalid trial counts and probabilities', () => {
  assert.throws(() => probabilityAtMostTwoNonwins(2), /totalGames/);
  assert.throws(() => probabilityAtMostTwoNonwins(1280, 0), /failureRate/);
  assert.throws(() => probabilityAtMostTwoNonwins(1280, 1), /failureRate/);
  assert.throws(() => probabilityAtMostTwoNonwins(1280, NaN), /failureRate/);
});

test('the fixed null is the stated 0.5% failure rate', () => {
  assert.equal(FAILURE_RATE, 0.005);
  assert.equal(evaluateFixedTwoNonwinFieldMeanDesign().nullMeanFailureRate, 0.005);
});
