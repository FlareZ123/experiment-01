'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * Count printed Forest Seal Stone SIT 156 copies in the source-verified Aichi
 * 2026 Top 32 published lists, without estimating in-game power usage.
 * @param {object} manifest Parsed provenance-bearing manifest.
 * @returns {{publishedDecks:number,affectedDecks:number,copies:number,ranks:number[],cardsByRank:object[]}}
 */
function forestSealCensus(manifest) {
  const cardsByRank = manifest.decks.map(deck => ({
    rank: deck.rank,
    copies: deck.cards.filter(card => card.name === 'Forest Seal Stone' &&
      card.printing?.set === 'SIT' &&
      String(card.printing.number) === '156')
      .reduce((count, card) => count + card.count, 0)
  })).filter(row => row.copies > 0);
  return {
    publishedDecks: manifest.decks.length,
    affectedDecks: cardsByRank.length,
    copies: cardsByRank.reduce((sum, row) => sum + row.copies, 0),
    ranks: cardsByRank.map(row => row.rank),
    cardsByRank
  };
}

/** @returns {ReturnType<typeof forestSealCensus>} Snapshot of published sources. */
function runCensus() {
  const manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'), 'utf8'));
  return forestSealCensus(manifest);
}

if (require.main === module) console.log(JSON.stringify(runCensus(), null, 2));
module.exports = { forestSealCensus, runCensus };
