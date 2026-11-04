'use strict';

const assert = require('node:assert/strict');

/**
 * Exact binomial coefficient. Intended for physical-deck combinatorics.
 * @param {number} n Nonnegative population size.
 * @param {number} k Number selected.
 * @returns {bigint}
 */
function choose(n, k) {
  assert.ok(Number.isSafeInteger(n) && n >= 0);
  assert.ok(Number.isSafeInteger(k));
  if (k < 0 || k > n) return 0n;
  const r = Math.min(k, n - k);
  let result = 1n;
  for (let i = 1; i <= r; i++) {
    result = result * BigInt(n - r + i) / BigInt(i);
  }
  return result;
}

/**
 * Exact initially-Prized probability conditional on an accepted seven-card hand.
 * The specified k cards must ALL be non-Basic Pokémon or Trainer/Energy cards.
 * In particular, none of them contributes to the basicCount starting eligibility.
 *
 * Sample a uniform physical 7-card hand; reject hands with no Basic Pokémon;
 * then sample 6 Prize cards uniformly from the remaining 53.
 *
 * P(all k initially Prized | valid opening) =
 * [C(60-k,7)-C(60-basicCount-k,7)] / [C(60,7)-C(60-basicCount,7)]
 *   * C(53-k,6-k)/C(53,6).
 *
 * @param {number} k Copies of the named non-Basic prerequisite, 0..6.
 * @param {number} basicCount Exact number of eligible Basic Pokémon in the 60.
 * @returns {{numerator:bigint,denominator:bigint,probability:number}}
 */
function allNonBasicCopiesPrizedGivenValidStart(k, basicCount) {
  assert.ok(Number.isInteger(k) && k >= 0 && k <= 6);
  assert.ok(Number.isInteger(basicCount) && basicCount >= 1 && basicCount <= 60 - k);
  const eligibleHands = choose(60, 7) - choose(60 - basicCount, 7);
  const eligibleHandsExcludingCopies =
    choose(60 - k, 7) - choose(60 - basicCount - k, 7);
  const numerator = eligibleHandsExcludingCopies * choose(53 - k, 6 - k);
  const denominator = eligibleHands * choose(53, 6);
  return {numerator, denominator, probability:Number(numerator)/Number(denominator)};
}

/**
 * Chance at least one of n distinct, specified non-Basic singleton cards starts Prized.
 * Uses inclusion-exclusion; any such card may be drawn in the initial hand.
 * @param {number} n Distinct physical prerequisite cards, 0..6.
 * @param {number} basicCount
 * @returns {number}
 */
function anyNonBasicSingletonPrizedGivenValidStart(n, basicCount) {
  assert.ok(Number.isInteger(n) && n >= 0 && n <= 6);
  let probability = 0;
  for (let k = 1; k <= n; k++) {
    const coefficient = Number(choose(n, k));
    probability += (k % 2 ? 1 : -1) *
      coefficient * allNonBasicCopiesPrizedGivenValidStart(k, basicCount).probability;
  }
  return probability;
}

/**
 * Necessary success rate in the initially obstructed cohort if the aggregate
 * winning target must be reached, optimistically assuming all other games win.
 * This is a mathematical bound, not a prediction of actual play.
 * @param {number} obstructionProbability P(obstruction | accepted opening).
 * @param {number} target Aggregate desired game win probability.
 * @returns {number}
 */
function minimumObstructedCohortWinRate(obstructionProbability, target = 0.995) {
  assert.ok(Number.isFinite(obstructionProbability) &&
    obstructionProbability >= 0 && obstructionProbability <= 1);
  assert.ok(Number.isFinite(target) && target >= 0 && target <= 1);
  if (obstructionProbability === 0) return 0;
  return Math.max(0, 1 - (1 - target) / obstructionProbability);
}

module.exports = {
  choose,
  allNonBasicCopiesPrizedGivenValidStart,
  anyNonBasicSingletonPrizedGivenValidStart,
  minimumObstructedCohortWinRate
};
