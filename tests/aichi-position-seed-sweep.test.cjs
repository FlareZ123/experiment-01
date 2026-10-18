'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { expandPrintings } = require('../scripts/aichi-position-coupling.cjs');
const { shuffledIndices, sweepPositionalCoupling } =
  require('../scripts/aichi-position-seed-sweep.cjs');

const dir = path.join(__dirname, '../results/aichi-2026');
const source = JSON.parse(fs.readFileSync(path.join(dir, 'full-decklists.json'), 'utf8'));
const rows = [
  source.decks.find(row => row.rank === 1).cards,
  JSON.parse(fs.readFileSync(
    path.join(dir, 'candidate-hood-shadow-rider.json'), 'utf8')).cards,
  JSON.parse(fs.readFileSync(
    path.join(dir, 'candidate-temple-shadow-rider.json'), 'utf8')).cards
];
const printArrays = rows.map(expandPrintings);

test('v3 rank6 sample matches pinned source index shuffle', () => {
  assert.deepEqual(shuffledIndices(1509836216).slice(0, 15),
    [54, 23, 32, 25, 50, 40, 13, 10, 8, 2, 14, 16, 1, 57, 33]);
  assert.deepEqual([...shuffledIndices(995631139)].sort((a, b) => a - b),
    Array.from({length:60}, (_, i) => i));
});

test('v3 full seed schedule reveals source-order and maximal-alignment contrast', () => {
  const report = sweepPositionalCoupling(printArrays);
  assert.equal(report.seedsExamined, 12800);
  assert.deepEqual(report.pairs.map(pair => pair.source.matchingPositions),
    [28, 19, 38]);
  assert.deepEqual(report.pairs.map(pair => pair.aligned.matchingPositions),
    [55, 55, 56]);
  assert.deepEqual(report.pairs.map(pair => pair.sourceAllSevenCount),
    [46, 5, 393]);
  assert.deepEqual(report.pairs.map(pair => pair.alignedAllSevenCount),
    [6724, 6672, 7624]);
  assert.equal(report.actualGamesMeasured, 0);
  assert.equal(report.competitiveWinRateEvidence, false);
});

test('reduced schedule is deterministic and dimensions fail closed', () => {
  const first = sweepPositionalCoupling(printArrays, {rankCount: 1, repeats: 1});
  assert.equal(first.seedsExamined, 4);
  assert.deepEqual(first, sweepPositionalCoupling(printArrays,
    {rankCount: 1, repeats: 1}));
  assert.throws(() => sweepPositionalCoupling(printArrays, {repeats: 101}),
    /Invalid sweep dimensions/);
});
