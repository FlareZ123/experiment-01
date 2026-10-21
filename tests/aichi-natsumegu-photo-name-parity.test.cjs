'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/**
 * @template T
 * @param {string} filename
 * @returns {T}
 */
function json(filename) {
  return JSON.parse(fs.readFileSync(path.resolve(__dirname, filename), 'utf8'));
}

/**
 * @param {Array<{name:string,quantity?:number,count?:number}>} rows
 * @param {'count'|'quantity'} quantityKey
 * @returns {Map<string, number>}
 */
function multiset(rows, quantityKey) {
  const out = new Map();
  for (const row of rows) {
    const quantity = row[quantityKey];
    assert.ok(Number.isInteger(quantity) && quantity > 0);
    out.set(row.name, (out.get(row.name) || 0) + quantity);
  }
  return out;
}

/**
 * @param {Map<string, number>} a
 * @param {Map<string, number>} b
 * @returns {number}
 */
function nameOverlap(a, b) {
  let shared = 0;
  for (const [name, count] of a) {
    shared += Math.min(count, b.get(name) || 0);
  }
  return shared;
}

const photo = json('../results/aichi-2026/natsumegu-independent-photo-name-ledger-20261021.json');
const field = json('../results/aichi-2026/full-decklists.json');
const names = multiset(photo.cards, 'quantity');
const rank = number => field.decks.find(deck => deck.rank === number);

test('all 38 original grid cells are unique and all photographed badges sum to sixty', () => {
  assert.equal(photo.distinct_grid_cells, 38);
  assert.equal(photo.cards.length, 38);
  assert.equal(photo.total_copies, 60);
  assert.equal(photo.archived_photo_sha256,
    'bbfc196a6297d515692cc00ed4530541e3eb3be7c0afb4bd459dfa585fb650f7');

  const positions = photo.cards.map(card => `${card.row}:${card.column}`);
  assert.equal(new Set(positions).size, 38);

  const badgeSums = [1, 2, 3, 4].map(row =>
    photo.cards.filter(card => card.row === row)
      .reduce((sum, card) => sum + card.quantity, 0));
  assert.deepEqual(badgeSums, [14, 18, 12, 16]);
  assert.deepEqual(photo.row_copy_totals, badgeSums);
  assert.equal([...names.values()].reduce((a, b) => a + b, 0), 60);
});

test('photographed category counts and high-impact photographed cells remain distinct', () => {
  const categories = {};
  for (const card of photo.cards) {
    categories[card.category] = (categories[card.category] || 0) + card.quantity;
    assert.match(card.printing, /unverified/i);
  }
  assert.deepEqual(categories, photo.category_copy_totals);
  assert.deepEqual(categories, {
    'Pokémon': 20,
    Item: 17,
    'Pokémon Tool': 1,
    Supporter: 10,
    Stadium: 2,
    'Basic Energy': 7,
    'Special Energy': 3
  });

  const at = (row, column) => photo.cards.find(card =>
    card.row === row && card.column === column);
  assert.equal(at(3, 5).name, 'Megaton Blower');
  assert.equal(at(3, 6).name, 'Muscle Band');
  assert.equal(at(4, 4).name, 'Parallel City');
  assert.equal(at(4, 5).name, 'Path to the Peak');
  assert.equal(at(3, 9).name, "Professor's Research");
});

test('independent Natsumegu photo matches published rank21 60 by every name and count', () => {
  const published = rank(21);
  assert.equal(published.player, 'Shun Nakajima');
  const official = multiset(published.cards, 'count');
  assert.deepEqual([...names.entries()].sort(), [...official.entries()].sort());
  assert.equal(nameOverlap(names, official), 60);

  assert.equal(photo.rank21_name_multiset_comparison.name_level_shared_copies, 60);
  assert.deepEqual(photo.rank21_name_multiset_comparison.name_level_adds, []);
  assert.deepEqual(photo.rank21_name_multiset_comparison.name_level_removes, []);
});

test('name-match cannot be silently promoted into missing-rank registration', () => {
  const compared = field.decks.filter(deck => deck.archetype === 'Regidrago')
    .map(deck => ({ rank: deck.rank,
      overlap: nameOverlap(names, multiset(deck.cards, 'count')) }))
    .sort((a, b) => b.overlap - a.overlap);

  assert.deepEqual(compared.slice(0, 5), [
    { rank: 21, overlap: 60 },
    { rank: 14, overlap: 51 },
    { rank: 12, overlap: 50 },
    { rank: 10, overlap: 49 },
    { rank: 13, overlap: 49 }
  ]);

  assert.deepEqual(field.missing_full_lists.map(entry => entry.rank), [23, 25, 28]);
  assert.equal(photo.self_reported_swiss_rank, 16);
  assert.match(photo.status, /provisional/i);
  assert.equal(photo.rank21_name_multiset_comparison.scope.includes('not a Japanese collector-print match'), true);
});
