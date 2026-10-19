'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { willNaturalDceFrontier } = require('../scripts/ditto-will-natural-dce-frontier.cjs');

/** @param {number} actual @param {number} expected */
function close(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-10, `expected ${expected}, got ${actual}`);
}

test('four other Basics, one stranded Stage 2 target', () => {
  close(willNaturalDceFrontier(4, 1).directVisibility, 0.07589275930523827);
});

test('four other Basics and four Stage 2 targets', () => {
  close(willNaturalDceFrontier(4, 4).directVisibility, 0.09463941674462903);
});

test('Ditto-only Basics and four targets', () => {
  close(willNaturalDceFrontier(0, 4).directVisibility, 0.1548329719588393);
});

test('targets raise narrow opportunity; other Basics lower conditional percentage', () => {
  for (const basics of [0, 2, 4, 6, 8]) {
    assert.ok(willNaturalDceFrontier(basics, 1).directVisibility <
      willNaturalDceFrontier(basics, 4).directVisibility);
  }
  assert.ok(willNaturalDceFrontier(0, 1).directVisibility >
    willNaturalDceFrontier(8, 1).directVisibility);
});

test('invalid deck-category counts rejected', () => {
  assert.throws(() => willNaturalDceFrontier(-1, 2), RangeError);
  assert.throws(() => willNaturalDceFrontier(4, 0), RangeError);
  assert.throws(() => willNaturalDceFrontier(4, 5), RangeError);
  assert.throws(() => willNaturalDceFrontier(45, 4), RangeError);
});
