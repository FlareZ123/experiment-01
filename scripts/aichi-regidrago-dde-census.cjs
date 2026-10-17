'use strict';

const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const path = require('node:path');

/**
 * Count Double Dragon Energy source printings in the exact published Aichi
 * 2026 Top-32 Regidrago source decks. Missing full lists remain excluded.
 * This is a card-pool census, with no inference about gameplay quality.
 *
 * @returns {object}
 */
function summarizeRegidragoSourceEnergy() {
  const file = path.resolve(__dirname, '../results/aichi-2026/full-decklists.json');
  const field = JSON.parse(readFileSync(file, 'utf8'));
  assert.equal(field.published_deck_count, field.decks.length);
  const rows = field.decks.filter(deck => deck.archetype === 'Regidrago')
    .sort((a, b) => a.rank - b.rank)
    .map(deck => {
      const total = deck.cards.reduce((sum, row) => sum + row.count, 0);
      assert.equal(total, 60, 'Source deck is not exactly 60: rank ' + deck.rank);
      const energy = deck.cards.filter(row => row.category === 'Energy');
      const energyTotal = energy.reduce((sum, row) => sum + row.count, 0);
      const doubleDragon = energy.filter(row => row.name === 'Double Dragon Energy');
      assert.ok(doubleDragon.every(row =>
        row.printing.set === 'ROS' && String(row.printing.number) === '97'),
      'DDE printing changed for rank ' + deck.rank);
      const dde = doubleDragon.reduce((sum, row) => sum + row.count, 0);
      assert.ok(dde <= 4 && dde >= 0, 'DDE copy count out of range');
      return {
        rank: deck.rank, player: deck.player,
        energyCards: energyTotal, doubleDragonCards: dde,
        grassCards: energy.filter(row => row.name === 'Grass Energy')
          .reduce((sum, row) => sum + row.count, 0),
        fireCards: energy.filter(row => row.name === 'Fire Energy')
          .reduce((sum, row) => sum + row.count, 0)
      };
    });
  const totalEnergyCards = rows.reduce((sum, row) => sum + row.energyCards, 0);
  const totalDoubleDragonCards = rows.reduce((sum, row) =>
    sum + row.doubleDragonCards, 0);
  return {
    field: 'Aichi Open League 2026 Top32 paper Expanded published source decks',
    sourceDeckCount: field.decks.length,
    missingFullListRanks: field.missing_full_lists.map(row =>
      typeof row === 'number' ? row : row.rank).sort((a, b) => a - b),
    publishedRegidragoDeckCount: rows.length,
    totalEnergyCards, totalDoubleDragonCards,
    fractionOfRegidragoEnergyCards: totalDoubleDragonCards + '/' + totalEnergyCards,
    fourCopyDdeLists: rows.filter(row => row.doubleDragonCards === 4).length,
    rows,
    caution: 'Source manifest descriptive census only. No inference about policy, paper legality of unspecified conversions, matchup strength or missing source 60s.'
  };
}
if (require.main === module) {
  process.stdout.write(JSON.stringify(summarizeRegidragoSourceEnergy(), null, 2) + '\n');
}
module.exports = {summarizeRegidragoSourceEnergy};
