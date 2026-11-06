'use strict';

/**
 * Exact source-card location experiment for the original rank7 Snorlax Stall
 * printed 60. No assumptions about the native actor or actions after drawing.
 * Independent of which six of the other 53 cards become Prize cards.
 */

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0) {
    throw new RangeError('choose expects nonnegative integer n and integer k');
  }
  if (k < 0 || k > n) return 0n;
  const m = Math.min(k, n - k);
  let result = 1n;
  for (let i = 1; i <= m; i++) {
    result = result * BigInt(n - m + i) / BigInt(i);
  }
  return result;
}

/**
 * Partition physical cards into Wobbuffet (w), other Basics (otherBasics),
 * Faba (faba), and residual cards. Count the first hand and further
 * natural draws under uniformly shuffled 60-card or toy decks.
 *
 * A "forced Wobbuffet Active" first hand has at least one Wobbuffet and no
 * other Basic. An "available Wobbuffet" hand has at least one Wobbuffet
 * but may include other Basic Pokémon.
 *
 * @param {{total:number,wobbuffet:number,otherBasics:number,
 *   faba:number,opening:number,draws:number}} p
 * @returns {{legal:bigint,forced:bigint,forcedFabaOpening:bigint,
 *   forcedFabaSeen:bigint,available:bigint,availableFabaSeen:bigint,
 *   optionalNonWobbActiveFabaSeen:bigint}}
 */
function countVisibleResources(p) {
  const { total: n, wobbuffet: w, otherBasics: b, faba: f,
    opening: h, draws: d } = p;
  for (const val of [n, w, b, f, h, d]) {
    if (!Number.isInteger(val) || val < 0) {
      throw new RangeError('Counts must be nonnegative integers');
    }
  }
  if (w + b + f > n || h + d > n) {
    throw new RangeError('Card partition or draws exceed deck');
  }
  const allDraws = choose(n - h, d);
  const legalOpening = choose(n, h) - choose(n - w - b, h);
  const forcedOpening = choose(n - b, h) - choose(n - b - w, h);
  const availableOpening = choose(n, h) - choose(n - w, h);
  const forced = forcedOpening * allDraws;
  const available = availableOpening * allDraws;
  const forcedNoFOpening =
    choose(n - b - f, h) - choose(n - b - w - f, h);
  const availableNoFOpening =
    choose(n - f, h) - choose(n - w - f, h);
  const forcedFabaOpening = (forcedOpening - forcedNoFOpening) * allDraws;
  const forcedFabaSeen = forced -
    forcedNoFOpening * choose(n - f - h, d);
  const availableFabaSeen = available -
    availableNoFOpening * choose(n - f - h, d);
  return {
    legal: legalOpening * allDraws,
    forced,
    forcedFabaOpening,
    forcedFabaSeen,
    available,
    availableFabaSeen,
    optionalNonWobbActiveFabaSeen: availableFabaSeen - forcedFabaSeen
  };
}

const ORIGINAL_RANK7 = Object.freeze({
  total: 60, wobbuffet: 3, otherBasics: 9, faba: 2,
  opening: 7, draws: 2
});

module.exports = { choose, countVisibleResources, ORIGINAL_RANK7 };
