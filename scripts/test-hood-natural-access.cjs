'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const { choose, hoodNaturalAccess } = require('./hood-natural-access.cjs');

test('exact hypergeometric counts', () => {
  assert.equal(choose(60, 7), 386206920n);
  assert.equal(choose(60, 0), 1n);
  assert.equal(choose(10, 11), 0n);
  assert.equal(choose(46, 7), 53524680n);
});

test('Aichi rank-1 unchanged-Basic natural Hood access', () => {
  const expected = [
    [0, 0],
    [0.110953970927, 0.127728424805],
    [0.211399077780, 0.241157609018],
    [0.302151738129, 0.341652589557],
    [0.383979521362, 0.430471631531]
  ];
  expected.forEach(([opening, turn], hoodCopies) => {
    const report = hoodNaturalAccess(hoodCopies);
    assert.ok(Math.abs(report.hoodInValidOpening - opening) < 0.000001);
    assert.ok(Math.abs(report.hoodAfterFirstDraw - turn) < 0.000001);
  });
});

test('Hood count remains independent of Basic Pokémon constraint', () => {
  const fiveBasics = hoodNaturalAccess(2, 5);
  const fourteenBasics = hoodNaturalAccess(2, 14);
  assert.ok(fiveBasics.validOpening < fourteenBasics.validOpening);
  assert.ok(fiveBasics.hoodInValidOpening < fourteenBasics.hoodInValidOpening);
  assert.throws(() => hoodNaturalAccess(5), /hoodCopies/);
});
