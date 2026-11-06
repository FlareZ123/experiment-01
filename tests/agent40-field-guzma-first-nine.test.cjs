'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  choose, exactNaturalGuzmaSighting, analyzeOriginalField, SOURCE, BASICS
} = require('../simulation/evaluation/agent40-field-guzma-first-nine.cjs');

test('integer binomial identities', () => {
  assert.equal(choose(60, 0), 1n);
  assert.equal(choose(60, 7), 386206920n);
  assert.equal(choose(60, 61), 0n);
  assert.equal(choose(53, 2), 1378n);
});

test('zero direct Guzma copies imply zero sightings', () => {
  for (const seen of [7, 8, 9]) {
    const result = exactNaturalGuzmaSighting(0, 13, seen);
    assert.equal(result.numerator, 0n);
    assert.equal(result.denominator, 1n);
  }
});

test('rank6 source first-eight exact matches earlier independent audit', () => {
  const result = exactNaturalGuzmaSighting(3, 4, 8);
  assert.equal(result.numerator, 1257173n);
  assert.equal(result.denominator, 3857238n);
});

test('rank6 first-nine independent historical exact fraction', () => {
  const result = exactNaturalGuzmaSighting(3, 4, 9);
  assert.equal(result.numerator, 804101n);
  assert.equal(result.denominator, 2204136n);
});

test('rank1 single-Guzma case accounts for Basic-valid opening', () => {
  const result = exactNaturalGuzmaSighting(1, 14, 9);
  assert.equal(result.numerator, 38604509n);
  assert.equal(result.denominator, 267153920n);
});

test('source inventory and Basic snapshot reproduce all 29 known ranks', () => {
  const root = path.resolve(__dirname, '..');
  const field = JSON.parse(fs.readFileSync(path.join(root, SOURCE), 'utf8'));
  const basics = JSON.parse(fs.readFileSync(path.join(root, BASICS), 'utf8'));
  const result = analyzeOriginalField(field, basics);
  assert.equal(result.known, 29);
  assert.deepEqual(result.missing, [23, 25, 28]);
  assert.equal(result.guzmaRanks, 25);
  assert.equal(result.guzmaCopies, 48);
  assert.deepEqual(result.zeroGuzmaRanks, [4, 17, 26, 31]);
  assert.equal(result.rows.find(row => row.rank === 6).percent,
    exactNaturalGuzmaSighting(3, 4).percent);
  assert.ok(Math.abs(result.equalRankMeanPercent - 22.026653283442894) < 1e-10);
});

test('fail closed on absent original sources or a corrupted sixty', () => {
  assert.throws(() => analyzeOriginalField({decks: [], missing_full_lists: []}, {ranks: []}));
  assert.throws(() => exactNaturalGuzmaSighting(2, 0));
  assert.throws(() => exactNaturalGuzmaSighting(60, 4));
});
