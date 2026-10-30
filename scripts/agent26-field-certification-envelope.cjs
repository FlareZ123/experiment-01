'use strict';

const assert = require('node:assert/strict');

/**
 * Exact one-sided Clopper-Pearson lower confidence bound for a binomial
 * success probability after n independent, fully observed wins and no losses.
 * The optional Bonferroni family size makes all individual lower bounds
 * simultaneous with familywise error no greater than alpha.
 *
 * @param {number} n Positive number of qualified, independent wins.
 * @param {{alpha?:number,familySize?:number}} [options]
 * @returns {number}
 */
function allWinLowerBound(n, options = {}) {
  const alpha = options.alpha ?? 0.05;
  const familySize = options.familySize ?? 1;
  assert.ok(Number.isSafeInteger(n) && n > 0, 'n must be positive');
  assert.ok(Number.isFinite(alpha) && alpha > 0 && alpha < 1,
    'alpha must be strictly between 0 and 1');
  assert.ok(Number.isSafeInteger(familySize) && familySize > 0,
    'familySize must be a positive integer');
  return Math.exp(Math.log(alpha / familySize) / n);
}

/**
 * Smallest all-win sample size whose exact one-sided bound reaches target.
 * This is a conditional statistical planning bound, not a guarantee of deck
 * performance or of the independence/correctness of future game samples.
 *
 * @param {number} [target=0.995]
 * @param {{alpha?:number,familySize?:number}} [options]
 * @returns {number}
 */
function minimumAllWinGames(target = 0.995, options = {}) {
  assert.ok(Number.isFinite(target) && target > 0 && target < 1,
    'target must be strictly between 0 and 1');
  const alpha = options.alpha ?? 0.05;
  const familySize = options.familySize ?? 1;
  allWinLowerBound(1, {alpha, familySize});
  const logTarget = Math.log(target);
  const logCutoff = Math.log(alpha / familySize);
  let n = Math.ceil(logCutoff / logTarget);
  while (n > 1 && (n - 1) * logTarget <= logCutoff) n--;
  while (n * logTarget > logCutoff) n++;
  assert.ok(Number.isSafeInteger(n), 'required sample count exceeds safe integer');
  return n;
}

/**
 * Logical aggregate range when unknown opponent matchups are unconstrained.
 * These are partial-identification bounds, not sampling confidence intervals.
 *
 * @param {{fieldSize:number,knownRanks:number,knownWinRate:number,
 *   target?:number}} input
 * @returns {{unknownRanks:number,lower:number,upper:number,
 *   requiredUnknownAverage:number|null}}
 */
function fieldCoverageEnvelope(input) {
  const {fieldSize, knownRanks, knownWinRate, target = 0.995} = input;
  assert.ok(Number.isSafeInteger(fieldSize) && fieldSize > 0);
  assert.ok(Number.isSafeInteger(knownRanks) &&
    knownRanks >= 0 && knownRanks <= fieldSize);
  assert.ok(Number.isFinite(knownWinRate) &&
    knownWinRate >= 0 && knownWinRate <= 1);
  assert.ok(Number.isFinite(target) && target >= 0 && target <= 1);
  const unknownRanks = fieldSize - knownRanks;
  const knownSuccessMass = knownRanks * knownWinRate;
  return {
    unknownRanks,
    lower: knownSuccessMass / fieldSize,
    upper: (knownSuccessMass + unknownRanks) / fieldSize,
    requiredUnknownAverage: unknownRanks === 0 ? null :
      (target * fieldSize - knownSuccessMass) / unknownRanks
  };
}

module.exports = {
  allWinLowerBound, minimumAllWinGames, fieldCoverageEnvelope
};
