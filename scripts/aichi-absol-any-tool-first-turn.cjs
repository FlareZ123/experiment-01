'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  main: floatStoneSourceAudit,
  countCard,
  directGarbotoxinProbability
} = require('./absol-garbotoxin-direct-lock.cjs');

/**
 * A separate scope extension of the existing Float Stone-only exact calculation.
 * Muscle Band is an unrestricted Pokemon Tool: it also activates Garbotoxin,
 * though it does not grant free retreat.
 * @param {object[]} sourceRows
 * @param {{decks:object[]}} manifest
 * @returns {object[]}
 */
function addAnyToolRoutes(sourceRows, manifest) {
  return sourceRows.map(row => {
    const deck = manifest.decks.find(x => x.rank === row.rank);
    const muscleBand = countCard(deck, 'Muscle Band');
    const compatibleTools = row.floatStone + muscleBand;
    const counts = {
      basics: row.basics,
      trubbish: row.trubbish,
      garbodor: row.garbodor,
      floatStone: compatibleTools
    };
    const first = directGarbotoxinProbability({
      ...counts, enablers: row.boostShake
    });
    const second = directGarbotoxinProbability({
      ...counts, enablers: row.boostShake + row.wally
    });
    return {
      rank: row.rank,
      basicCount: row.basics,
      trubbish: row.trubbish,
      garbodor: row.garbodor,
      boostShake: row.boostShake,
      wally: row.wally,
      floatStone: row.floatStone,
      muscleBand,
      firstTurnGoingFirstFloatOnly: row.firstTurnGoingFirst,
      firstTurnGoingFirstAnyTool: first,
      firstTurnGoingSecondFloatOnly: row.firstTurnGoingSecond,
      firstTurnGoingSecondAnyTool: second
    };
  });
}

/** @returns {object} */
function main() {
  const source = path.resolve(__dirname, '../results/aichi-2026/full-decklists.json');
  const manifest = JSON.parse(fs.readFileSync(source, 'utf8'));
  return {
    schema: 'aichi-absol-any-compatible-tool-direct-v1',
    comparedTo: 'absol-garbotoxin-first-turn-natural-three-part-access',
    population: 'valid Basic opening seven, one normal draw, six randomized Prizes',
    necessaryCards: 'Trubbish, Boost Shake or permitted Wally, Float Stone or Muscle Band, unprized searchable Garbodor',
    unmodeled: 'All search/draw, bonus draws, opposing locks, attachment and evolution decisions, strategic opportunity costs',
    paperGameStrengthQualified: false,
    rows: addAnyToolRoutes(floatStoneSourceAudit().rows, manifest)
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(main(), null, 2) + '\n');
module.exports = {addAnyToolRoutes, main};
