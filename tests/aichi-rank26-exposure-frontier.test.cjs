'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  exposureForComposition, minimalBasicCountForOneEvent
} = require('../scripts/aichi_rank26_exposure_frontier.cjs');

/** Mathematical reference values independently calculated using Python exact combinatorics. */
const anchors = [
  {b: 14, noProtection: 0.3750680},
  {b: 15, noProtection: 0.3394565},
  {b: 20, noProtection: 0.1931945},
  {b: 21, noProtection: 0.1701355},
  {b: 22, noProtection: 0.1490325}
];

test('restricted rank26 source Basic-count frontier agrees with math anchors', () => {
  for (const {b, noProtection} of anchors) {
    const point = exposureForComposition(b, 0, 12, 0.16);
    assert.ok(Math.abs(point.modeledUnprotectedSoloEvent - noProtection) < 1e-6,
      'Mismatched exact source opener probability at b=' + b);
  }
});

test('source Basic-count crossing shifts with hypothetical protected starters', () => {
  const counts = [0, 1, 2, 3, 4].map(protectedCopies => {
    const point = minimalBasicCountForOneEvent({
      protectedCopies, attackerBasics: 12,
      fieldRankLossBudget: 0.16,
      minimumBasics: 14, maxBasics: 30
    });
    assert.ok(point);
    assert.ok(point.modeledUnprotectedSoloEvent <= 0.16);
    const previous = exposureForComposition(point.basicCopies - 1,
      protectedCopies, 12, 0.16);
    assert.ok(previous.modeledUnprotectedSoloEvent > 0.16);
    return point.basicCopies;
  });
  assert.deepEqual(counts, [22, 22, 21, 21, 20]);
});

test('invalid compositions fail instead of silently changing probability', () => {
  assert.throws(() => exposureForComposition(14, 15, 12, 0.16), /Composition/);
  assert.throws(() => exposureForComposition(0, 0, 12, 0.16), /Composition/);
  assert.throws(() => minimalBasicCountForOneEvent({
    protectedCopies: -1, attackerBasics: 12, fieldRankLossBudget: 0.16
  }), /Invalid/);
});
