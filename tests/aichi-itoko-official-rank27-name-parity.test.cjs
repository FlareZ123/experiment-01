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
 * @param {Array<{english_name?:string,name?:string,quantity?:number,count?:number}>} rows
 * @param {'english_name'|'name'} key
 * @param {'quantity'|'count'} qty
 * @returns {Map<string,number>}
 */
function copies(rows, key, qty) {
  const bag = new Map();
  for (const row of rows) {
    assert.equal(typeof row[key], 'string');
    assert.ok(Number.isSafeInteger(row[qty]) && row[qty] > 0);
    bag.set(row[key], (bag.get(row[key]) || 0) + row[qty]);
  }
  return bag;
}

/**
 * @param {Map<string,number>} source
 * @param {Map<string,number>} target
 * @returns {number}
 */
function overlap(source, target) {
  let shared = 0;
  for (const [name, count] of source) {
    shared += Math.min(count, target.get(name) || 0);
  }
  return shared;
}

const source = json('../results/aichi-2026/itoko-public-official-saveddeck-japanese-print60-unassigned-20261021.json');
const field = json('../results/aichi-2026/full-decklists.json');
const inventoried = copies(source.entries, 'english_name', 'quantity');
const deck = rank => field.decks.find(d => d.rank === rank);
const official = copies(deck(27).cards, 'name', 'count');

test('official Japanese saved-list evidence has exactly 37 distinct print IDs and 60 copies', () => {
  assert.equal(source.entries.length, 37);
  assert.equal(source.number_of_distinct_japanese_print_ids, 37);
  assert.equal(source.total_copies, 60);
  assert.equal(new Set(source.entries.map(e => e.japanese_card_id)).size, 37);
  assert.equal(inventoried.size, 37);
  assert.equal([...inventoried.values()].reduce((n, k) => n + k, 0), 60);
  assert.match(source.raw_official_html_sha256, /^[a-f0-9]{64}$/);
  assert.equal(source.artifact_zip_sha256,
    'ac5aa9ddd5f6b9de4cbb229180cb528ded447012f515fcdc1c88982a0b0c94e5');
});

test('preserve Japanese print identifiers and exact section-level physical counts', () => {
  const sections = new Set(['deck_pke','deck_gds','deck_tool',
    'deck_tech','deck_sup','deck_sta','deck_ene','deck_ajs']);
  const counts = { pokemon: 0, trainer: 0, energy: 0 };
  for (const e of source.entries) {
    assert.ok(sections.has(e.section));
    assert.ok(Number.isSafeInteger(e.japanese_card_id) && e.japanese_card_id > 0);
    assert.match(e.japanese_set, /^\S+$/);
    assert.ok(e.japanese_name.length > 0);
    if (e.section === 'deck_pke') counts.pokemon += e.quantity;
    else if (e.section === 'deck_ene') counts.energy += e.quantity;
    else counts.trainer += e.quantity;
  }
  assert.deepEqual(counts, {pokemon:20, trainer:30, energy:10});
  assert.deepEqual(counts, source.category_counts);
});

test('exact name-multiset equality holds for published rank27, with no name replacement', () => {
  assert.equal(deck(27).player, 'Yuya Nagatsuma');
  assert.equal(inventoried.size, official.size);
  assert.deepEqual([...inventoried.entries()].sort(), [...official.entries()].sort());
  assert.equal(overlap(inventoried, official), 60);
  assert.equal(source.ranked_field_name_inventory_comparison.name_level_shared_copies, 60);
  assert.equal(source.ranked_field_name_inventory_comparison.matched_published_rank, 27);
});

test('source uniqueness and unverified attribution are kept separate', () => {
  const ranks = field.decks.filter(d => d.archetype === 'Regidrago').map(d => ({
    rank: d.rank,
    shared: overlap(inventoried, copies(d.cards, 'name', 'count'))
  })).sort((a,b) => b.shared - a.shared);
  assert.deepEqual(ranks.slice(0,5), [
    {rank:27,shared:60},
    {rank:12,shared:54},
    {rank:20,shared:50},
    {rank:21,shared:49},
    {rank:14,shared:48}
  ]);
  assert.equal(source.official_final_rank_authenticated, false);
  assert.equal(source.player_civil_identity_authenticated, false);
  assert.equal(source.event_registered_inventory_authenticated, false);
  assert.equal(source.all_printings_paper_legality_verified, false);
  assert.equal(source.source_field_membership_permitted, false);
  assert.deepEqual(field.missing_full_lists.map(x => x.rank), [23,25,28]);
  assert.equal(source.competitive_games_qualified, 0);
});
