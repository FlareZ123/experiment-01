'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {deriveSlotSeeds} = require('../scripts/aichi-decorrelated-seeds.cjs');
const {REPEATS, SEED_BASE} = require('../simulation/twinleaf/rank26-prospective-integrated-source.cjs');

test('registered corrected 48-case schedule is valid, fixed and distinct', () => {
  assert.equal(SEED_BASE, 20261019);
  assert.deepEqual(REPEATS, Array.from({length: 24}, (_, i) => i + 60));
  const seeds = [];
  for (const repeat of REPEATS) {
    const value = deriveSlotSeeds(SEED_BASE, 'pilot', 26, repeat);
    assert.deepEqual(value, deriveSlotSeeds(SEED_BASE, 'pilot', 26, repeat));
    assert.ok(Number.isInteger(value.A) && value.A > 0 && value.A <= 0xffffffff);
    assert.ok(Number.isInteger(value.B) && value.B > 0 && value.B <= 0xffffffff);
    seeds.push(value.A, value.B);
  }
  assert.equal(seeds.length, 48);
  assert.equal(new Set(seeds).size, 48);
});
