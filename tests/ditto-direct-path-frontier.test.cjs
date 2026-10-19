'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { choose, dittoDirectPathFrontier } = require('../scripts/ditto-direct-path-frontier.cjs');

/** @param {number} actual @param {number} expected @param {number} [tol] */
function close(actual, expected, tol = 1e-9) {
  assert.ok(Math.abs(actual - expected) < tol, `expected ${expected}, got ${actual}`);
}

test('binomial coefficients and invalid indices', () => {
  assert.equal(choose(60, 7), 386206920);
  assert.equal(choose(4, 2), 6);
  assert.equal(choose(4, -1), 0);
  assert.equal(choose(4, 5), 0);
});

test('one Stage-2 copy: deck survival is consequential', () => {
  const r = dittoDirectPathFrontier(4, 1);
  close(r.directVisibility, 0.321399531);
  close(r.withOneRerollCeiling, 0.24104964825);
});

test('four Stage-2 copies: almost recovers prior connector-only frontier', () => {
  const r = dittoDirectPathFrontier(4, 4);
  close(r.directVisibility, 0.40834432);
  close(r.withOneRerollCeiling, 0.30625824);
  const connectorOnly = (
    (1 - choose(56, 7) / choose(60, 7)) -
    (choose(52, 8) / choose(60, 8)) *
    (1 - choose(48, 7) / choose(52, 7))
  ) / (1 - choose(52, 7) / choose(60, 7));
  close(connectorOnly, 0.40889446426369425);
  assert.ok(r.directVisibility < connectorOnly);
});

test('starter redundancy and target redundancy have opposite direct-path effects', () => {
  for (const basics of [0, 2, 4, 6, 8]) {
    const single = dittoDirectPathFrontier(basics, 1);
    const double = dittoDirectPathFrontier(basics, 2);
    const four = dittoDirectPathFrontier(basics, 4);
    assert.ok(single.directVisibility < double.directVisibility);
    assert.ok(double.directVisibility < four.directVisibility);
    assert.ok(four.directVisibility < 1);
  }
  assert.ok(dittoDirectPathFrontier(0, 1).directVisibility >
            dittoDirectPathFrontier(8, 1).directVisibility);
});

test('invalid or overfull 60-card categories rejected', () => {
  assert.throws(() => dittoDirectPathFrontier(-1, 1), RangeError);
  assert.throws(() => dittoDirectPathFrontier(4, 0), RangeError);
  assert.throws(() => dittoDirectPathFrontier(4, 5), RangeError);
  assert.throws(() => dittoDirectPathFrontier(48, 4), RangeError);
});
