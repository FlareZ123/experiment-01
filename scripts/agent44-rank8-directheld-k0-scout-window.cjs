'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const BASIC_NAMES = Object.freeze([
  'Mega Absol ex', 'Trubbish', 'Tapu Koko ♢', 'Dedenne-GX',
  'Crobat V', 'Squawkabilly ex', 'Tapu Lele-GX', 'Budew'
]);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (!Number.isSafeInteger(n) || n < 0 || !Number.isSafeInteger(k)) {
    throw new TypeError('Expected nonnegative integer n and integer k');
  }
  if (k < 0 || k > n) return 0n;
  const m = Math.min(k, n - k);
  let result = 1n;
  for (let i = 1; i <= m; i += 1) {
    result = result * BigInt(n - m + i) / BigInt(i);
  }
  return result;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

/** @param {bigint} numerator @param {bigint} denominator */
function rational(numerator, denominator) {
  assert.ok(denominator > 0n);
  const d = gcd(numerator, denominator);
  return {
    numerator: (numerator / d).toString(),
    denominator: (denominator / d).toString(),
    probability: Number(numerator) / Number(denominator)
  };
}

/**
 * Conditional all-copies-Prized probability after a purely observed hand
 * whose cards include none of the specific Shake copies, before first
 * deck search. Exchangeability among the still-hidden cards is required.
 * This is a card-location fact, not a chance of losing the game or
 * failing the full setup line.
 *
 * @param {number} copies Count of target copies in the original printed 60.
 * @param {number} [observed] Physically observed cards, none targets.
 * @param {number} [deckSize] Initial deck size.
 * @param {number} [prizes] Face-down Prize cards.
 * @returns {{numerator:string,denominator:string,probability:number}}
 */
function allUnseenCopiesPrized(copies, observed = 8,
  deckSize = 60, prizes = 6) {
  assert.ok(Number.isSafeInteger(copies) && copies >= 1,
    'Copies must be at least one; zero-copy source has no such line');
  assert.ok(Number.isSafeInteger(observed) && observed >= 0);
  assert.ok(Number.isSafeInteger(deckSize) && deckSize > 0);
  assert.ok(Number.isSafeInteger(prizes) && prizes >= 0);
  assert.ok(deckSize - observed >= prizes + copies,
    'Remaining unseen cards must include Prizes and target copies');
  return rational(choose(prizes, copies),
    choose(deckSize - observed, copies));
}

/**
 * Count the exact, deliberately narrow direct-held early information window.
 * Assumes an exchangeable 60, valid initial seven-card hand containing a Basic,
 * one next-turn draw, no mulligan bonus, and no intervening draw/search.
 * The event is holding Box and >=1 Quick Ball among those eight cards, while
 * holding zero Trubbish. It does not check Quick Ball payment, Box payment,
 * whether Trubbish is already on the Bench, or tactical opportunity.
 *
 * @param {{box:number,quickBall:number,trubbish:number,otherBasic:number,other:number}} c
 */
function exactDirectHeldWindow(c) {
  const {box, quickBall, trubbish, otherBasic, other} = c;
  assert.equal(box + quickBall + trubbish + otherBasic + other, 60);
  assert.equal(box, 1);
  const basic = trubbish + otherBasic;
  const h = 8;
  const validSeven = choose(60, 7) - choose(60 - basic, 7);
  let eventEight = 0n;
  let eventEightAndValidSevenNumeratorEightths = 0n;
  for (let qb = 1; qb <= Math.min(quickBall, h - 1); qb += 1) {
    for (let b = 0; b <= Math.min(otherBasic, h - 1 - qb); b += 1) {
      const unclassified = h - 1 - qb - b;
      const combinations = choose(quickBall, qb) *
        choose(otherBasic, b) * choose(other, unclassified);
      eventEight += combinations;
      // Conditional on the unordered eight, the only Basic can be eighth
      // with probability 1/8. If >=2 Basics, a valid initial seven is certain.
      const validEightths = b === 0 ? 0n : b === 1 ? 7n : 8n;
      eventEightAndValidSevenNumeratorEightths += combinations * validEightths;
    }
  }
  const validOpening = rational(validSeven, choose(60, 7));
  const directHeldUnconditional = rational(eventEight, choose(60, h));
  const directHeldGivenValidOpening = rational(
    eventEightAndValidSevenNumeratorEightths * choose(60, 7),
    8n * choose(60, h) * validSeven
  );
  return {
    sourceRank: 8,
    counts: c,
    opening7ValidProbability: validOpening,
    directHeldEightUnconditional: directHeldUnconditional,
    directHeldEightGivenValidOpening: directHeldGivenValidOpening,
    expectedDirectHeldEventsIn64: 64 * directHeldGivenValidOpening.probability,
    caveat: 'Physical direct-held inventory only; not a bound on native policy offers, search lines, payments or competitive wins.'
  };
}

/** @param {{count:number,name:string}[]} cards */
function countFromPrintedSource(cards) {
  const sum = cards.reduce((v, card) => v + card.count, 0);
  assert.equal(sum, 60);
  const byName = name => cards.filter(card => card.name === name)
    .reduce((v, card) => v + card.count, 0);
  const box = byName('Secret Box');
  const quickBall = byName('Quick Ball');
  const trubbish = byName('Trubbish');
  const basic = BASIC_NAMES.reduce((v, name) => v + byName(name), 0);
  assert.equal(basic, 10, 'Check BASIC_NAMES against authenticated printed source');
  assert.equal(trubbish, 2);
  assert.equal(quickBall, 4);
  return {box, quickBall, trubbish, otherBasic: basic - trubbish,
    other: 60 - box - quickBall - basic};
}

/** @param {string} [rosterPath] */
function run(rosterPath = path.resolve(__dirname,
  '../results/aichi-2026/full-decklists.json')) {
  const deck = JSON.parse(fs.readFileSync(rosterPath, 'utf8'))
    .decks.find(row => row.rank === 8);
  assert.ok(deck, 'Authenticated original rank 8 absent');
  assert.equal(deck.player, 'Yusuke Kobayashi');
  const counts = countFromPrintedSource(deck.cards);
  return exactDirectHeldWindow(counts);
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
}
module.exports = {BASIC_NAMES, choose, allUnseenCopiesPrized,
  exactDirectHeldWindow, countFromPrintedSource, run};
