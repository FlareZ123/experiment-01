'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Exact integer hypergeometric combination for small 60-card decks.
 * @param {number} population
 * @param {number} chosen
 * @returns {number}
 */
function choose(population, chosen) {
  if (chosen < 0 || chosen > population) return 0;
  let result = 1;
  for (let k = 1; k <= chosen; k++) {
    result = result * (population - chosen + k) / k;
  }
  return Math.round(result);
}

/**
 * Probability every mutually disjoint card group appears at least once.
 * Inclusion-exclusion computes the exact finite 7-card sampling result.
 * @param {number} population
 * @param {number} draws
 * @param {number[]} groupSizes
 * @returns {number}
 */
function allGroupsPresent(population, draws, groupSizes) {
  assert.ok(groupSizes.every(size => Number.isInteger(size) && size >= 0));
  assert.ok(groupSizes.reduce((a, b) => a + b, 0) <= population);
  const denominator = choose(population, draws);
  let numerator = 0;
  for (let mask = 0; mask < (1 << groupSizes.length); mask++) {
    let removed = 0, bits = 0;
    for (let k = 0; k < groupSizes.length; k++) {
      if (mask & (1 << k)) { removed += groupSizes[k]; bits++; }
    }
    numerator += (bits % 2 ? -1 : 1) *
      choose(population - removed, draws);
  }
  return numerator / denominator;
}

/** @returns {object} Exact opening overlap conditioned on a legal initial Basic. */
function run() {
  const filename = path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json');
  const source = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const deck = source.decks.find(d => d.rank === 7);
  assert.ok(deck, 'Missing published rank-7 source printing 60');
  const total = deck.cards.reduce((sum, card) => sum + card.count, 0);
  const basics = deck.cards.filter(card => card.category === 'Pokémon')
    .reduce((sum, card) => sum + card.count, 0);
  const steven = deck.cards.find(card => card.name === "Steven's Resolve")?.count;
  const palace = deck.cards.find(card => card.name === 'Palace Book')?.count;
  assert.equal(total, 60);
  assert.equal(basics, 12, 'All original rank-7 Pokémon printings are Basic');
  assert.equal(steven, 4);
  assert.equal(palace, 3);

  const draws = 7;
  const validOpening = allGroupsPresent(total, draws, [basics]);
  const stevenJoint = allGroupsPresent(total, draws, [basics, steven]);
  const palaceJoint = allGroupsPresent(total, draws, [basics, palace]);
  const bothJoint = allGroupsPresent(total, draws, [basics, steven, palace]);
  const other = source.decks.find(d => d.rank === 6);
  assert.ok(other, 'Missing original rank-6 Iron Thorns 60');
  const originalRank6 = {
    total: other.cards.reduce((sum, card) => sum + card.count, 0),
    basics: other.cards.filter(card => card.category === 'Pokémon')
      .reduce((sum, card) => sum + card.count, 0),
    camping: other.cards.find(card => card.name === 'Camping Gear')?.count,
    palace: other.cards.find(card => card.name === 'Palace Book')?.count
  };
  assert.deepEqual(originalRank6, {
    total: 60, basics: 4, camping: 2, palace: 1
  }, 'Original rank-6 Iron Thorns has four Basic and two turn-ending Items');
  const rank6Legal = allGroupsPresent(60, draws, [originalRank6.basics]);
  const rank6Joint = allGroupsPresent(60, draws, [
    originalRank6.basics, originalRank6.camping, originalRank6.palace
  ]);
  const rank6CampingJoint = allGroupsPresent(60, draws, [
    originalRank6.basics, originalRank6.camping
  ]);
  const rank6PalaceJoint = allGroupsPresent(60, draws, [
    originalRank6.basics, originalRank6.palace
  ]);

  return {
    scope: 'Uniform first seven cards conditional on at least one Basic; no extra opposing-mulligan draw',
    sourceRank: 7,
    fixed60: true, total, draws, basicCards: basics,
    stevenCopies: steven, palaceCopies: palace,
    probabilityLegalBasicOpening: validOpening,
    probabilityStevenGivenLegalBasic: stevenJoint / validOpening,
    probabilityPalaceGivenLegalBasic: palaceJoint / validOpening,
    probabilityBothGivenLegalBasic: bothJoint / validOpening,
    probabilityStevenOnlyGivenLegalBasic:
      (stevenJoint - bothJoint) / validOpening,
    probabilityPalaceOnlyGivenLegalBasic:
      (palaceJoint - bothJoint) / validOpening,
    probabilityNeitherGivenLegalBasic:
      1 - (stevenJoint + palaceJoint - bothJoint) / validOpening,
    probabilityAtLeastOneGivenLegalBasic:
      (stevenJoint + palaceJoint - bothJoint) / validOpening,
    paperObservation: 'Both printings end the turn, making them mutually exclusive actions within one normal turn',
    rank6Comparison: {
      rank: 6,
      sourcePrintingGroups: ['Camping Gear BST 122', 'Palace Book SMP NAN25'],
      basicCards: 4, campingGearCopies: 2, palaceBookCopies: 1,
      probabilityLegalBasicOpening: rank6Legal,
      probabilityBothGivenLegalBasic: rank6Joint / rank6Legal,
      probabilityCampingOnlyGivenLegalBasic:
        (rank6CampingJoint - rank6Joint) / rank6Legal,
      probabilityPalaceOnlyGivenLegalBasic:
        (rank6PalaceJoint - rank6Joint) / rank6Legal,
      probabilityNeitherGivenLegalBasic: 1 -
        (rank6CampingJoint + rank6PalaceJoint - rank6Joint) / rank6Legal
    },
    competitiveQualifiedGames: 0
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {choose, allGroupsPresent, run};
