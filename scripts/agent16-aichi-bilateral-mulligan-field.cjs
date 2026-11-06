'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { bilateralBonus } = require('./agent16-bilateral-mulligan-bonus.cjs');

/** @param {string} name @returns {string} */
function normalizeName(name) {
  return name.replaceAll('◇', '♢');
}

/**
 * Build a Pokémon Basic/evolution name index from the bundled English card pool.
 * A conflicting printed stage for a source name is deliberately reported.
 * @param {string} cardsDir Path to resources/cards/en.
 * @returns {Map<string, Set<boolean>>}
 */
function stageIndex(cardsDir) {
  const stages = new Map();
  for (const file of fs.readdirSync(cardsDir).filter(file => file.endsWith('.json')).sort()) {
    const cards = JSON.parse(fs.readFileSync(path.join(cardsDir, file), 'utf8'));
    assert.ok(Array.isArray(cards), 'Card set must be an array: ' + file);
    for (const card of cards) {
      if (card.supertype !== 'Pokémon') continue;
      const name = normalizeName(card.name);
      const eligible = (card.subtypes ?? []).includes('Basic');
      if (!stages.has(name)) stages.set(name, new Set());
      stages.get(name).add(eligible);
    }
  }
  return stages;
}

/**
 * Verify each actual source Pokémon stage against the source card pool.
 * @param {object} original Published original 29-deck manifest.
 * @param {Map<string, Set<boolean>>} stages Card name -> observed Basic statuses.
 * @returns {Array<{rank:number,archetype:string,basics:number,pokemon:number}>}
 */
function originalBasicCensus(original, stages) {
  assert.equal(original.published_deck_count, 29);
  assert.equal(original.decks.length, 29);
  const knownRanks = new Set();
  const source = [];
  for (const deck of original.decks) {
    assert.ok(Number.isInteger(deck.rank) && deck.rank >= 1 && deck.rank <= 32);
    assert.ok(!knownRanks.has(deck.rank), 'Duplicate rank ' + deck.rank);
    knownRanks.add(deck.rank);
    assert.equal(deck.cards.reduce((total, card) => total + card.count, 0), 60,
      'Source rank ' + deck.rank + ' is not exactly 60 cards');
    let basics = 0;
    let pokemon = 0;
    for (const card of deck.cards) {
      if (card.category !== 'Pokémon') continue;
      assert.ok(Number.isInteger(card.count) && card.count > 0);
      pokemon += card.count;
      const statuses = stages.get(normalizeName(card.name));
      assert.ok(statuses, 'Unknown printed Pokémon name ' + card.name + ' rank ' + deck.rank);
      assert.equal(statuses.size, 1, 'Printed stage varies for ' + card.name);
      if (statuses.has(true)) basics += card.count;
    }
    assert.equal(pokemon, deck.category_counts['Pokémon']);
    assert.ok(basics > 0);
    source.push({ rank: deck.rank, archetype: deck.archetype, basics, pokemon });
  }
  assert.deepEqual(original.missing_full_lists.map(row => row.rank).sort((a,b)=>a-b), [23,25,28]);
  return source.sort((a,b)=>a.rank-b.rank);
}

/**
 * Equal-rank-weight descriptive setup opportunities among 29 known originals.
 * The source remains an unchanged 60 throughout each candidate comparison.
 * @param {Array<{rank:number,archetype:string,basics:number,pokemon:number}>} sources
 * @param {number} candidateBasics
 */
function aggregateBonuses(sources, candidateBasics) {
  const rows = sources.map(source => ({
    ...source, ...bilateralBonus(source.basics, candidateBasics)
  }));
  const mean = key => rows.reduce((sum, row) => sum + row[key], 0) / rows.length;
  const bucket = {};
  for (const row of rows) bucket[row.basics] = (bucket[row.basics] ?? 0) + 1;
  const sparse = rows.filter(row => row.basics === 4);
  return {
    candidateBasics,
    knownOriginals: rows.length,
    missingRanks: [23,25,28],
    sourceBasicCountBuckets: bucket,
    candidateOfferedAtLeastOneMean: mean('candidateOfferedAtLeastOne'),
    candidateExpectedOfferedCardsMean: mean('candidateExpectedOfferedCards'),
    sourceOfferedAtLeastOneMean: mean('sourceOfferedAtLeastOne'),
    sourceExpectedOfferedCardsMean: mean('sourceExpectedOfferedCards'),
    fourBasicOriginals: sparse.map(row => row.rank),
    fourBasicContributionToCandidateOfferedMean:
      sparse.reduce((sum, row) => sum + row.candidateExpectedOfferedCards, 0) /
      rows.reduce((sum, row) => sum + row.candidateExpectedOfferedCards, 0),
    perOriginal: rows
  };
}

function run() {
  const base = path.resolve(__dirname, '..');
  const originals = JSON.parse(fs.readFileSync(path.join(base, 'results/aichi-2026/full-decklists.json'), 'utf8'));
  const stages = stageIndex(path.join(base, 'resources/cards/en'));
  const sources = originalBasicCensus(originals, stages);
  console.log(JSON.stringify({ schema: 'aichi-29-original-equal-rank-mulligan-bonus-v1',
    cardStageSource: 'bundled-English-card-pool-name-level, no exact-printing-legality-claim',
    qualifiesCompetitiveGame: false,
    rank1Champion: aggregateBonuses(sources, 14),
    newMoonLockbreaker: aggregateBonuses(sources, 17)
  }, null, 2));
}

if (require.main === module) run();
module.exports = { normalizeName, stageIndex, originalBasicCensus, aggregateBonuses };
