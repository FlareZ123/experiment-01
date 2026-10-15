'use strict';
const fs = require('node:fs');
const path = require('node:path');

const BASIC_ENERGIES = new Set([
  'Grass Energy', 'Fire Energy', 'Water Energy', 'Lightning Energy',
  'Psychic Energy', 'Fighting Energy', 'Darkness Energy', 'Metal Energy',
  'Fairy Energy'
]);

/**
 * Analyze Energy in published Aichi lists by printed card name.
 * This is a deck census, not an attack-availability or win-rate model.
 * @param {{decks:Array<{rank:number,archetype:string,cards:Array<{name:string,category:string,count:number}>}>}} manifest
 * @returns {object} Rank-level energy counts and source-level totals.
 */
function auditEnergy(manifest) {
  if (!manifest || !Array.isArray(manifest.decks)) {
    throw new TypeError('Expected a manifest with a decks array');
  }
  const decks = manifest.decks.map(deck => {
    const totalCards = deck.cards.reduce((sum, card) => sum + card.count, 0);
    if (totalCards !== 60) throw new Error('Non-60-card source list at rank ' + deck.rank);
    const energy = deck.cards.filter(card => card.category === 'Energy');
    const basicSlots = energy.filter(card => BASIC_ENERGIES.has(card.name))
      .reduce((sum, card) => sum + card.count, 0);
    const specialSlots = energy.filter(card => !BASIC_ENERGIES.has(card.name))
      .reduce((sum, card) => sum + card.count, 0);
    return {
      rank: deck.rank, archetype: deck.archetype,
      mode: basicSlots === 0 ? 'special-only' : specialSlots === 0 ? 'basic-only' : 'mixed',
      totalEnergySlots: basicSlots + specialSlots, basicSlots, specialSlots,
      energy: energy.map(card => ({ name: card.name, count: card.count }))
    };
  }).sort((a, b) => a.rank - b.rank);
  return {
    scope: 'Published Aichi 2026 Top 32 Energy composition; missing lists excluded',
    publishedDecks: decks.length,
    totalEnergySlots: decks.reduce((sum, d) => sum + d.totalEnergySlots, 0),
    basicEnergySlots: decks.reduce((sum, d) => sum + d.basicSlots, 0),
    specialEnergySlots: decks.reduce((sum, d) => sum + d.specialSlots, 0),
    specialOnlyRanks: decks.filter(d => d.mode === 'special-only').map(d => d.rank),
    basicOnlyRanks: decks.filter(d => d.mode === 'basic-only').map(d => d.rank),
    mixedRanks: decks.filter(d => d.mode === 'mixed').map(d => d.rank),
    decksWithAtLeastFourSpecial: decks.filter(d => d.specialSlots >= 4).length,
    decksWithAnySpecial: decks.filter(d => d.specialSlots > 0).length,
    decks
  };
}

if (require.main === module) {
  const file = path.resolve(__dirname, '../results/aichi-2026/full-decklists.json');
  console.log(JSON.stringify(auditEnergy(JSON.parse(fs.readFileSync(file, 'utf8'))), null, 2));
}

module.exports = { auditEnergy, BASIC_ENERGIES };
