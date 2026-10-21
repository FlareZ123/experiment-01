'use strict';

const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const path = require('node:path');

const VERSION = 'agent7-published-aichi-mobility-roster-v1';

/**
 * These five names have printed effects that can conditionally bring a
 * charged Benched Pokemon to the Active Spot without paying the originally
 * forced Active Pokemon's printed Retreat Cost.
 *
 * This is deliberately a conservative printing-name inventory. It omits
 * searchers, recycle effects, other conditional card-specific Abilities,
 * attack-based mobility, and Scoop Up Cyclone's separate bounce mechanic.
 * It is never evidence that a card is currently in hand or legally playable.
 */
const NAMES = Object.freeze([
  'Guzma', 'Float Stone', 'Escape Rope', 'Prime Catcher', 'Jet Energy'
]);

/**
 * @typedef {{rank:number,archetype:string,cards:Array<{count:number,name:string}>}} PublishedDeck
 * @param {PublishedDeck[]} decks Exact published 60-card inventories.
 * @returns {{version:string,rows:object[],published:number,withRoute:number,copyTotals:object}}
 */
function census(decks) {
  assert.ok(Array.isArray(decks));
  const ranks = new Set();
  const rows = decks.map(deck => {
    assert.ok(Number.isInteger(deck.rank) && deck.rank > 0);
    assert.ok(!ranks.has(deck.rank), 'Duplicate rank ' + deck.rank);
    ranks.add(deck.rank);
    assert.ok(Array.isArray(deck.cards));
    const length = deck.cards.reduce((sum, card) => {
      assert.ok(typeof card.name === 'string' &&
        Number.isInteger(card.count) && card.count > 0);
      return sum + card.count;
    }, 0);
    assert.equal(length, 60, 'Rank ' + deck.rank + ' is not 60 cards');
    const counts = Object.fromEntries(NAMES.map(name => [
      name,
      deck.cards.reduce((sum, card) =>
        sum + (card.name === name ? card.count : 0), 0)
    ]));
    const copies = Object.values(counts).reduce((sum, count) => sum + count, 0);
    return {rank:deck.rank, archetype:deck.archetype, counts, copies};
  }).sort((a, b) => a.rank - b.rank);
  const copyTotals = Object.fromEntries(NAMES.map(name => [
    name, rows.reduce((sum, row) => sum + row.counts[name], 0)
  ]));
  return {
    version: VERSION,
    rows,
    published: rows.length,
    withRoute: rows.filter(row => row.copies > 0).length,
    copyTotals
  };
}

/**
 * @returns {object} Deterministic census of the checked-in published roster.
 */
function publishedCensus() {
  const file = path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json');
  const dataset = JSON.parse(readFileSync(file, 'utf8'));
  assert.equal(dataset.published_deck_count, dataset.decks.length);
  const results = census(dataset.decks);
  return {
    ...results,
    input: 'results/aichi-2026/full-decklists.json',
    missingRanks: dataset.missing_full_lists.map(row => row.rank)
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(publishedCensus(), null, 2) + '\n');
}

module.exports = {VERSION, NAMES, census, publishedCensus};
