'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let value = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    value = value * BigInt(n - i + 1) / BigInt(i);
  }
  return value;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

/** @param {bigint} numerator @param {bigint} denominator */
function fraction(numerator, denominator) {
  const d = gcd(numerator, denominator);
  return {
    numerator: String(numerator / d),
    denominator: String(denominator / d),
    probability: Number(numerator) / Number(denominator),
  };
}

/**
 * Exact necessary physical availability of both rank-15 Vileplume printings
 * before taking a Prize, without moving cards out of face-down Prizes.
 *
 * @param {number} basicCount Printed Basic Pokémon count in the 60
 */
function ceilingForBasicCount(basicCount) {
  assert.ok(Number.isInteger(basicCount) && basicCount >= 2 && basicCount <= 53);
  const total = choose(60, 6);
  // Both Oddish, both Gloom, BUS Vileplume must be outside Prizes.
  // At least one of two AOR Vileplume must also be outside Prizes.
  const eligible = choose(55, 6) - choose(53, 4);
  const legalOpeningNumerator = choose(60, 7) - choose(60 - basicCount, 7);

  // Basic-count conditioning accounts for the actual draw-before-Prizes
  // sequence. The required two Oddish are Basic; the other B-2 Basics
  // are discretionary Prize cards within the physically eligible event.
  const otherBasics = basicCount - 2;
  const otherNonBasics = 60 - 7 - otherBasics;
  let eligibleAndLegalNumerator = 0n;
  for (let b = 0; b <= Math.min(6, otherBasics); b++) {
    for (let j = 0; j <= 1; j++) {
      const countOtherNonBasics = 6 - b - j;
      const prizeWays = choose(otherBasics, b) * choose(2, j)
        * choose(otherNonBasics, countOtherNonBasics);
      const validSevenWays = choose(54, 7)
        - choose(60 - basicCount - (6 - b), 7);
      eligibleAndLegalNumerator += prizeWays * validSevenWays;
    }
  }

  return {
    necessaryCardsOutsidePrizes: {
      oddishUNB: 2,
      gloomUNB: 2,
      vileplumeBUS: 1,
      vileplumeAORAtLeast: 1,
    },
    printedBasicCount: basicCount,
    randomSixPrizeAvailability: fraction(eligible, total),
    legalOpeningProbability: fraction(legalOpeningNumerator, choose(60, 7)),
    availabilityGivenLegalFirstSeven: fraction(
      eligibleAndLegalNumerator * choose(60, 7),
      total * choose(54, 7) * legalOpeningNumerator,
    ),
    countsOnlyNecessaryPrerequisites: true,
    qualifiesCompetitiveResults: false,
  };
}


/**
 * Disjoint, prioritized classification of initial Prizes.
 * Each category counts exactly once even when multiple roles are Prized.
 * @param {number} basicCount Printed Basic Pokemon count.
 */
function prerequisiteFailurePartition(basicCount) {
  assert.ok(Number.isInteger(basicCount) && basicCount >= 2 && basicCount <= 53);
  const names = [
    'BUS Vileplume Prized',
    'Oddish Prized, BUS outside Prizes',
    'Gloom Prized, BUS and Oddish outside Prizes',
    'Both AOR Vileplume Prized, preceding roles available',
    'All dual-stage prerequisites outside Prizes',
  ];
  const unconditioned = [0n, 0n, 0n, 0n, 0n];
  const legalWeighted = [0n, 0n, 0n, 0n, 0n];
  const otherBasics = basicCount - 2;
  const otherNonBasics = 60 - 7 - otherBasics;
  for (let prizedOddish = 0; prizedOddish <= 2; prizedOddish++) {
    for (let prizedGloom = 0; prizedGloom <= 2; prizedGloom++) {
      for (let prizedAOR = 0; prizedAOR <= 2; prizedAOR++) {
        for (let prizedBUS = 0; prizedBUS <= 1; prizedBUS++) {
          for (let prizedOtherBasics = 0;
            prizedOtherBasics <= Math.min(6, otherBasics); prizedOtherBasics++) {
            const prizedOtherNonBasics = 6 - prizedOddish - prizedGloom -
              prizedAOR - prizedBUS - prizedOtherBasics;
            const ways = choose(2, prizedOddish) * choose(2, prizedGloom) *
              choose(2, prizedAOR) * choose(1, prizedBUS) *
              choose(otherBasics, prizedOtherBasics) *
              choose(otherNonBasics, prizedOtherNonBasics);
            const validSeven = choose(54, 7) -
              choose(54 - basicCount + prizedOddish + prizedOtherBasics, 7);
            const key = prizedBUS ? 0 : prizedOddish ? 1 :
              prizedGloom ? 2 : prizedAOR === 2 ? 3 : 4;
            unconditioned[key] += ways;
            legalWeighted[key] += ways * validSeven;
          }
        }
      }
    }
  }
  const unconditionedTotal = unconditioned.reduce((a, b) => a + b, 0n);
  const legalTotal = legalWeighted.reduce((a, b) => a + b, 0n);
  assert.equal(unconditionedTotal, choose(60, 6));
  assert.equal(legalTotal * choose(60, 7),
    choose(60, 6) * choose(54, 7) *
      (choose(60, 7) - choose(60 - basicCount, 7)));
  return names.map((name, i) => ({
    name,
    randomSixPrizes: fraction(unconditioned[i], unconditionedTotal),
    givenLegalOpening: fraction(legalWeighted[i], legalTotal),
  }));
}

/**
 * Resolve exact stage types from the repository's source-printing card pool.
 * @param {object} deck Parsed published rank-15 source list
 * @param {string} root Repository root
 * @returns {number}
 */
function basicCountFromPrintedDeck(deck, root) {
  const sets = JSON.parse(fs.readFileSync(
    path.join(root, 'resources/sets/en.json'), 'utf8'));
  const setIds = new Map(sets.map(s => [s.ptcgoCode, s.id]));
  const cache = new Map();
  let basicCount = 0;
  for (const entry of deck.cards.filter(c => c.category === 'Pokémon')) {
    const setId = setIds.get(entry.printing.set);
    assert.ok(setId, 'Unknown source set ' + entry.printing.set);
    if (!cache.has(setId)) {
      cache.set(setId, JSON.parse(fs.readFileSync(
        path.join(root, 'resources/cards/en', setId + '.json'), 'utf8')));
    }
    const card = cache.get(setId).find(c =>
      c.number === entry.printing.number && c.name === entry.name);
    assert.ok(card, 'Unresolved source printing: ' + entry.name);
    if (card.subtypes.includes('Basic')) basicCount += entry.count;
  }
  return basicCount;
}

/** @param {string} root Repository root */
function fromSourceManifest(root = path.resolve(__dirname, '..')) {
  const field = JSON.parse(fs.readFileSync(
    path.join(root, 'results/aichi-2026/full-decklists.json'), 'utf8'));
  const deck = field.decks.find(d => d.rank === 15);
  assert.ok(deck, 'Missing exact source rank 15');
  assert.equal(deck.cards.reduce((s, c) => s + c.count, 0), 60);
  const count = (name, set) => deck.cards.filter(c =>
    c.name === name && c.printing.set === set)
    .reduce((s, c) => s + c.count, 0);
  assert.deepEqual([
    count('Oddish', 'UNB'), count('Gloom', 'UNB'),
    count('Vileplume', 'AOR'), count('Vileplume', 'BUS'),
  ], [2, 2, 2, 1]);
  const result = ceilingForBasicCount(basicCountFromPrintedDeck(deck, root));
  assert.equal(result.printedBasicCount, 14);
  return { rank: 15, player: deck.player, archetype: deck.archetype, ...result };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(fromSourceManifest(), null, 2) + '\n');
}

module.exports = { choose, ceilingForBasicCount, prerequisiteFailurePartition, basicCountFromPrintedDeck, fromSourceManifest };
