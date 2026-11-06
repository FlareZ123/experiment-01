'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const {
  choose, exactRemainingTarget, analyzeOriginals, ELIGIBLE_PRINTINGS,
  SOURCE, BASICS
} = require('../simulation/evaluation/agent40-artazon-original-deck-target.cjs');

/** @param {string} file @returns {object} */
function load(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'));
}

test('BigInt combinations stay exact, including impossible draws', () => {
  assert.equal(choose(60, 6), 50063860n);
  assert.equal(choose(60, 7), 386206920n);
  assert.equal(choose(8, 9), 0n);
  console.log('BigInt binomial arithmetic checked');
});

test('independent exhaustive toy-deck fractions', () => {
  // These fractions were obtained independently by enumerating every legal
  // opener, Prize subset, and ordinary-draw subset in Python.
  const cases = [
    { n: 8, h: 2, prizes: 1, draws: 1, b: 3, k: 1, num: 11n, den: 27n },
    { n: 9, h: 3, prizes: 2, draws: 1, b: 4, k: 2, num: 41n, den: 74n },
    { n: 10, h: 3, prizes: 1, draws: 2, b: 3, k: 3, num: 66n, den: 85n },
    { n: 10, h: 3, prizes: 2, draws: 2, b: 7, k: 4, num: 3466n, den: 4165n }
  ];
  for (const x of cases) {
    const got = exactRemainingTarget(x.n, x.h, x.prizes, x.draws, x.b, x.k);
    assert.equal(got.numerator, x.num);
    assert.equal(got.denominator, x.den);
    console.log('Exact toy target retention', x.n, x.b, x.k, got.percent);
  }
});

test('no eligible Basic guarantees no Artazon deck target', () => {
  const zero = exactRemainingTarget(60, 7, 6, 2, 4, 0);
  assert.equal(zero.numerator, 0n);
  assert.equal(zero.percent, 0);
});

test('all source printings are explicit, and all 29 source ranks are accounted for', () => {
  const result = analyzeOriginals(load(SOURCE), load(BASICS));
  assert.equal(ELIGIBLE_PRINTINGS.size, 39);
  assert.equal(result.known, 29);
  assert.equal(result.eligibleRanks, 25);
  assert.deepEqual(result.missing, [23, 25, 28]);
  assert.deepEqual(result.rows.filter(x => !x.eligibleBasics).map(x => x.rank), [5, 6, 24, 29]);
  assert.ok(Math.abs(result.equalRankMeanPercent - 85.27824862273712) < 1e-10);
  assert.ok(Math.abs(result.eligibleRankMeanPercent - 98.92276840237506) < 1e-10);
  assert.ok(Math.abs(result.rows.find(x => x.rank === 11).percent - 92.95215004162351) < 1e-10);
  assert.ok(Math.abs(result.rows.find(x => x.rank === 1).percent - 98.494906456) < 1e-7);
  console.log('Field legal-open sources:', result.known);
  console.log('Artazon eligible-source ranks:', result.eligibleRanks);
  console.log('Equal-rank theoretical remaining-deck target rate %:', result.equalRankMeanPercent);
});

test('model rejects invalid category margins and impossible opening', () => {
  assert.throws(() => exactRemainingTarget(60, 7, 6, 2, 0, 0));
  assert.throws(() => exactRemainingTarget(60, 7, 6, 2, 4, 5));
  assert.throws(() => exactRemainingTarget(9, 7, 6, 2, 4, 2));
  console.log('Invalid physical-card domains rejected');
});
