'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {decks} = require('../results/aichi-2026/full-decklists.json');
const sets = require('../resources/sets/en.json');

/**
 * Resolves a displayed set code and collector number to exact local print
 * when available. Returns null for missing promotional printings.
 *
 * @param {string} code
 * @param {string} number
 * @param {string} name
 * @returns {object|null}
 */
function resolvePrintedPokemon(code, number, name) {
  for (const set of sets.filter(item => item.ptcgoCode === code)) {
    const jsonPath = path.resolve(__dirname, '../resources/cards/en', set.id + '.json');
    if (!fs.existsSync(jsonPath)) continue;
    const card = require(jsonPath).find(item =>
      item.id === set.id + '-' + number && item.name === name);
    if (card) return card;
  }
  return null;
}

/** @param {object} card @returns {boolean} */
function grassWeak(card) {
  return (card.weaknesses || []).some(row => row.type === 'Grass');
}

/** @param {object} card @returns {number} */
function printedPrizeValue(card) {
  if ((card.rules || []).some(rule => rule.includes('takes 3 Prize cards'))) return 3;
  if ((card.rules || []).some(rule => rule.includes('takes 2 Prize cards'))) return 2;
  return 1;
}

/** Paper-printing source census, without games or any card synergy assumption. */
function main() {
  const entries = new Map();
  for (const deck of decks) {
    for (const entry of deck.cards.filter(card => card.category === 'Pokémon')) {
      const set = entry.printing?.set;
      const number = entry.printing?.number;
      const key = [set, number, entry.name].join('|');
      if (!entries.has(key)) entries.set(key, {key, set, number,
        name:entry.name, slots:0, ranks:[]});
      const row = entries.get(key);
      row.slots += entry.count;
      row.ranks.push({rank:deck.rank, copies:entry.count});
    }
  }
  const missing = [];
  const grassWeakPrinted = [];
  for (const entry of entries.values()) {
    const printed = resolvePrintedPokemon(entry.set, entry.number, entry.name);
    if (!printed) {
      missing.push({key:entry.key, ranks:entry.ranks.map(row => row.rank)});
      continue;
    }
    if (!grassWeak(printed)) continue;
    grassWeakPrinted.push({
      ...entry, hp:Number(printed.hp), prizeValue:printedPrizeValue(printed)
    });
  }
  const multiPrize = grassWeakPrinted.filter(row => row.prizeValue >= 2);
  const relevantRanks = [...new Set(multiPrize.flatMap(row =>
    row.ranks.map(rank => rank.rank)))].sort((a,b) => a-b);
  const sourceSlots = multiPrize.reduce((sum,row) => sum + row.slots, 0);
  return {
    schema:'aichi-exact-print-grass-weak-multi-prize-census-v1',
    publishedDecks:decks.length,
    distinctPrintedPokemon:entries.size,
    resolvedPrintedPokemon:entries.size-missing.length,
    missing, grassWeakPrinted, multiPrize,
    relevantRanks, sourceSlots,
    qualifiedForCompetitiveInference:false
  };
}

module.exports = {resolvePrintedPokemon,grassWeak,printedPrizeValue,main};
if (require.main === module) {
  process.stdout.write(JSON.stringify(main(), null, 2) + '\n');
}
