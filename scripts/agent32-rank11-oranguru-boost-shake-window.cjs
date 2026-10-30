'use strict';

const assert = require('node:assert/strict');

// Exact printed counts in results/aichi-2026/full-decklists.json, rank 11.
const INVENTORY = Object.freeze({
  oranguru: 2, trubbish: 2, vip: 4, shake: 2,
  forest: 2, float: 3, garbodor: 2, other: 43
});
const ORDER = Object.freeze(Object.keys(INVENTORY));
const BASIC_COUNT = 11; // All rank-11 Basics, including both Oranguru V.

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  assert.ok(Number.isInteger(n) && n >= 0);
  assert.ok(Number.isInteger(k));
  if (k < 0 || k > n) return 0n;
  const m = Math.min(k, n - k);
  let result = 1n;
  for (let i = 1; i <= m; i++) {
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
function ratio(numerator, denominator) {
  assert.ok(denominator > 0n);
  const common = gcd(numerator, denominator);
  const n = numerator / common;
  const d = denominator / common;
  return {
    numerator: n.toString(),
    denominator: d.toString(),
    decimal: Number(n) / Number(d)
  };
}

/**
 * Count six-card Prize configurations leaving at least one copy of each
 * required group in the post-Prize deck. First eight and remaining 52 are
 * distinct physical cards, so inclusion-exclusion is exact.
 * @param {Record<string,number>} held Counts among first eight.
 * @param {string[]} needed Groups requiring deck access.
 * @returns {bigint}
 */
function survivingPrizeSets(held, needed) {
  let total = 0n;
  for (let mask = 0; mask < (1 << needed.length); mask++) {
    let selectedCards = 0;
    let parity = 0;
    for (let i = 0; i < needed.length; i++) {
      if ((mask & (1 << i)) === 0) continue;
      selectedCards += INVENTORY[needed[i]] - held[needed[i]];
      parity ^= 1;
    }
    const combinations = choose(52 - selectedCards, 6 - selectedCards);
    total += parity ? -combinations : combinations;
  }
  return total;
}

/**
 * Exact shuffle calculation for a sufficient first-turn Garbotoxin route:
 * Oranguru V starts Active and Back Order supplies Forest Seal Stone and
 * Float Stone where absent from hand. Star Alchemy supplies at most one
 * missing Battle VIP Pass or Boost Shake. Trubbish is benched before its
 * Float Stone and Boost Shake evolves it into Garbodor from the deck.
 * No external locks, interference, card-text updates, extra search, or
 * strategic choice probabilities are modeled.
 */
function exactOranguruBoostShakeWindow() {
  let favorableWeighted = 0n;
  let eightHandConfigurations = 0;
  const byRoute = {trubbishHeld: 0n, vipHeld: 0n, vipStarSearched: 0n};
  const hand = {};

  /** @param {number} index @param {number} left @param {bigint} ways */
  function enumerate(index, left, ways) {
    if (index === ORDER.length) {
      if (left !== 0) return;
      eightHandConfigurations++;
      const oranguru = hand.oranguru;
      if (oranguru === 0) return;
      let route;
      const required = ['garbodor']; // Boost Shake must search Stage 1.
      if (hand.trubbish > 0) route = 'trubbishHeld';
      else if (hand.vip > 0) {
        route = 'vipHeld';
        required.push('trubbish');
      } else if (hand.shake > 0) {
        route = 'vipStarSearched';
        required.push('trubbish', 'vip');
      } else return;

      if (hand.shake === 0) required.push('shake');
      if (hand.forest === 0) required.push('forest');
      if (hand.float === 0) required.push('float');
      const prizeConfigurations = survivingPrizeSets(hand, required);
      // The eighth card is the first ordinary turn draw. If just one
      // Oranguru is in the first eight, it is initially Active-eligible
      // in 7/8 relative orders; with two, in all 8/8 relative orders.
      const startsWithOranguruFactor = oranguru === 1 ? 7n : 8n;
      const favorable = ways * prizeConfigurations * startsWithOranguruFactor;
      byRoute[route] += favorable;
      favorableWeighted += favorable;
      return;
    }
    const key = ORDER[index];
    for (let count = 0; count <= Math.min(INVENTORY[key], left); count++) {
      hand[key] = count;
      enumerate(index + 1, left - count,
        ways * choose(INVENTORY[key], count));
    }
  }
  enumerate(0, 8, 1n);

  const totalWeighted = choose(60, 8) * choose(52, 6) * 8n;
  const validNumerator = choose(60, 7) - choose(60 - BASIC_COUNT, 7);
  const validDenominator = choose(60, 7);
  const conditionalDenominator = totalWeighted * validNumerator;
  const conditionalMultiplier = validDenominator;
  return {
    inventory: {...INVENTORY},
    basicCount: BASIC_COUNT,
    configurations: eightHandConfigurations,
    basicValidOpening: ratio(validNumerator, validDenominator),
    unconditional: ratio(favorableWeighted, totalWeighted),
    conditionalBasicValid: ratio(favorableWeighted * conditionalMultiplier,
      conditionalDenominator),
    partitionConditionalBasicValid: Object.fromEntries(
      Object.entries(byRoute).map(([key, value]) =>
        [key, ratio(value * conditionalMultiplier, conditionalDenominator)]))
  };
}

module.exports = {INVENTORY, choose, survivingPrizeSets,
  exactOranguruBoostShakeWindow};
