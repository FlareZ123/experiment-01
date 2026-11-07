'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const official = require('../results/aichi-2026/official-rank1-deck-code.json');
const dataset = require('../results/aichi-2026/full-decklists.json');

test('Rank 1 repository list matches all 60 cards in the official Japanese deck recipe', () => {
  const rank1 = dataset.decks.find(deck => deck.rank === official.rank);
  assert.ok(rank1, 'rank 1 must exist in the opponent dataset');
  assert.equal(rank1.player, official.player);

  const officialTotal = official.cards.reduce((sum, card) => sum + card.count, 0);
  const actualTotal = rank1.cards.reduce((sum, card) => sum + card.count, 0);
  assert.equal(officialTotal, 60);
  assert.equal(actualTotal, 60);
  assert.equal(official.cards.length, 33);
  assert.equal(rank1.cards.length, 33);

  const categoryTotals = official.cards.reduce((totals, card) => {
    totals[card.category] += card.count;
    return totals;
  }, { pokemon: 0, trainer: 0, energy: 0 });
  assert.deepEqual(categoryTotals, official.categories);

  const expected = official.cards
    .map(card => [card.english_name, card.count])
    .sort(([a], [b]) => a.localeCompare(b));
  const actual = rank1.cards
    .map(card => [card.name, card.count])
    .sort(([a], [b]) => a.localeCompare(b));
  assert.deepEqual(actual, expected);
});
