'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const {
  choose, counts, setup, audit
} = require('../scripts/agent47-rank26-opening-bench-coverage.cjs');

test('binomial implementation preserves integer counts and boundaries', () => {
  assert.equal(choose(60, 7), 386206920n);
  assert.equal(choose(5, 6), 0n);
  assert.equal(choose(5, 0), 1n);
});

test('single-Basic conditional seven-card exposure is exact', () => {
  for (const [basics, expected] of [
    [14, 0.3941763348],
    [15, 0.3584686438],
    [17, 0.2927817856]
  ]) {
    const result = setup(basics);
    assert.ok(Math.abs(result.exactlyOneBasicGivenValid - expected) < 1e-10);
    assert.ok(Math.abs(
      result.exactlyOneBasicGivenValid + result.atLeastTwoBasicsGivenValid - 1
    ) < 1e-12);
  }
});

test('only the two documented evolution lines are excluded', () => {
  const deck = [
    {name: 'Shadow Rider Calyrex VMAX', count: 4, type: 'Pokémon'},
    {name: 'Shadow Rider Calyrex V', count: 14, type: 'Pokémon'},
    {name: 'Psychic Energy', count: 42, type: 'Energy'}
  ];
  assert.deepEqual(counts(deck), {total: 60, basic: 14, evolutions: 4});
});

test('immutable printed 60 inventories and singleton DCE are sourced from repo', () => {
  const result = audit(path.join(__dirname, '..'));
  for (const [label, basics, evolutions] of [
    ['rank1-champion', 14, 4], ['hood-v1', 14, 4],
    ['temple-v1', 15, 3], ['new-moon-v1', 17, 2]
  ]) {
    assert.equal(result.contenders[label].total, 60, label);
    assert.equal(result.contenders[label].basic, basics, label);
    assert.equal(result.contenders[label].evolutions, evolutions, label);
  }
  for (const [label, expected] of [
    ['rank1-champion', 0.3750679602308215],
    ['hood-v1', 0.3750679602308215],
    ['temple-v1', 0.339457050798159],
    ['new-moon-v1', 0.2746278939309139]
  ]) {
    assert.ok(Math.abs(result.contenders[label].soloAfterAllRank26MulliganBonuses -
      expected) < 1e-12, label);
  }
  assert.equal(result.rank26DceInitiallyPrizedUnconditional, 0.1);
  assert.ok(Math.abs(result.rank26DceInitiallyPrizedGivenValidOpening -
    0.10077777379917645) < 1e-12);
  assert.ok(Math.abs(result.rank26DceAndTicketInitiallyPrizedGivenValidOpening -
    0.008606833848066566) < 1e-12);
});
