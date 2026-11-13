'use strict';

const STRATA_PER_OPPONENT = 4;
const FIELD_SIZE = 32;

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

/** Exact P[Binomial(trials, q) <= 1]. */
function binomialAtMostOneFailures(trials, q) {
  assertPositiveInteger(trials, 'trials');
  assertProbability(q, 'failureProbability');
  if (q === 0) return 1;
  if (q === 1) return trials === 1 ? 1 : 0;
  const p0 = Math.pow(1 - q, trials);
  const p1 = trials * q * Math.pow(1 - q, trials - 1);
  return p0 + p1;
}

/**
 * Exact P[total failures <= 1] for four independent Binomial(n, q_i) cells.
 * This is useful for spot-checking heterogeneous strata against the proven
 * equal-probability extremum used by oneLossPerOpponentDesign().
 */
function fourStrataOneLossProbability(failureProbabilities, gamesPerStratum) {
  if (!Array.isArray(failureProbabilities) ||
      failureProbabilities.length !== STRATA_PER_OPPONENT) {
    throw new TypeError('failureProbabilities must contain four values');
  }
  assertPositiveInteger(gamesPerStratum, 'gamesPerStratum');
  for (const q of failureProbabilities) assertProbability(q, 'failureProbability');
  let p0 = 1;
  let oddsSum = 0;
  let forcedFailures = 0;
  for (const q of failureProbabilities) {
    if (q === 1) {
      forcedFailures += gamesPerStratum;
      continue;
    }
    p0 *= Math.pow(1 - q, gamesPerStratum);
    oddsSum += q / (1 - q);
  }
  if (forcedFailures >= 2) return 0;
  if (forcedFailures === 1) return p0;
  return p0 * (1 + gamesPerStratum * oddsSum);
}

/**
 * One-nonwin-per-opponent exact design test.
 *
 * For four equally sampled strata with per-stratum failure probabilities q_i,
 * P(total failures <= 1) is maximized at q_i = qbar when n is large enough
 * for log-concavity (see the accompanying result). Thus the worst-case null
 * p-value at mean win rate target is the ordinary Binomial(4n, 1-target)
 * lower tail. Bonferroni allocates alpha/32 to each opponent.
 */
function oneLossPerOpponentDesign({
  gamesPerStratum,
  target = 0.995,
  confidence = 0.95,
  fieldSize = FIELD_SIZE
}) {
  assertPositiveInteger(gamesPerStratum, 'gamesPerStratum');
  assertProbability(target, 'target');
  assertProbability(confidence, 'confidence');
  assertPositiveInteger(fieldSize, 'fieldSize');
  if (target <= 0.75 || target >= 1 || confidence <= 0 || confidence >= 1) {
    throw new RangeError('target must be in (0.75,1) and confidence in (0,1)');
  }

  const qBar = 1 - target;
  const totalTrials = STRATA_PER_OPPONENT * gamesPerStratum;
  const maxCellFailure = STRATA_PER_OPPONENT * qBar;
  const uMax = 1 / (1 - maxCellFailure);
  // C = 1 + n*sum(q_i/(1-q_i)) >= 1 + 4*n*qBar.
  // C >= 2*uMax is sufficient for the Hessian of log P(X<=1) to be
  // negative semidefinite over the four-cell simplex.
  const minimumStratumForConcavity = Math.ceil(
    (2 * uMax - 1) / (STRATA_PER_OPPONENT * qBar)
  );
  const heterogeneityProofApplies =
    gamesPerStratum >= minimumStratumForConcavity;
  const alphaEach = (1 - confidence) / fieldSize;
  const worstCasePValue = binomialAtMostOneFailures(totalTrials, qBar);
  return {
    gamesPerStratum,
    gamesPerOpponent: totalTrials,
    totalForField: totalTrials * fieldSize,
    target,
    confidence,
    alphaEach,
    worstCasePValue,
    heterogeneityProofApplies,
    minimumStratumForConcavity,
    passes: heterogeneityProofApplies && worstCasePValue <= alphaEach
  };
}

function minimumGamesPerStratumForOneLoss(options = {}) {
  const target = options.target ?? 0.995;
  const confidence = options.confidence ?? 0.95;
  const fieldSize = options.fieldSize ?? FIELD_SIZE;
  assertProbability(target, 'target');
  assertProbability(confidence, 'confidence');
  assertPositiveInteger(fieldSize, 'fieldSize');
  if (target <= 0.75 || target >= 1 || confidence <= 0 || confidence >= 1) {
    throw new RangeError('target must be in (0.75,1) and confidence in (0,1)');
  }
  const qBar = 1 - target;
  const maxCellFailure = STRATA_PER_OPPONENT * qBar;
  const uMax = 1 / (1 - maxCellFailure);
  const minimum = Math.ceil(
    (2 * uMax - 1) / (STRATA_PER_OPPONENT * qBar)
  );
  const alphaEach = (1 - confidence) / fieldSize;
  for (let n = minimum; n < 10000000; n++) {
    const pValue = binomialAtMostOneFailures(
      STRATA_PER_OPPONENT * n, qBar);
    if (pValue <= alphaEach) return oneLossPerOpponentDesign({
      gamesPerStratum: n, target, confidence, fieldSize
    });
  }
  throw new RangeError('sample-size search exceeded its safety limit');
}

module.exports = {
  binomialAtMostOneFailures,
  fourStrataOneLossProbability,
  oneLossPerOpponentDesign,
  minimumGamesPerStratumForOneLoss
};


function binomialAtMostTwoFailures(trials, q) {
  assertPositiveInteger(trials, 'trials');
  assertProbability(q, 'failureProbability');
  if (q === 0) return 1;
  if (q === 1) return trials <= 2 ? 1 : 0;
  const p0 = Math.pow(1 - q, trials);
  const p1 = trials * q * Math.pow(1 - q, trials - 1);
  const p2 = trials >= 2
    ? trials * (trials - 1) / 2 * q * q * Math.pow(1 - q, trials - 2)
    : 0;
  return p0 + p1 + p2;
}

function fourStrataTwoLossProbability(failureProbabilities, gamesPerStratum) {
  if (!Array.isArray(failureProbabilities) ||
      failureProbabilities.length !== STRATA_PER_OPPONENT) {
    throw new TypeError('failureProbabilities must contain four values');
  }
  assertPositiveInteger(gamesPerStratum, 'gamesPerStratum');
  for (const q of failureProbabilities) assertProbability(q, 'failureProbability');
  let distribution = [1, 0, 0];
  for (const q of failureProbabilities) {
    let cell;
    if (q === 0) cell = [1, 0, 0];
    else if (q === 1) {
      cell = gamesPerStratum === 1 ? [0, 1, 0]
        : gamesPerStratum === 2 ? [0, 0, 1] : [0, 0, 0];
    } else {
      const p0 = Math.pow(1 - q, gamesPerStratum);
      const p1 = gamesPerStratum * q * Math.pow(1 - q, gamesPerStratum - 1);
      const p2 = gamesPerStratum >= 2
        ? gamesPerStratum * (gamesPerStratum - 1) / 2 * q * q *
          Math.pow(1 - q, gamesPerStratum - 2)
        : 0;
      cell = [p0, p1, p2];
    }
    const next = [0, 0, 0];
    for (let i = 0; i <= 2; i++) {
      for (let j = 0; j <= 2 - i; j++) next[i + j] += distribution[i] * cell[j];
    }
    distribution = next;
  }
  return distribution.reduce((sum, p) => sum + p, 0);
}

function twoLossConcavityTerms(gamesPerStratum, target) {
  const qBar = 1 - target;
  const Q = STRATA_PER_OPPONENT * qBar;
  const rMax = Q / (1 - Q);
  const RMin = Q / (1 - Q / STRATA_PER_OPPONENT);
  const DMin = -rMax - gamesPerStratum * RMin * (1 + 2 * rMax) +
    gamesPerStratum * (gamesPerStratum - 1) * RMin * RMin / 2;
  const derivativeMin = gamesPerStratum *
    ((gamesPerStratum - 1) * RMin - (1 + 2 * rMax));
  return {Q, rMax, RMin, DMin, derivativeMin};
}

function twoLossConcavityApplies(gamesPerStratum, target) {
  const terms = twoLossConcavityTerms(gamesPerStratum, target);
  return terms.DMin >= 0 && terms.derivativeMin >= 0;
}

function minimumStratumForTwoLossConcavity(target) {
  for (let n = 1; n < 1000000; n++) {
    if (twoLossConcavityApplies(n, target)) return n;
  }
  throw new RangeError('two-loss concavity search exceeded its safety limit');
}

function twoLossPerOpponentDesign({
  gamesPerStratum,
  target = 0.995,
  confidence = 0.95,
  fieldSize = FIELD_SIZE
}) {
  assertPositiveInteger(gamesPerStratum, 'gamesPerStratum');
  assertProbability(target, 'target');
  assertProbability(confidence, 'confidence');
  assertPositiveInteger(fieldSize, 'fieldSize');
  if (target <= 0.75 || target >= 1 || confidence <= 0 || confidence >= 1) {
    throw new RangeError('target must be in (0.75,1) and confidence in (0,1)');
  }
  const totalTrials = STRATA_PER_OPPONENT * gamesPerStratum;
  const minimumStratumForConcavity = minimumStratumForTwoLossConcavity(target);
  const heterogeneityProofApplies = gamesPerStratum >= minimumStratumForConcavity;
  const alphaEach = (1 - confidence) / fieldSize;
  const worstCasePValue = binomialAtMostTwoFailures(totalTrials, 1 - target);
  return {
    gamesPerStratum,
    gamesPerOpponent: totalTrials,
    totalForField: totalTrials * fieldSize,
    target,
    confidence,
    alphaEach,
    worstCasePValue,
    heterogeneityProofApplies,
    minimumStratumForConcavity,
    concavityTerms: twoLossConcavityTerms(gamesPerStratum, target),
    passes: heterogeneityProofApplies && worstCasePValue <= alphaEach
  };
}

function minimumGamesPerStratumForTwoLoss(options = {}) {
  const target = options.target ?? 0.995;
  const confidence = options.confidence ?? 0.95;
  const fieldSize = options.fieldSize ?? FIELD_SIZE;
  assertProbability(target, 'target');
  assertProbability(confidence, 'confidence');
  assertPositiveInteger(fieldSize, 'fieldSize');
  if (target <= 0.75 || target >= 1 || confidence <= 0 || confidence >= 1) {
    throw new RangeError('target must be in (0.75,1) and confidence in (0,1)');
  }
  const minimum = minimumStratumForTwoLossConcavity(target);
  const alphaEach = (1 - confidence) / fieldSize;
  for (let n = minimum; n < 10000000; n++) {
    if (binomialAtMostTwoFailures(STRATA_PER_OPPONENT * n, 1 - target) <= alphaEach) {
      return twoLossPerOpponentDesign({gamesPerStratum:n,target,confidence,fieldSize});
    }
  }
  throw new RangeError('two-loss sample-size search exceeded its safety limit');
}

module.exports.binomialAtMostTwoFailures = binomialAtMostTwoFailures;
module.exports.fourStrataTwoLossProbability = fourStrataTwoLossProbability;
module.exports.twoLossPerOpponentDesign = twoLossPerOpponentDesign;
module.exports.minimumGamesPerStratumForTwoLoss = minimumGamesPerStratumForTwoLoss;
