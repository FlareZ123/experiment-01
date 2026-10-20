'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {maxZeroLossProbability, upperLossRateAfterZeroLosses} =
  require('../scripts/aichi-field-zero-loss-bound.cjs');
const close = (actual, expected, delta = 1e-10) =>
  assert.ok(Math.abs(actual - expected) < delta, `${actual} !== ${expected}`);

test('a balanced 32-rank zero-loss study has a sharp composite-null bound', () => {
  const counts = Array(32).fill(19);
  close(maxZeroLossProbability(counts, 0.005), Math.pow(0.995, 608));
  assert.ok(maxZeroLossProbability(counts, 0.005) < 0.05);
  assert.ok(maxZeroLossProbability(Array(32).fill(18), 0.005) > 0.05);
  close(upperLossRateAfterZeroLosses(counts), 1 - Math.pow(0.05, 1 / 608));
});

test('a larger but unbalanced panel may fail decisively', () => {
  const counts = [1, ...Array(31).fill(20)];
  assert.equal(counts.reduce((a, b) => a + b, 0), 621);
  close(maxZeroLossProbability(counts, 0.005), 0.84);
  assert.ok(upperLossRateAfterZeroLosses(counts) > 0.005);
});

test('missing source ranks leave an unrestricted deficit', () => {
  const counts = [...Array(29).fill(200), 0, 0, 0];
  close(maxZeroLossProbability(counts, 0.005), 1);
  assert.ok(upperLossRateAfterZeroLosses(counts) >= 3 / 32);
  assert.equal(upperLossRateAfterZeroLosses(Array(32).fill(0)), 1);
});

test('two-rank analytic water fill and permutation invariance', () => {
  close(maxZeroLossProbability([1, 2], 0.1), 0.8);
  close(maxZeroLossProbability([2, 2], 0.1), Math.pow(0.9, 4));
  close(maxZeroLossProbability([20, 1, 20], 0.1),
    maxZeroLossProbability([20, 20, 1], 0.1));
});

test('empty null and impossible data are rejected', () => {
  assert.throws(() => maxZeroLossProbability([], 0.005));
  assert.throws(() => maxZeroLossProbability([0, 1.5], 0.005));
  assert.throws(() => maxZeroLossProbability([1], -0.1));
  assert.throws(() => upperLossRateAfterZeroLosses([1], 1));
});
