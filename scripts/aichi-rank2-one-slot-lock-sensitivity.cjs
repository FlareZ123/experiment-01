'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {choose, fraction, basicCountFromPrintedDeck} =
  require('./aichi-rank15-dual-lock-prize-ceiling.cjs');

const ROLES = Object.freeze([
  'Oddish UNB', 'Gloom UNB', 'Vileplume AOR',
  'Lillipup CEC', 'Herdier SUM', 'Stoutland BCR'
]);
const SOURCE_COUNTS = Object.freeze([2, 2, 2, 2, 2, 1]);

/**
 * Count six-Prize states jointly with a Basic-valid initial seven.
 * The six roles are independent printed identity requirements, and each
 * requires at least one copy outside the face-down Prizes. A hypothetical
 * extra role card displaces one OTHER NON-BASIC card while the other ten
 * Basic cards stay fixed. Source recovery, actual searches and play are
 * deliberately excluded.
 *
 * @param {number[]} counts Six printed role multiplicities.
 * @param {number} otherBasicCount Basic copies outside these six roles.
 * @returns {object} Exact reduced rational probabilities.
 */
function lockChainsGivenLegalSeven(counts, otherBasicCount = 10) {
  assert.ok(Array.isArray(counts) && counts.length === 6 &&
    counts.every(c => Number.isInteger(c) && c >= 1 && c <= 4));
  assert.ok(Number.isInteger(otherBasicCount) && otherBasicCount >= 0);
  const basicCount = otherBasicCount + counts[0] + counts[3];
  const otherNonBasicCount = 60 -
    counts.reduce((sum, count) => sum + count, 0) - otherBasicCount;
  assert.ok(otherNonBasicCount >= 0 && basicCount >= 1);
  const sevenWays = choose(54, 7);
  let allPrizeStates = 0n;
  let weightedLegalSeven = 0n;
  let weightedBothChains = 0n;
  let weightedAllStoutlandPrized = 0n;

  /**
   * @param {number} i Current printed role.
   * @param {number} prized Number of role cards selected as Prizes.
   * @param {bigint} ways Prize arrangements accumulated.
   * @param {number} prizedBasics Prize cards from the two role Basics.
   * @param {boolean} available Every role currently has unprized copies.
   * @param {boolean} stoutlandGone All source Stoutland copies are Prized.
   */
  function visit(i, prized, ways, prizedBasics, available, stoutlandGone) {
    if (i === counts.length) {
      for (let otherPrizedBasic = 0;
        otherPrizedBasic <= Math.min(otherBasicCount, 6 - prized);
        otherPrizedBasic++) {
        const otherPrizedNonBasic = 6 - prized - otherPrizedBasic;
        const combinations = ways *
          choose(otherBasicCount, otherPrizedBasic) *
          choose(otherNonBasicCount, otherPrizedNonBasic);
        if (combinations === 0n) continue;
        allPrizeStates += combinations;
        const unprizedBasics =
          basicCount - prizedBasics - otherPrizedBasic;
        const legalHands =
          sevenWays - choose(54 - unprizedBasics, 7);
        const legalWeight = combinations * legalHands;
        weightedLegalSeven += legalWeight;
        if (available) weightedBothChains += legalWeight;
        if (stoutlandGone) weightedAllStoutlandPrized += legalWeight;
      }
      return;
    }
    for (let q = 0; q <= Math.min(counts[i], 6 - prized); q++) {
      visit(i + 1, prized + q, ways * choose(counts[i], q),
        prizedBasics + ((i === 0 || i === 3) ? q : 0),
        available && q < counts[i],
        i === 5 ? q === counts[i] : stoutlandGone);
    }
  }

  visit(0, 0, 1n, 0, true, false);
  assert.equal(allPrizeStates, choose(60, 6),
    'The complete six-Prize state partition must be conserved');
  assert.ok(weightedLegalSeven > 0n);
  return {
    roleCounts: counts.slice(),
    printedBasicCount: basicCount,
    otherNonBasicCount,
    bothLockChainsPhysicallyAvailable:
      fraction(weightedBothChains, weightedLegalSeven),
    allStoutlandPrized:
      fraction(weightedAllStoutlandPrized, weightedLegalSeven),
    modelScope: 'Six random Prizes and Basic-valid seven; no recovery, search, tempo or win estimate',
  };
}

/**
 * Screen all six single-role duplications with an unspecified off-role
 * non-Basic replacement, retaining every other printed identity count.
 * This is a sensitivity study, never a legally finished new decklist.
 *
 * @param {number} otherBasicCount Number of other Basics in source list.
 * @returns {object}
 */
function oneSlotRank2Sensitivity(otherBasicCount = 10) {
  const source = lockChainsGivenLegalSeven(SOURCE_COUNTS.slice(), otherBasicCount);
  const variants = ROLES.map((role, index) => {
    const counts = SOURCE_COUNTS.slice();
    counts[index]++;
    const result = lockChainsGivenLegalSeven(counts, otherBasicCount);
    return {
      hypotheticalAddition: role, ...result,
      jointAvailabilityGainPercentagePoints: 100 * (
        result.bothLockChainsPhysicallyAvailable.probability -
        source.bothLockChainsPhysicallyAvailable.probability)
    };
  });
  return {
    schema: 'rank2-one-slot-source-chain-prize-sensitivity-v1',
    sourceRoleCounts: Object.fromEntries(
      ROLES.map((role, i) => [role, SOURCE_COUNTS[i]])),
    otherBasicCount,
    source, variants,
    replacesOneUnspecifiedOffRoleNonBasic: true,
    countsRecoveryAndRealPolicy: false,
    competitiveGameClaims: 0
  };
}

/** @param {string} root Repository root. @returns {object} */
function fromSourceManifest(root = path.resolve(__dirname, '..')) {
  const field = JSON.parse(fs.readFileSync(
    path.join(root, 'results/aichi-2026/full-decklists.json'), 'utf8'));
  const deck = field.decks.find(row => row.rank === 2);
  assert.ok(deck && deck.cards.reduce((s, row) => s + row.count, 0) === 60);
  const actualCounts = [
    ['Oddish', 'UNB'], ['Gloom', 'UNB'], ['Vileplume', 'AOR'],
    ['Lillipup', 'CEC'], ['Herdier', 'SUM'], ['Stoutland', 'BCR']
  ].map(([name, set]) => deck.cards
    .filter(row => row.name === name && row.printing.set === set)
    .reduce((s, row) => s + row.count, 0));
  assert.deepEqual(actualCounts, SOURCE_COUNTS);
  const sourceBasics = basicCountFromPrintedDeck(deck, root);
  assert.equal(sourceBasics, 14);
  return {
    sourceRank: 2, sourcePlayer: deck.player,
    ...oneSlotRank2Sensitivity(sourceBasics - SOURCE_COUNTS[0] - SOURCE_COUNTS[3])
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(fromSourceManifest(), null, 2) + '\n');
}
module.exports = {ROLES, SOURCE_COUNTS, lockChainsGivenLegalSeven,
  oneSlotRank2Sensitivity, fromSourceManifest};
