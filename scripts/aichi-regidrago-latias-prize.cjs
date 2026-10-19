'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const REGIDRAGO_RANKS = Object.freeze([10, 12, 13, 14, 18, 20, 21, 27, 32]);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  assert.ok(Number.isSafeInteger(n) && n >= 0);
  assert.ok(Number.isSafeInteger(k));
  if (k < 0 || k > n) return 0n;
  const terms = Math.min(k, n - k);
  let result = 1n;
  for (let i = 1; i <= terms; i++) {
    result = result * BigInt(n - terms + i) / BigInt(i);
  }
  return result;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

/**
 * Unconditional uniformly random six-Prize subset. This is the event that
 * ALL copies of the specified cards are in the Prize cards. It does not
 * estimate the real chance that an attacker is unable to use the Ability.
 *
 * @param {number} heavyBallCopies
 * @param {number} [deckSize]
 * @param {number} [prizeCount]
 * @returns {{fraction:string,probability:number,percent:number}}
 */
function protectedLatiasPrized(heavyBallCopies, deckSize = 60, prizeCount = 6) {
  assert.ok(Number.isSafeInteger(heavyBallCopies) && heavyBallCopies >= 0);
  assert.ok(Number.isSafeInteger(deckSize) && deckSize >= 1);
  assert.ok(Number.isSafeInteger(prizeCount) && prizeCount >= 0 && prizeCount <= deckSize);
  assert.ok(heavyBallCopies + 1 <= deckSize);
  const relevant = heavyBallCopies + 1; // One printed Latias ex.
  const numerator = choose(deckSize - relevant, prizeCount - relevant);
  const denominator = choose(deckSize, prizeCount);
  const divisor = gcd(numerator, denominator);
  const probability = Number(numerator) / Number(denominator);
  return {
    fraction: String(numerator / divisor) + '/' + String(denominator / divisor),
    probability,
    percent: 100 * probability
  };
}

/** @param {object[]} cards @param {string} name @returns {number} */
function countName(cards, name) {
  return cards.filter(row => row.name === name)
    .reduce((total, row) => total + row.count, 0);
}

/**
 * Source-list census: no inferred printings, legal moves or search success.
 * @param {{decks:object[]}} manifest Published original opponent inventory.
 * @returns {{rows:object[],means:object,scope:string}}
 */
function sourceCensus(manifest) {
  assert.ok(Array.isArray(manifest?.decks));
  const rows = REGIDRAGO_RANKS.map(rank => {
    const deck = manifest.decks.find(row => row.rank === rank);
    assert.ok(deck, 'Missing original Regidrago source rank ' + rank);
    const cards = deck.cards;
    assert.ok(Array.isArray(cards));
    assert.equal(cards.reduce((n, row) => n + row.count, 0), 60,
      'Original opponent must have exactly 60 physical cards: rank ' + rank);
    const latias = countName(cards, 'Latias ex');
    const ball = countName(cards, 'Hisuian Heavy Ball');
    assert.equal(latias, 1, 'Expected singleton Latias ex: rank ' + rank);
    assert.ok(ball >= 1, 'Expected printed Prize recovery: rank ' + rank);
    return {
      rank,
      latiasEx: latias,
      hisuianHeavyBall: ball,
      tapuLeleGX: countName(cards, 'Tapu Lele-GX'),
      dedenneGX: countName(cards, 'Dedenne-GX'),
      floatStone: countName(cards, 'Float Stone'),
      airBalloon: countName(cards, 'Air Balloon'),
      escapeRope: countName(cards, 'Escape Rope'),
      guzma: countName(cards, 'Guzma'),
      primeCatcher: countName(cards, 'Prime Catcher'),
      prizeCollapse: protectedLatiasPrized(ball)
    };
  });
  const meanCollapseProbability = rows.reduce(
    (sum, row) => sum + row.prizeCollapse.probability, 0) / rows.length;
  return {
    rows,
    means: {
      latiasExPrizeProbabilityWithoutOpeningConditioning: 6 / 60,
      latiasAndAllHeavyBallsPrized: meanCollapseProbability,
      latiasAndAllHeavyBallsPrizedPercent: 100 * meanCollapseProbability
    },
    scope: 'Exact source multiplicities and uniformly random six-Prize subsets only; no turn-by-turn recovery or game win rate'
  };
}

if (require.main === module) {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname,
    '../results/aichi-2026/full-decklists.json'), 'utf8'));
  process.stdout.write(JSON.stringify(sourceCensus(manifest), null, 2) + '\n');
}

module.exports = {REGIDRAGO_RANKS, choose, protectedLatiasPrized, countName, sourceCensus};
