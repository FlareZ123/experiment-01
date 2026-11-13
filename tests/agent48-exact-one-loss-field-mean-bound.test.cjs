'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  STRATA_COUNT,
  MINIMUM_CONCAVITY_GAMES_PER_CELL,
  binomialAtMostOneNonwins,
  stratifiedAtMostOneNonwins,
  oneLossFieldMeanDesign,
  minimumGamesPerCellForOneLossFieldMean
} = require('../scripts/agent48-exact-one-loss-field-mean-bound.cjs');

test('the exact aggregate one-nonwin boundary is eight games per 128-cell stratum', () => {
  const failed = oneLossFieldMeanDesign({ gamesPerCell: 7 });
  const passed = oneLossFieldMeanDesign({ gamesPerCell: 8 });
  assert.equal(MINIMUM_CONCAVITY_GAMES_PER_CELL, 8);
  assert.equal(failed.heterogeneityProofApplies, false);
  assert.equal(failed.passes, false);
  assert.ok(Math.abs(failed.worstCasePValue -
    0.06166537699596426) < 1e-15);
  assert.equal(passed.heterogeneityProofApplies, true);
  assert.equal(passed.gamesPerOpponent, 32);
  assert.equal(passed.totalGames, 1024);
  assert.equal(passed.maximumNonwins, 1);
  assert.ok(Math.abs(passed.alpha - 0.05) < 1e-15);
  assert.ok(Math.abs(passed.worstCasePValue -
    0.03625835228545431) < 1e-15);
});

test('minimum design finder returns the eight-per-cell field-mean plan', () => {
  const result = minimumGamesPerCellForOneLossFieldMean();
  assert.equal(result.gamesPerCell, 8);
  assert.equal(result.gamesPerOpponent, 32);
  assert.equal(result.totalGames, 1024);
  assert.equal(result.passes, true);
});

test('equal cell failure rates maximize the one-nonwin tail in heterogeneous fixtures', () => {
  const n = 8;
  const equal = Array(STRATA_COUNT).fill(0.005);
  const concentrated = [0.64, ...Array(STRATA_COUNT - 1).fill(0)];
  const split = [0.32, 0.32, ...Array(STRATA_COUNT - 2).fill(0)];
  const threeWay = [0.64 / 3, 0.64 / 3, 0.64 / 3,
    ...Array(STRATA_COUNT - 3).fill(0)];
  const equalTail = stratifiedAtMostOneNonwins(equal, n);
  assert.ok(concentrated.length === STRATA_COUNT);
  assert.ok(split.length === STRATA_COUNT);
  assert.ok(threeWay.length === STRATA_COUNT);
  assert.ok(stratifiedAtMostOneNonwins(concentrated, n) < equalTail);
  assert.ok(stratifiedAtMostOneNonwins(split, n) < equalTail);
  assert.ok(stratifiedAtMostOneNonwins(threeWay, n) < equalTail);
  assert.ok(Math.abs(equalTail -
    binomialAtMostOneNonwins(STRATA_COUNT * n, 0.005)) < 1e-15);
});

test('heterogeneous tail handles zero and forced nonwin rates', () => {
  assert.equal(stratifiedAtMostOneNonwins(Array(STRATA_COUNT).fill(0), 8), 1);
  const oneForced = [1, ...Array(STRATA_COUNT - 1).fill(0)];
  const twoForced = [1, 1, ...Array(STRATA_COUNT - 2).fill(0)];
  assert.equal(stratifiedAtMostOneNonwins(oneForced, 1), 1);
  assert.equal(stratifiedAtMostOneNonwins(oneForced, 2), 0);
  assert.equal(stratifiedAtMostOneNonwins(twoForced, 1), 0);
});

test('invalid dimensions, counts, and probabilities fail closed', () => {
  assert.throws(() => oneLossFieldMeanDesign({ gamesPerCell: 0 }), /positive/);
  assert.throws(() => stratifiedAtMostOneNonwins([0, 0, 0], 8), /128/);
  assert.throws(() => stratifiedAtMostOneNonwins(
    [...Array(127).fill(0), 1.1], 8), /probability/);
  assert.throws(() => stratifiedAtMostOneNonwins(
    Array(STRATA_COUNT).fill(0), 0), /positive/);
  assert.throws(() => binomialAtMostOneNonwins(10, -0.1), /probability/);
});
