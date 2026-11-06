'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { seededRandom } = require('../simulation/twinleaf/headless.cjs');
const {
  HISTORICAL_ADJACENT_SEEDS, firstUniform, firstIndex,
  deriveSeparatedEntropySeeds, auditFirstPositions
} = require('../scripts/agent48-nightwatch-entropy-coupling.cjs');

const HASHED = [166542289, 1949982598, 3281288805, 978100785];

test('independent oracle equals pinned headless first xorshift draw', () => {
  for (const seed of [...HISTORICAL_ADJACENT_SEEDS, ...HASHED, 0]) {
    assert.equal(firstUniform(seed), seededRandom(seed)());
  }
});

test('all original adjacent entropy seeds hit one first position for every 1..60-card hand', () => {
  const audit = auditFirstPositions(HISTORICAL_ADJACENT_SEEDS);
  assert.equal(audit.arms, 4);
  assert.equal(audit.commonFirstPositionHandSizes, 60);
  assert.deepEqual(audit.hand29FirstPositions, [3, 3, 3, 3]);
  assert.deepEqual(audit.allCommonHandSizes,
    Array.from({ length: 60 }, (_, i) => i + 1));
  assert.deepEqual(
    HISTORICAL_ADJACENT_SEEDS.map(seed => firstIndex(seed, 27)),
    [3, 3, 3, 3]
  );
});

test('hash-domain-separated proposal reproduces exact distinct nonzero seeds', () => {
  const derived = deriveSeparatedEntropySeeds(3792360798, 0, 4);
  assert.deepEqual(derived, HASHED);
  assert.equal(new Set(derived).size, 4);
  assert.ok(derived.every(seed => seed !== 0));
  const audit = auditFirstPositions(derived);
  assert.equal(audit.commonFirstPositionHandSizes, 1);
  assert.deepEqual(audit.allCommonHandSizes, [1]);
  assert.deepEqual(audit.hand29FirstPositions, [14, 22, 22, 12]);
});

test('entropy schedule requires explicit valid identity', () => {
  assert.throws(() => deriveSeparatedEntropySeeds(-1, 0), RangeError);
  assert.throws(() => deriveSeparatedEntropySeeds(3792360798, 2), RangeError);
  assert.throws(() => deriveSeparatedEntropySeeds(3792360798, 0, 0), RangeError);
  assert.throws(() => firstIndex(20261106, 0), RangeError);
  assert.throws(() => firstIndex(20261106, 61), RangeError);
});
