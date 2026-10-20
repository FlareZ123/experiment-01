'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {maxZeroLossProbability} =
  require('../scripts/aichi-field-zero-loss-bound.cjs');

/** @param {number} actual @param {number} expected @returns {void} */
function close(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-10,
    `expected ${expected}, observed ${actual}`);
}

/**
 * Number of prospective independently flipped games per fixed physical
 * candidate side, for each of 32 source ranks.
 * @param {number} gamesPerPhysicalSide
 * @returns {number}
 */
function exactAllCellBalanceProbability(gamesPerPhysicalSide) {
  assert.ok(Number.isSafeInteger(gamesPerPhysicalSide) &&
    gamesPerPhysicalSide >= 0);
  if (gamesPerPhysicalSide % 2 !== 0) return 0;
  let binomial = 1;
  const half = gamesPerPhysicalSide / 2;
  for (let k = 1; k <= half; k++) {
    binomial *= (gamesPerPhysicalSide - k + 1) / k;
  }
  return Math.pow(binomial / Math.pow(2, gamesPerPhysicalSide), 64);
}

test('64 two-start balanced cells can hide 128 physical-seat imbalance', () => {
  // One source rank gets actual-start first/second totals 10/10 and physical
  // candidate-side A/B totals 10/10, but individual intersections are 8/2.
  const oneRank = [8, 2, 2, 8];
  assert.equal(oneRank[0] + oneRank[1], 10);
  assert.equal(oneRank[2] + oneRank[3], 10);
  assert.equal(oneRank[0] + oneRank[2], 10);
  assert.equal(oneRank[1] + oneRank[3], 10);
  const counts = Array.from({length: 32}, () => oneRank).flat();
  assert.equal(counts.length, 128);
  assert.equal(counts.reduce((a, b) => a + b, 0), 640);

  // Sharp null for uniformly weighted 128 cells at loss-rate >= 0.5%:
  // allocate q=.01 to each of the 64 thinner (n=2) cells, q=0 elsewhere.
  const worstNull = maxZeroLossProbability(counts, 0.005);
  close(worstNull, Math.pow(0.99, 128));
  assert.ok(worstNull > 0.05);
});

test('a truly balanced 128-cell all-win cohort has a significant bound', () => {
  const counts = Array(128).fill(5);
  const worstNull = maxZeroLossProbability(counts, 0.005);
  close(worstNull, Math.pow(0.995, 640));
  assert.ok(worstNull < 0.05);
});

test('fair independent starter coin flips almost never produce exact 128 balance', () => {
  const chance = exactAllCellBalanceProbability(10);
  // 64 groups: source rank x physical candidate engine seat.
  // Each group has 10 games and must make exactly five first, five second.
  close(chance, Math.pow(252 / 1024, 64));
  assert.ok(chance < 2e-39);
  assert.equal(exactAllCellBalanceProbability(9), 0);
});
