'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {inspectDeck, lightningUnits, packetUpperBound, prizeUpperBound} =
  require('./aichi-raichu-energy-capacity.cjs');

/**
 * Inventory-only maximum for an attacker receiving up to five Energy cards
 * from one Extra Energy Bomb plus one already-attached Energy from hand.
 * Assumes all selected cards are accessible and eligible for their respective
 * zones. The active Prize state is assessed at attack time, after self-KO.
 *
 * @param {{name:string,count:number}[]} energies
 * @param {{ownPrizes:number,opponentPrizes:number,temple:boolean}} state
 * @returns {{bombOnly:number,manualPlusBomb:number,manual:string|null,bomb:string[]}}
 */
function manualPlusBombFrontier(energies, state) {
  const bombOnly = packetUpperBound(energies, state, 5);
  const copies = [];
  for (const card of energies) {
    for (let i = 0; i < card.count; i++) copies.push(card.name);
  }
  copies.sort((a, b) => lightningUnits(b, state) - lightningUnits(a, state) ||
    a.localeCompare(b, 'en'));
  const chosen = copies.slice(0, 6);
  return {
    bombOnly,
    manualPlusBomb: chosen.reduce((total, name) => total + lightningUnits(name, state), 0),
    manual: chosen[0] || null,
    bomb: chosen.slice(1)
  };
}

/**
 * Source-locked conditional frontiers. These quantities represent packet
 * capacity and hypothetical Bench knockouts, never simulated games.
 * @returns {Array<object>}
 */
function publishedRaichuFrontiers() {
  const source = JSON.parse(fs.readFileSync(path.join(__dirname,
    '../results/aichi-2026/full-decklists.json'), 'utf8'));
  const state = {ownPrizes: 6, opponentPrizes: 4, temple: false};
  const mixedBenched = [
    {id: 'Shadow Rider VMAX', hp: 320, damage: 0, prizes: 3, bonusDamage: 30},
    {id: 'Shadow Rider V', hp: 210, damage: 0, prizes: 2, bonusDamage: 30}
  ];
  return [4, 17].map(rank => {
    const deck = source.decks.find(d => d.rank === rank);
    if (!deck || deck.archetype !== 'Raichu Electrode Combo') {
      throw new Error('Missing published Raichu opponent rank ' + rank);
    }
    inspectDeck(deck);
    const energyCards = deck.cards.filter(c => c.category === 'Energy');
    const budget = manualPlusBombFrontier(energyCards, state);
    return {
      rank, player: deck.player, ...budget,
      mixedBenchBombOnly: prizeUpperBound(budget.bombOnly, mixedBenched),
      mixedBenchManualPlusBomb: prizeUpperBound(budget.manualPlusBomb, mixedBenched)
    };
  });
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(publishedRaichuFrontiers(), null, 2) + '\n');
}
module.exports = {manualPlusBombFrontier, publishedRaichuFrontiers};
