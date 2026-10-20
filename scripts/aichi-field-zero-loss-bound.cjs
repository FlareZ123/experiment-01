'use strict';

const assert = require('node:assert/strict');

/**
 * Largest probability of recording zero defeats under a fixed minimum
 * uniform-rank-average defeat probability, allowing arbitrary rank-specific
 * probabilities. The observations within and across ranks must be independent
 * Bernoulli games under one frozen deck and frozen playing policies.
 *
 * @param {number[]} gamesPerRank Nonnegative counts of qualified, completed games.
 * @param {number} minimumAverageLoss Null-hypothesis field-average loss rate.
 * @returns {number} Worst-case zero-loss probability, between 0 and 1.
 */
function maxZeroLossProbability(gamesPerRank, minimumAverageLoss) {
  assert.ok(Array.isArray(gamesPerRank) && gamesPerRank.length > 0);
  assert.ok(gamesPerRank.every(n => Number.isSafeInteger(n) && n >= 0));
  assert.ok(Number.isFinite(minimumAverageLoss) &&
    minimumAverageLoss >= 0 && minimumAverageLoss <= 1);
  if (minimumAverageLoss === 0) return 1;

  const allFailureMass = gamesPerRank.length * minimumAverageLoss;
  const unobserved = gamesPerRank.filter(n => n === 0).length;
  // Unsampled ranks can absorb up to one full unit of failure probability
  // apiece without any possibility of an observed defeat.
  if (allFailureMass <= unobserved) return 1;

  const n = gamesPerRank.filter(count => count > 0);
  const allocatedFailureMass = allFailureMass - unobserved;
  if (allocatedFailureMass >= n.length) return 0;

  // Lagrange multipliers maximize sum(n_i * log(1 - p_i)), subject to
  // sum(p_i) = allocatedFailureMass. The optimizer is
  // p_i = max(0, 1 - n_i / lambda).
  const exposedMass = lambda => n.reduce((sum, count) =>
    sum + Math.max(0, 1 - count / lambda), 0);
  let lower = Math.min(...n);
  let upper = lower;
  while (exposedMass(upper) < allocatedFailureMass) upper *= 2;
  for (let i = 0; i < 96; i++) {
    const middle = (lower + upper) / 2;
    if (exposedMass(middle) < allocatedFailureMass) lower = middle;
    else upper = middle;
  }
  return Math.exp(n.reduce((sum, count) =>
    sum + (count < upper ? count * Math.log(count / upper) : 0), 0));
}

/**
 * One-sided exact worst-case upper confidence bound when no defeats occurred.
 * Equal weighting across ranks is assumed. This is invalid for game outcomes
 * selected post hoc, censored trials misreported as wins, or dependent games.
 *
 * @param {number[]} gamesPerRank Nonnegative independently qualified trial counts.
 * @param {number} [alpha=0.05] One-sided error probability.
 * @returns {number} Upper bound on mean rank-specific defeat probability.
 */
function upperLossRateAfterZeroLosses(gamesPerRank, alpha = 0.05) {
  assert.ok(Number.isFinite(alpha) && alpha > 0 && alpha < 1);
  assert.ok(Array.isArray(gamesPerRank) && gamesPerRank.length > 0);
  assert.ok(gamesPerRank.every(n => Number.isSafeInteger(n) && n >= 0));
  if (gamesPerRank.every(n => n === 0)) return 1;
  let lower = 0;
  let upper = 1;
  for (let i = 0; i < 72; i++) {
    const middle = (lower + upper) / 2;
    if (maxZeroLossProbability(gamesPerRank, middle) > alpha) lower = middle;
    else upper = middle;
  }
  return upper;
}

module.exports = {maxZeroLossProbability, upperLossRateAfterZeroLosses};
