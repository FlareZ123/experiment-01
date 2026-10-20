'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.join(__dirname, '../results/aichi-2026');

/** @param {string} filename @returns {any} */
function readJson(filename) {
  return JSON.parse(fs.readFileSync(path.join(base, filename), 'utf8'));
}

/** @param {string} name @returns {string} */
function normalizedName(name) {
  return name.replace(/^Basic (?=(Fire|Grass) Energy$)/, '')
    .replace(/^Battle Compressor Team Flare Gear$/, 'Battle Compressor');
}

/**
 * @param {number} row
 * @param {number} col
 * @param {number} quantity
 * @param {string} name
 * @returns {[number,number,number,string]}
 */
function cell(row, col, quantity, name) {
  assert.ok(Number.isSafeInteger(row) && row >= 1 && row <= 5);
  assert.ok(Number.isSafeInteger(col) && col >= 1 && col <= (row === 5 ? 6 : 8));
  assert.ok(Number.isSafeInteger(quantity) && quantity > 0 && quantity <= 4);
  return [row, col, quantity, normalizedName(name)];
}

/** @returns {Array<[number,number,number,string]>} */
function csvCells() {
  const lines = fs.readFileSync(path.join(base, 'agent48-rank28-photo-provisional-cells.csv'), 'utf8')
    .trim().split(/\r?\n/);
  assert.equal(lines.shift(), 'photo_row,photo_column,quantity,english_card_name');
  return lines.map(line => {
    const fields = /^(\d+),(\d+),(\d+),"([^"]+)"$/.exec(line);
    assert.ok(fields, `unrecognized original source-ledger CSV: ${line}`);
    return cell(Number(fields[1]), Number(fields[2]), Number(fields[3]), fields[4]);
  });
}

/**
 * @param {Array<[number,number,number,string]>} reference
 * @param {Array<[number,number,number,string]>} candidate
 * @returns {void}
 */
function requireSameLedger(reference, candidate) {
  assert.equal(reference.length, 38);
  assert.equal(candidate.length, 38);
  assert.equal(new Set(reference.map(r => r[0] + ':' + r[1])).size, 38);
  assert.equal(reference.reduce((sum, r) => sum + r[2], 0), 60);
  assert.deepEqual(candidate, reference);
}

test('four independent photo transcriptions retain identical 38 cells and sixty copies', () => {
  const photo = readJson('rank28-replica-photo-60-unverified.json');
  const source = readJson('rank28-replica-visual-60-candidate.json');
  const english = readJson('agent48-rank28-photo-mechanical-print-map.json');
  const original = photo.cardRows.map(c => cell(c.row, c.col, c.count, c.name));
  const second = source.cards.map(c => cell(c.row, c.column, c.quantity, c.name));
  const csv = csvCells();
  const mapping = english.cards.map((c, i) =>
    cell(csv[i][0], csv[i][1], csv[i][2], c.name));
  for (const other of [second, csv, mapping]) requireSameLedger(original, other);

  const { PHOTO } = require('../scripts/aichi-rank28-provisional-overlap.cjs');
  assert.deepEqual(PHOTO.map(([quantity, name], i) =>
    cell(original[i][0], original[i][1], quantity, name)), original);

  const byCell = new Map(original.map(r => [r[0] + ':' + r[1], r]));
  assert.deepEqual(byCell.get('4:1').slice(2), [2, 'Muscle Band']);
  assert.deepEqual(byCell.get('4:2').slice(2), [2, 'Professor Juniper']);
  assert.deepEqual(byCell.get('4:4').slice(2), [1, 'Raihan']);
  assert.deepEqual(byCell.get('4:8').slice(2), [1, 'Marnie']);
  assert.deepEqual(byCell.get('5:2').slice(2), [1, 'Path to the Peak']);

  assert.equal(source.approved_for_rank28_manifest, false);
  assert.equal(source.source.original_image_sha256,
    '3b23a6fb4daf9b1f537462d50611d6d2765bf0dc228338c3ddd0e41b97452cc9');
  assert.equal(english.forSimulation, false);
  const exactField = readJson('full-decklists.json');
  assert.equal(exactField.decks.length, 29);
  assert.equal(exactField.decks.some(d => d.rank === 28), false);
});

test('photo-source parity check fails closed on a one-card-name substitution', () => {
  const photo = readJson('rank28-replica-photo-60-unverified.json');
  const reference = photo.cardRows.map(c => cell(c.row, c.col, c.count, c.name));
  const bad = reference.map(r => r.slice());
  bad.find(r => r[0] === 4 && r[1] === 2)[3] = 'Gladion';
  assert.throws(() => requireSameLedger(reference, bad), assert.AssertionError);
});

/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  let value = 1;
  for (let i = 1; i <= k; i++) value = value * (n - i + 1) / i;
  return Math.round(value);
}

test('corrected five draw-Supporters restore photo opening-seven probability', () => {
  const photo = readJson('rank28-replica-photo-60-unverified.json');
  const cards = new Map(photo.cardRows.map(c => [normalizedName(c.name), c.count]));
  const draws = ['Professor Juniper', 'Iono', 'Marnie', "Lillie's Determination"];
  const D = draws.reduce((sum, name) => sum + (cards.get(name) || 0), 0);
  assert.equal(D, 5);
  const B = 14;
  const total = choose(60, 7);
  const pValid = 1 - choose(60 - B, 7) / total;
  const both = 1 - choose(60 - B, 7) / total - choose(60 - D, 7) / total
    + choose(60 - B - D, 7) / total;
  assert.ok(Math.abs(both / pValid - 0.4576031921625) < 1e-10);
  assert.ok(Math.abs(both - 0.394183654192) < 1e-10);
});
