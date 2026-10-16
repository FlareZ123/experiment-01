'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { sensitivity } = require('../scripts/aichi-temple-vmax-slot-sensitivity.cjs');

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12,
  'Expected ' + expected + ' got ' + actual);

test('fixed Temple resource categories and all one-slot swaps conserve 60 and increase VMAX', () => {
  const s = sensitivity();
  assert.deepEqual(s.baseline.groups, [1, 5, 1, 3, 1, 13, 36]);
  assert.equal(s.variants.length, 5);
  const seen = new Set();
  for (const v of s.variants) {
    assert.equal(v.groups.reduce((a, b) => a + b, 0), 60);
    assert.equal(v.groups[3], 4);
    assert.ok(!seen.has(v.category));
    seen.add(v.category);
    assert.equal(v.groups[v.category], s.baseline.groups[v.category] - 1);
    assert.ok(v.groups.every(n => n >= 0));
    near(v.accessibleTwoVmax - v.wobbuffetSelfLockedTwoVmax, v.unblockedTwoVmax);
  }
});

test('fourth VMAX replaces a search Item less effectively than preserving Temple v1', () => {
  const s = sensitivity();
  near(s.baseline.unblockedTwoVmax, 0.44971597606099833);
  const search = s.variants.find(v => v.category === 1);
  const other = s.variants.find(v => v.category === 6);
  near(search.unblockedTwoVmax, 0.43864021089506666);
  near(other.unblockedTwoVmax, 0.49448782964723115);
  assert.ok(search.gainPercentagePoints < 0);
  assert.ok(other.gainPercentagePoints > 0);
});

test('swapping Wobbuffet removes the precisely modeled self-lock subevent', () => {
  const s = sensitivity();
  const x = s.variants.find(v => v.category === 4);
  assert.equal(x.wobbuffetSelfLockedTwoVmax, 0);
  near(x.unblockedTwoVmax, 0.5065943762478146);
});
