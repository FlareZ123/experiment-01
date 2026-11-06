'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { censusFirstIndices } =
  require('../scripts/agent48-xorshift-small-seed-first-index-census.cjs');
const { firstUniform, firstIndex } =
  require('../scripts/agent48-nightwatch-entropy-coupling.cjs');

test('all seeds 1..256 choose physical position zero on first uniform for every hand size 1..60', () => {
  const result = censusFirstIndices(1, 256, 60);
  assert.equal(result.seedCount, 256);
  assert.equal(result.allFirstPositionsZero, true);
  assert.deepEqual(result.firstIndices, [0]);
  assert.equal(result.firstNonZeroAtLargestHandSeed, null);
  assert.ok(result.maxFirstUniform < 1 / 60);
  assert.equal(result.competitivelyQualifiedGames, 0);
});

test('the first nonzero 60-card-hand first index after seed256 is seed272', () => {
  const next = censusFirstIndices(257, 512, 60);
  assert.equal(next.firstNonZeroAtLargestHandSeed, 272);
  assert.ok(firstUniform(271) < 1 / 60);
  assert.ok(firstUniform(272) >= 1 / 60);
  assert.equal(firstIndex(272, 60), 1);
  assert.deepEqual(next.firstIndices, [0, 1]);
});

test('current registered selected Issue25 nearby seeds are inside first-index trap', () => {
  for (const seed of [100, 101, 102, 103]) {
    for (let hand = 1; hand <= 60; hand++) {
      assert.equal(firstIndex(seed, hand), 0);
    }
  }
});

test('first-sample study cannot accidentally be requested over a vast range', () => {
  assert.throws(() => censusFirstIndices(0, 100), RangeError);
  assert.throws(() => censusFirstIndices(512, 511), RangeError);
  assert.throws(() => censusFirstIndices(1, 5000), RangeError);
  assert.throws(() => censusFirstIndices(1, 256, 61), RangeError);
});
