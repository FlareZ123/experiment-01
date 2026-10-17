'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const source = require('../results/als/new-moon-perfection-source-60.json');
const mapped = require('../results/als/new-moon-english-equivalents.json');

/** @param {string} relative */
function json(relative) {
  return JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
}

/** @param {string} id */
function englishCard(id) {
  const setId = id.split('-')[0];
  const cards = json('resources/cards/en/' + setId + '.json');
  const card = cards.find((entry) => entry.id === id);
  assert.ok(card, 'Missing English card ' + id);
  return card;
}

/** @param {string} text */
function championNameCounts(text) {
  const counts = new Map();
  for (const line of text.split(/\r?\n/)) {
    const match = /^(\d+) (.+)$/.exec(line);
    if (match) counts.set(match[2], Number(match[1]));
  }
  return counts;
}

test('33 positions preserve the 60-card photographed source, including classes', () => {
  assert.equal(mapped.entries.length, 33);
  assert.equal(source.entries.length, 33);
  assert.equal(mapped.japanese_printings_verified, false);
  const byPosition = new Map(source.entries.map((s) => [
    s.source_grid_row + ':' + s.source_grid_column, s,
  ]));
  const totals = { 'Pokémon': 0, Trainer: 0, Energy: 0 };
  for (const entry of mapped.entries) {
    const s = byPosition.get(entry.source_grid_row + ':' + entry.source_grid_column);
    assert.ok(s, 'Unrecognized source position');
    assert.equal(entry.name_en, s.name_en);
    assert.equal(entry.count, s.count);
    totals[s.type] += entry.count;
    byPosition.delete(entry.source_grid_row + ':' + entry.source_grid_column);
  }
  assert.equal(byPosition.size, 0);
  assert.deepEqual(totals, { 'Pokémon': 19, Trainer: 35, Energy: 6 });
  assert.equal(Object.values(totals).reduce((a, b) => a + b), 60);
});

test('every English-equivalent print exists with matching card kind and identity', () => {
  const sourceByPosition = new Map(source.entries.map((s) => [
    s.source_grid_row + ':' + s.source_grid_column, s,
  ]));
  for (const e of mapped.entries) {
    const card = englishCard(e.id);
    const s = sourceByPosition.get(e.source_grid_row + ':' + e.source_grid_column);
    assert.equal(card.supertype, s.type, e.id);
    assert.equal(card.name, mapped.english_name_aliases[e.name_en] || e.name_en, e.id);
    assert.ok(e.count > 0 && Number.isInteger(e.count));
  }
});

test('ability-specific lines use the intended variants, not homonymous cards', () => {
  for (const [name, anchor] of Object.entries(mapped.effect_anchors)) {
    const matches = mapped.entries.filter((e) => e.name_en === name);
    assert.equal(matches.length, 1, name);
    const card = englishCard(matches[0].id);
    const printed = [...(card.abilities || []), ...(card.attacks || [])];
    assert.ok(printed.some((v) => v.name === anchor), name + ' lacks ' + anchor);
  }
  assert.equal(mapped.entries.find((e) => e.name_en === 'Unown').id, 'xy7-30');
  assert.equal(mapped.entries.find((e) => e.name_en === 'Solrock').id, 'sm7-62');
  assert.equal(mapped.entries.find((e) => e.name_en === 'Duskull').id, 'sv6pt5-18');
  const secretBox = englishCard(mapped.entries.find((e) => e.name_en === 'Secret Box').id);
  assert.ok(secretBox.subtypes.includes('ACE SPEC'));
  assert.equal(mapped.entries.filter((e) => englishCard(e.id).subtypes.includes('ACE SPEC')).reduce((n, e) => n + e.count, 0), 1);
});

test('English print mapping is fingerprinted in photographic grid order', () => {
  const rows = mapped.entries.map((e) =>
    e.source_grid_row + ':' + e.source_grid_column + '|' + e.count + '|' + e.id
  );
  const fingerprint = crypto.createHash('sha256').update(rows.join('\n') + '\n').digest('hex');
  assert.equal(fingerprint, mapped.english_equivalent_cards_sha256);
  assert.deepEqual(mapped.entries.map((e) => [e.source_grid_row, e.source_grid_column]),
    [...mapped.entries].sort((a, b) =>
      a.source_grid_row - b.source_grid_row || a.source_grid_column - b.source_grid_column
    ).map((e) => [e.source_grid_row, e.source_grid_column]));
});

test('this candidate is 40 name-level card slots from the champion baseline', () => {
  const champion = championNameCounts(fs.readFileSync(path.join(root, 'results/aichi-2026/benchmark-shadow-rider.md'), 'utf8'));
  const candidate = new Map(mapped.entries.map((e) =>
    [e.name_en === 'Basic Psychic Energy' ? 'Psychic Energy' : e.name_en, e.count]
  ));
  const shared = [...candidate].reduce((sum, [name, count]) =>
    sum + Math.min(count, champion.get(name) || 0), 0
  );
  assert.equal(shared, 20);
  assert.equal(60 - shared, 40);
});
