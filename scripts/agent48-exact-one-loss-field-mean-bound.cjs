'use strict';

const FIELD_SIZE = 32;
const STRATA_PER_OPPONENT = 4;
const STRATA_COUNT = FIELD_SIZE * STRATA_PER_OPPONENT;
const TARGET_FIELD_MEAN = 0.995;
const CONFIDENCE = 0.95;
const ALPHA = 1 - CONFIDENCE;
const NULL_FAILURE_BUDGET = STRATA_COUNT * (1 - TARGET_FIELD_MEAN);
const MINIMUM_CONCAVITY_GAMES_PER_CELL = Math.ceil(
  (2 / (1 - NULL_FAILURE_BUDGET) - 1) / NULL_FAILURE_BUDGET
);

function assertPositiveInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new TypeError(label + ' must be a positive safe integer');
  }
}

function assertProbability(value, label) {
  if (typeof value !== 'number' || !Number.isFinite(value) ||
      value < 0 || value > 1) {
    throw new TypeError(label + ' must be a finite probability in [0,1]');
  }
}

/** Exact P[Binomial(trials, q) <= 1]. */
function binomialAtMostOneNonwins(trials, q) {
  assertPositiveInteger(trials, 'trials');
  assertProbability(q, 'failureProbability');
  if (q === 0) return 1;
  if (q === 1) return trials === 1 ? 1 : 0;
  const p0 = Math.exp(trials * Math.log1p(-q));
  return p0 * (1 + trials * q / (1 - q));
}

/**
 * Exact P[total nonwins <= 1] for 128 independent Binomial(n, q_i) cells.
 * This is a heterogeneous-stratum spot-check; the accompanying result proves
 * the equal-rate vector is least favourable for the target design.
 */
function stratifiedAtMostOneNonwins(failureProbabilities, gamesPerCell) {
  if (!Array.isArray(failureProbabilities) ||
      failureProbabilities.length !== STRATA_COUNT) {
    throw new TypeError('failureProbabilities must contain exactly 128 values');
  }
  assertPositiveInteger(gamesPerCell, 'gamesPerCell');
  let logP0 = 0;
  let oddsSum = 0;
  let forcedNonwins = 0;
  for (const q of failureProbabilities) {
    assertProbability(q, 'failureProbability');
    if (q === 1) {
      forcedNonwins += gamesPerCell;
      continue;
    }
    if (q !== 0) {
      logP0 += gamesPerCell * Math.log1p(-q);
      oddsSum += q / (1 - q);
    }
  }
  if (forcedNonwins >= 2) return 0;
  const p0 = Math.exp(logP0);
  if (forcedNonwins === 1) return p0;
  return p0 * (1 + gamesPerCell * oddsSum);
}

/**
 * Fixed-sample exact design for the equal-weight 32-opponent field mean.
 * Every opponent has four equally weighted seat/first-player cells; every
 * cell receives the same number of independent, paper-qualified games.
 * Acceptance allows at most one nonwin across the entire 128-cell field.
 */
function oneLossFieldMeanDesign({ gamesPerCell }) {
  assertPositiveInteger(gamesPerCell, 'gamesPerCell');
  const totalGames = STRATA_COUNT * gamesPerCell;
  const worstCasePValue = binomialAtMostOneNonwins(
    totalGames, 1 - TARGET_FIELD_MEAN);
  const heterogeneityProofApplies =
    gamesPerCell >= MINIMUM_CONCAVITY_GAMES_PER_CELL;
  return {
    fieldSize: FIELD_SIZE,
    strataPerOpponent: STRATA_PER_OPPONENT,
    strataCount: STRATA_COUNT,
    gamesPerCell,
    gamesPerOpponent: STRATA_PER_OPPONENT * gamesPerCell,
    totalGames,
    targetFieldMean: TARGET_FIELD_MEAN,
    confidence: CONFIDENCE,
    alpha: ALPHA,
    maximumNonwins: 1,
    nullFailureBudget: NULL_FAILURE_BUDGET,
    minimumConcavityGamesPerCell: MINIMUM_CONCAVITY_GAMES_PER_CELL,
    heterogeneityProofApplies,
    worstCasePValue,
    passes: heterogeneityProofApplies && worstCasePValue <= ALPHA
  };
}

function minimumGamesPerCellForOneLossFieldMean() {
  for (let n = MINIMUM_CONCAVITY_GAMES_PER_CELL; n < 10000000; n++) {
    const result = oneLossFieldMeanDesign({ gamesPerCell: n });
    if (result.passes) return result;
  }
  throw new RangeError('sample-size search exceeded its safety limit');
}

module.exports = {
  FIELD_SIZE,
  STRATA_PER_OPPONENT,
  STRATA_COUNT,
  TARGET_FIELD_MEAN,
  CONFIDENCE,
  ALPHA,
  NULL_FAILURE_BUDGET,
  MINIMUM_CONCAVITY_GAMES_PER_CELL,
  binomialAtMostOneNonwins,
  stratifiedAtMostOneNonwins,
  oneLossFieldMeanDesign,
  minimumGamesPerCellForOneLossFieldMean
};
