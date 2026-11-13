'use strict';

const STRATA_PER_OPPONENT = 4;
const DEFAULT_FIELD_SIZE = 32;
const TARGET_WIN_RATE = 0.995;
const NULL_FAILURE_SUM = STRATA_PER_OPPONENT * (1 - TARGET_WIN_RATE);
const MIN_STRATUM_FOR_HETEROGENEITY_PROOF = 534;

function assertProbability(value, label) {
  if (typeof value !== 'number' || !Number.isFinite(value) ||
      value < 0 || value > 1) {
    throw new TypeError(label + ' must be a finite probability in [0,1]');
  }
}

function assertPositiveInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new TypeError(label + ' must be a positive safe integer');
  }
}

/** Exact P[Binomial(trials, q) <= 2]. */
function binomialAtMostTwoFailures(trials, q) {
  assertPositiveInteger(trials, 'trials');
  assertProbability(q, 'failureProbability');
  if (q === 0) return 1;
  if (q === 1) return trials <= 2 ? 1 : 0;
  const p0 = Math.pow(1 - q, trials);
  const p1 = trials * q * Math.pow(1 - q, trials - 1);
  const p2 = trials >= 2
    ? (trials * (trials - 1) / 2) * q * q * Math.pow(1 - q, trials - 2)
    : 0;
  return p0 + p1 + p2;
}

function binomialProbabilitiesThroughTwo(trials, q) {
  if (q === 0) return [1, 0, 0];
  if (q === 1) {
    if (trials === 1) return [0, 1, 0];
    if (trials === 2) return [0, 0, 1];
    return [0, 0, 0];
  }
  const p0 = Math.pow(1 - q, trials);
  const p1 = trials * q * Math.pow(1 - q, trials - 1);
  const p2 = trials >= 2
    ? (trials * (trials - 1) / 2) * q * q * Math.pow(1 - q, trials - 2)
    : 0;
  return [p0, p1, p2];
}

/**
 * Exact P[sum_j Binomial(n, q_j) <= 2] for four independent strata.
 * Uses a degree-two probability-generating-function convolution, including
 * exact handling of q=0 and q=1 boundary cells.
 */
function fourStrataAtMostTwoFailuresProbability(failureProbabilities, gamesPerStratum) {
  if (!Array.isArray(failureProbabilities) ||
      failureProbabilities.length !== STRATA_PER_OPPONENT) {
    throw new TypeError('failureProbabilities must contain four values');
  }
  assertPositiveInteger(gamesPerStratum, 'gamesPerStratum');
  for (const q of failureProbabilities) assertProbability(q, 'failureProbability');

  let distribution = [1, 0, 0];
  for (const q of failureProbabilities) {
    const cell = binomialProbabilitiesThroughTwo(gamesPerStratum, q);
    const next = [0, 0, 0];
    for (let left = 0; left <= 2; left++) {
      for (let right = 0; right <= 2 - left; right++) {
        next[left + right] += distribution[left] * cell[right];
      }
    }
    distribution = next;
  }
  return distribution[0] + distribution[1] + distribution[2];
}

/**
 * Prospective exact design for at most two nonwins per opponent.
 *
 * For target 99.5%, the equal-stratum configuration is proven to maximize
 * P(total nonwins <= 2) over all four-stratum failure-rate vectors whenever
 * n >= 534 games per stratum. The proof is specific to Q=sum(q_j)=0.02 and
 * this two-nonwin tail; do not generalize it to other targets or smaller n.
 * This function plans sample size; it does not validate an observed ledger.
 */
function twoNonwinPerOpponentDesign({
  gamesPerStratum,
  confidence = 0.95,
  fieldSize = DEFAULT_FIELD_SIZE
}) {
  assertPositiveInteger(gamesPerStratum, 'gamesPerStratum');
  assertProbability(confidence, 'confidence');
  assertPositiveInteger(fieldSize, 'fieldSize');
  if (confidence <= 0 || confidence >= 1) {
    throw new RangeError('confidence must be between 0 and 1');
  }

  const gamesPerOpponent = STRATA_PER_OPPONENT * gamesPerStratum;
  const totalForField = gamesPerOpponent * fieldSize;
  const alphaEach = (1 - confidence) / fieldSize;
  const equalStratumPValue = binomialAtMostTwoFailures(
    gamesPerOpponent, 1 - TARGET_WIN_RATE);
  const heterogeneityProofApplies =
    gamesPerStratum >= MIN_STRATUM_FOR_HETEROGENEITY_PROOF;
  const worstCasePValue = heterogeneityProofApplies
    ? equalStratumPValue
    : null;

  return {
    maxNonwinsPerOpponent: 2,
    gamesPerStratum,
    gamesPerOpponent,
    totalForField,
    target: TARGET_WIN_RATE,
    confidence,
    alphaEach,
    equalStratumPValue,
    worstCasePValue,
    heterogeneityProofApplies,
    minimumStratumForHeterogeneityProof: MIN_STRATUM_FOR_HETEROGENEITY_PROOF,
    passes: heterogeneityProofApplies && worstCasePValue <= alphaEach
  };
}

function minimumGamesPerStratumForTwoNonwins(options = {}) {
  const confidence = options.confidence ?? 0.95;
  const fieldSize = options.fieldSize ?? DEFAULT_FIELD_SIZE;
  assertProbability(confidence, 'confidence');
  assertPositiveInteger(fieldSize, 'fieldSize');
  if (confidence <= 0 || confidence >= 1) {
    throw new RangeError('confidence must be between 0 and 1');
  }
  for (let n = MIN_STRATUM_FOR_HETEROGENEITY_PROOF; n < 10000000; n++) {
    const result = twoNonwinPerOpponentDesign({
      gamesPerStratum: n,
      confidence,
      fieldSize
    });
    if (result.passes) return result;
  }
  throw new RangeError('sample-size search exceeded its safety limit');
}

module.exports = {
  binomialAtMostTwoFailures,
  fourStrataAtMostTwoFailuresProbability,
  twoNonwinPerOpponentDesign,
  minimumGamesPerStratumForTwoNonwins,
  STRATA_PER_OPPONENT,
  DEFAULT_FIELD_SIZE,
  TARGET_WIN_RATE,
  NULL_FAILURE_SUM,
  MIN_STRATUM_FOR_HETEROGENEITY_PROOF
};
