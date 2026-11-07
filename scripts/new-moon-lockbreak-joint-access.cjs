'use strict';

const assert = require('node:assert/strict');
const variant = require('../results/als/new-moon-lockbreak-english-proxy-60.json');
const field = require('../results/aichi-2026/full-decklists.json');
const {choose} = require('./new-moon-lockbreak-access.cjs');

/** @param {number} n @param {number} k @returns {bigint} */
function chooseOrZero(n, k) {
  return n < 0 || k < 0 || k > n ? 0n : choose(n, k);
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

/** @param {bigint} numerator @param {bigint} denominator */
function fraction(numerator, denominator = 1n) {
  assert.ok(numerator >= 0n && denominator > 0n);
  const divisor = gcd(numerator, denominator);
  return {n: numerator / divisor, d: denominator / divisor};
}

/** @param {{n:bigint,d:bigint}} a @param {{n:bigint,d:bigint}} b */
function add(a, b) {
  return fraction(a.n * b.d + b.n * a.d, a.d * b.d);
}

/** @param {{n:bigint,d:bigint}} a @param {{n:bigint,d:bigint}} b */
function subtract(a, b) {
  const numerator = a.n * b.d - b.n * a.d;
  assert.ok(numerator >= 0n);
  return fraction(numerator, a.d * b.d);
}

/** @param {{n:bigint,d:bigint}} a @param {{n:bigint,d:bigint}} b */
function multiply(a, b) {
  return fraction(a.n * b.n, a.d * b.d);
}

/** @param {{n:bigint,d:bigint}} a @param {{n:bigint,d:bigint}} b */
function divide(a, b) {
  assert.ok(b.n > 0n);
  return fraction(a.n * b.d, a.d * b.n);
}

/** @param {{n:bigint,d:bigint}} a @param {number} exponent */
function power(a, exponent) {
  assert.ok(Number.isInteger(exponent) && exponent >= 0);
  let result = fraction(1n);
  for (let i = 0; i < exponent; i += 1) result = multiply(result, a);
  return result;
}

/** @param {{n:bigint,d:bigint}} value */
function display(value) {
  return {
    numerator: String(value.n),
    denominator: String(value.d),
    probability: Number(value.n) / Number(value.d)
  };
}

const ONE = fraction(1n);
const ZERO = fraction(0n);

/**
 * Exact probability that both distinct two-copy Item counters are accessible
 * after a valid initial seven and d post-Prize draws. Direct access requires
 * one Field Blower and one Canceling Cologne in the observed cards. Secret Box
 * can rescue only the missing Item when the other Item and Secret Box are
 * already observed, and at least one copy of the missing Item remains outside
 * the six Prizes. It cannot search for two Items.
 *
 * @param {number} d Number of cards drawn from the 47-card post-Prize deck.
 * @returns {{direct:{n:bigint,d:bigint},withSecretBox:{n:bigint,d:bigint}}}
 */
function jointAccessByDraws(d) {
  assert.ok(Number.isInteger(d) && d >= 1 && d <= 47);
  const observed = 7 + d;
  const validOpeningSevens = choose(60, 7) - choose(43, 7);
  const totalValidDeals = validOpeningSevens *
    choose(53, 6) * choose(47, d);

  let compositionTotal = 0n;
  let directNumerator = 0n;
  let secretBoxNumerator = 0n;

  // Candidate inventory: 2 Field Blower, 2 Cologne, 1 Secret Box,
  // 17 Basic Pokémon, and 38 other cards.
  for (let blower = 0; blower <= 2; blower += 1) {
    for (let cologne = 0; cologne <= 2; cologne += 1) {
      for (let box = 0; box <= 1; box += 1) {
        for (let basics = 0; basics <= 17; basics += 1) {
          const other = observed - blower - cologne - box - basics;
          if (other < 0 || other > 38) continue;

          const observedWays = choose(2, blower) * choose(2, cologne) *
            choose(1, box) * choose(17, basics) * choose(38, other);
          if (observedWays === 0n) continue;

          // Of the observed cards, count which seven-card subsets could have
          // been the initial hand and contain at least one Basic.
          const validInitialHandSubsets = choose(observed, 7) -
            chooseOrZero(observed - basics, 7);
          if (validInitialHandSubsets === 0n) continue;

          const prizeSets = choose(60 - observed, 6);
          const weight = observedWays * validInitialHandSubsets;
          compositionTotal += weight * prizeSets;

          if (blower >= 1 && cologne >= 1) {
            directNumerator += weight * prizeSets;
            secretBoxNumerator += weight * prizeSets;
          } else if (box >= 1 &&
            ((blower >= 1 && cologne === 0) ||
             (cologne >= 1 && blower === 0))) {
            // The absent counter has both copies among the 60-observed cards.
            // Subtract Prize sets containing both copies, which leave no copy
            // for Secret Box to search from the deck.
            const prizeSetsWithMissingItemInDeck = prizeSets -
              choose(60 - observed - 2, 4);
            secretBoxNumerator += weight * prizeSetsWithMissingItemInDeck;
          }
        }
      }
    }
  }

  assert.equal(compositionTotal, totalValidDeals,
    'Observed-card compositions must reproduce the valid-deal denominator');

  return {
    direct: fraction(directNumerator, totalValidDeals),
    withSecretBox: fraction(secretBoxNumerator, totalValidDeals)
  };
}

/** @param {number} k @param {{n:bigint,d:bigint}} pOpponent @param {{n:bigint,d:bigint}} pCandidate */
function bonusExactly(k, pOpponent, pCandidate) {
  assert.ok(Number.isInteger(k) && k >= 0);
  const denominator = subtract(ONE, multiply(pOpponent, pCandidate));
  if (k === 0) return divide(subtract(ONE, pOpponent), denominator);
  return divide(
    multiply(
      multiply(subtract(ONE, pOpponent), subtract(ONE, pCandidate)),
      power(pOpponent, k)
    ),
    denominator
  );
}

/** @param {number} k @param {{n:bigint,d:bigint}} pOpponent @param {{n:bigint,d:bigint}} pCandidate */
function bonusAtLeast(k, pOpponent, pCandidate) {
  assert.ok(Number.isInteger(k) && k >= 1);
  const denominator = subtract(ONE, multiply(pOpponent, pCandidate));
  return divide(
    multiply(subtract(ONE, pCandidate), power(pOpponent, k)),
    denominator
  );
}

/**
 * Average over the exact mulligan-bonus distribution for a four-Basic
 * opponent and the candidate's 17 Basics. The candidate takes every optional
 * bonus card and then its first mandatory draw. The post-Prize deck has at
 * most 47 cards, so the K>=47 tail is evaluated at d=47.
 */
function accessWithOpponentMulligans() {
  const pOpponent = fraction(choose(56, 7), choose(60, 7));
  const pCandidate = fraction(choose(43, 7), choose(60, 7));
  let distributionTotal = ZERO;
  let direct = ZERO;
  let withSecretBox = ZERO;

  for (let k = 0; k < 47; k += 1) {
    const weight = bonusExactly(k, pOpponent, pCandidate);
    const access = jointAccessByDraws(Math.min(k + 1, 47));
    distributionTotal = add(distributionTotal, weight);
    direct = add(direct, multiply(weight, access.direct));
    withSecretBox = add(withSecretBox, multiply(weight, access.withSecretBox));
  }

  const tail = bonusAtLeast(47, pOpponent, pCandidate);
  const tailAccess = jointAccessByDraws(47);
  distributionTotal = add(distributionTotal, tail);
  direct = add(direct, multiply(tail, tailAccess.direct));
  withSecretBox = add(withSecretBox, multiply(tail, tailAccess.withSecretBox));
  assert.equal(distributionTotal.n, distributionTotal.d,
    'Mulligan bonus distribution must sum exactly to one');

  return {
    opponentMulligan: display(pOpponent),
    candidateMulligan: display(pCandidate),
    chanceAtLeastOneBonus: display(bonusAtLeast(1, pOpponent, pCandidate)),
    chanceAtLeastThreeBonuses: display(bonusAtLeast(3, pOpponent, pCandidate)),
    distributionTotal: display(distributionTotal),
    directBoth: display(direct),
    withSecretBoxUpperBound: display(withSecretBox)
  };
}

/** @returns {object} */
function main() {
  assert.equal(variant.canonical_id_count_sha256,
    'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  assert.equal(variant.counts.total, 60);
  assert.equal(variant.counts['Pokémon'], 19);
  assert.equal(variant.counts.Trainer, 35);
  assert.equal(variant.counts.Energy, 6);

  /** @param {string} name */
  const copies = name => variant.entries
    .filter(row => row.name_en === name)
    .reduce((sum, row) => sum + row.count, 0);
  assert.equal(copies('Dusclops'), 2);
  assert.equal(copies('Field Blower'), 2);
  assert.equal(copies('Canceling Cologne'), 2);
  assert.equal(copies('Secret Box'), 1);
  const basics = variant.counts['Pokémon'] - copies('Dusclops');
  assert.equal(basics, 17);

  const ironThornsRanks = [6, 24, 29];
  for (const rank of ironThornsRanks) {
    const deck = field.decks.find(row => row.rank === rank);
    assert.ok(deck, 'Missing published Iron Thorns rank ' + rank);
    assert.equal(deck.archetype, 'Iron Thorns');
    assert.deepEqual(deck.cards.filter(row => row.category === 'Pokémon')
      .map(row => [row.name, row.count]), [['Iron Thorns ex', 4]]);
  }

  const firstDraw = jointAccessByDraws(1);
  return {
    schema: 'new-moon-joint-lockbreak-access-v1',
    candidate: {
      idCountSha256: variant.canonical_id_count_sha256,
      totalCards: 60,
      basics,
      fieldBlowerCopies: copies('Field Blower'),
      cologneCopies: copies('Canceling Cologne'),
      secretBoxCopies: copies('Secret Box')
    },
    opponent: {
      ironThornsRanks,
      basicCount: 4,
      note: 'Each published list contains exactly four Iron Thorns ex Basic Pokémon.'
    },
    window: 'Valid initial seven, six Prizes, optional opponent-mulligan bonus cards, and first mandatory draw.',
    firstMandatoryDraw: {
      directBoth: display(firstDraw.direct),
      withSecretBoxUpperBound: display(firstDraw.withSecretBox)
    },
    withAllOptionalMulliganBonuses: accessWithOpponentMulligans(),
    interpretation: 'Access only. Secret Box is assumed usable and paid for, Items are assumed playable, and all offered opponent-mulligan bonus cards are accepted. The Secret Box upper bound can search one missing Item only.',
    limitations: [
      'No discard-capability or Active Move Realism cost is charged for Secret Box discarding three other cards.',
      'No Item lock, lock timing, Tool reattachment, turn-order, Stadium, or opponent response is modeled.',
      'No other search/draw line is counted; no card is assumed to be played merely because it is visible.',
      'The result is not a matchup result, game-win estimate, or competitive qualification.'
    ]
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(main(), null, 2) + '\n');
}

module.exports = {
  jointAccessByDraws,
  bonusExactly,
  bonusAtLeast,
  accessWithOpponentMulligans,
  main
};
