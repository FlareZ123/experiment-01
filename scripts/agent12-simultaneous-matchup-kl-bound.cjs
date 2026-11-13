'use strict';

const {validateFieldLedger, FIELD_SIZE} =
  require('./agent12-balanced-field-ledger-validator.cjs');
const {lowerKlBound} =
  require('./agent12-balanced-kl-field-bound.cjs');

const STRATA_PER_OPPONENT = 2 * 2;

/**
 * Exact lower confidence bound for one nonwin in four equally sampled
 * Bernoulli strata. The within-stratum outcomes must be i.i.d.; this is a
 * stricter model than the heterogeneous independent-game KL fallback.
 *
 * The log-tail concavity proof applies when Q=4*(1-target) satisfies
 * 1+nQ >= 2/(1-Q). The returned root is restricted to that proven interval.
 * Returns null when the proof/bracket does not apply.
 */
function exactOneLossIidLowerBound(gamesPerStratum, alpha, target) {
  if (!Number.isSafeInteger(gamesPerStratum) || gamesPerStratum < 1 ||
      !(alpha > 0 && alpha < 1) || !(target > 0.75 && target < 1)) {
    return null;
  }
  const n = gamesPerStratum;
  const qBar = 1 - target;
  const Q = STRATA_PER_OPPONENT * qBar;
  if (!(Q > 0 && Q < 1)) return null;
  const uMax = 1 / (1 - Q);
  const minimumN = Math.ceil((2 * uMax - 1) / Q);
  if (n < minimumN) return null;

  const discriminant = (n - 1) * (n - 1) - 4 * n;
  if (discriminant < 0) return null;
  const root = Math.sqrt(discriminant);
  const qLow = ((n - 1) - root) / (2 * n);
  const qHigh = ((n - 1) + root) / (2 * n);
  const pLow = 1 - qHigh / STRATA_PER_OPPONENT;
  const pHigh = 1 - qLow / STRATA_PER_OPPONENT;
  const total = STRATA_PER_OPPONENT * n;

  // P[Binomial(total, 1-p) <= 1], monotone increasing in p.
  const tail = p => {
    const q = 1 - p;
    return Math.pow(p, total) +
      total * q * Math.pow(p, total - 1);
  };
  if (tail(pLow) > alpha || tail(pHigh) < alpha) return null;

  let lo = pLow;
  let hi = pHigh;
  for (let i = 0; i < 120; i++) {
    const mid = (lo + hi) / 2;
    if (tail(mid) <= alpha) lo = mid;
    else hi = mid;
  }
  return lo;
}

/**
 * Exact lower confidence bound for two nonwins in four equally sampled
 * Bernoulli strata. The Schur-concavity proof requires D(Q)>=0 and
 * D'(R_min)>=0; the two quadratic inequalities define the Q interval below.
 * As with the one-loss case, outcomes must be i.i.d. within each stratum.
 */
function exactTwoLossIidLowerBound(gamesPerStratum, alpha, target) {
  if (!Number.isSafeInteger(gamesPerStratum) || gamesPerStratum < 2 ||
      !(alpha > 0 && alpha < 1) || !(target > 0.75 && target < 1)) {
    return null;
  }
  const n = gamesPerStratum;
  const Q = STRATA_PER_OPPONENT * (1 - target);
  if (!(Q > 0 && Q < 1)) return null;
  const rMax = Q / (1 - Q);
  const RMin = Q / (1 - Q / STRATA_PER_OPPONENT);
  const DMin = -rMax - n * RMin * (1 + 2 * rMax) +
    n * (n - 1) * RMin * RMin / 2;
  const derivativeMin = n *
    ((n - 1) * RMin - (1 + 2 * rMax));
  if (DMin < 0 || derivativeMin < 0) return null;

  // D(R_min)>=0 is equivalent to A*Q^2+B*Q+C<=0.
  const dA = 8 * n * n - 12 * n + 1;
  const dB = -8 * n * n + 20 * n - 8;
  const dC = 16 * n + 16;
  const dDiscriminant = dB * dB - 4 * dA * dC;
  if (!(dA > 0 && dDiscriminant >= 0)) return null;
  const dRoot = Math.sqrt(dDiscriminant);
  const dHigh = (-dB + dRoot) / (2 * dA);
  const dLow = dC / (dA * dHigh);

  // D'(R_min)>=0 is equivalent to A2*Q^2+B2*Q+C2<=0.
  const pA = 4 * n - 5;
  const pB = -(4 * n - 7);
  const pC = 4;
  const pDiscriminant = pB * pB - 4 * pA * pC;
  if (!(pA > 0 && pDiscriminant >= 0)) return null;
  const pRoot = Math.sqrt(pDiscriminant);
  const pHigh = (-pB + pRoot) / (2 * pA);
  const pLow = pC / (pA * pHigh);

  const qLow = Math.max(dLow, pLow);
  const qHigh = Math.min(dHigh, pHigh);
  if (!(qLow < qHigh && Q >= qLow && Q <= qHigh)) return null;
  const pLowBound = 1 - qHigh / STRATA_PER_OPPONENT;
  const pHighBound = 1 - qLow / STRATA_PER_OPPONENT;
  const total = STRATA_PER_OPPONENT * n;

  // P[Binomial(total, 1-p) <= 2], monotone increasing in p.
  const tail = p => {
    const q = 1 - p;
    return Math.pow(p, total) +
      total * q * Math.pow(p, total - 1) +
      total * (total - 1) / 2 * q * q * Math.pow(p, total - 2);
  };
  if (tail(pLowBound) > alpha || tail(pHighBound) < alpha) return null;

  let lo = pLowBound;
  let hi = pHighBound;
  for (let i = 0; i < 120; i++) {
    const mid = (lo + hi) / 2;
    if (tail(mid) <= alpha) lo = mid;
    else hi = mid;
  }
  return lo;
}

/**
 * Simultaneous one-sided confidence bounds for all 32 original matchups.
 *
 * Each opponent's target win probability is the equally weighted mean over
 * candidate physical seat 0/1 and first-player seat 0/1. The strict ledger
 * validator requires the same number of independent attempts in all 128
 * rank/seat/first-player strata. By default, the heterogeneous Bernoulli
 * Chernoff-KL bound is applied to each rank's 4k games. If the preregistration
 * explicitly declares stratumSamplingModel='iid-bernoulli-v1', a rank with
 * exactly one or two nonwins may use their sharper exact bounds, but only when
 * the relevant concavity proof applies. Three or more nonwins and all other
 * cases retain the heterogeneous KL method. Bonferroni across 32 ranks provides familywise
 * confidence of at least the requested level.
 *
 * The exact one- and two-loss modes assume identically distributed outcomes
 * within each rank/seat/first-player stratum, not merely independent outcomes. The
 * sampling-model declaration must be frozen in the registration and audited
 * externally. Without it, the evaluator never selects the exact branch.
 *
 * This is stronger than a single field-mean bound. It requires every one of
 * the 32 opponent means to clear the target simultaneously. All labels and
 * source/independence facts remain caller assertions requiring external audit.
 *
 * @param {object} request Complete frozen field ledger.
 * @returns {{conditionalSimultaneousThresholdMet:boolean,
 *   minMatchupLowerBound:number|null,perRank:object[],totalAttempts:number,
 *   winCount:number,attemptsPerRankSeatAndFirstPlayer:number|null,
 *   requiredPerStratumForAllWinTarget:number,
 *   requiredPerOpponentForAllWinTarget:number,
 *   requiredTotalForAllWinTarget:number,rejectionReasons:string[],
 *   externalPaperAndIndependenceAuditRequired:true}}
 */
function assessSimultaneousMatchups(request) {
  const v = validateFieldLedger(request, [
    'paper-qualified-win',
    'paper-qualified-loss',
    'paper-qualified-tie'
  ], 'noncompleted-or-unqualified-attempt');
  const admissible = v.rejectionReasons.length === 0;
  const alphaEach = (1 - v.confidence) / FIELD_SIZE;
  const confidenceEach = 1 - alphaEach;
  const requiredPerStratumForAllWinTarget = Math.ceil(
    Math.log(alphaEach) /
      (STRATA_PER_OPPONENT * Math.log(v.target)));
  const requiredPerOpponentForAllWinTarget =
    STRATA_PER_OPPONENT * requiredPerStratumForAllWinTarget;
  const requiredTotalForAllWinTarget =
    FIELD_SIZE * requiredPerOpponentForAllWinTarget;
  const exactIidMode =
    request.stratumSamplingModel === 'iid-bernoulli-v1';
  const samplingModelDeclaration = exactIidMode
    ? 'iid-bernoulli-v1 (caller assertion; external audit required)'
    : 'heterogeneous-independent-Bernoulli default';

  if (!admissible) {
    return {
      conditionalSimultaneousThresholdMet: false,
      minMatchupLowerBound: null,
      perRank: [],
      totalAttempts: v.totalAttempts,
      winCount: v.winCount,
      attemptsPerRankSeatAndFirstPlayer:
        v.attemptsPerRankSeatAndFirstPlayer,
      requiredPerStratumForAllWinTarget,
      requiredPerOpponentForAllWinTarget,
      requiredTotalForAllWinTarget,
      samplingModelDeclaration,
      rejectionReasons: v.rejectionReasons,
      externalPaperAndIndependenceAuditRequired: true
    };
  }

  const totals = Array(FIELD_SIZE).fill(0);
  const wins = Array(FIELD_SIZE).fill(0);
  for (const attempt of request.attempts) {
    const index = attempt.rank - 1;
    totals[index]++;
    if (attempt.status === 'paper-qualified-win') wins[index]++;
  }

  const perRank = totals.map((total, index) => {
    const winCount = wins[index];
    const nonwinCount = total - winCount;
    let lower;
    let boundMethod;
    if (nonwinCount === 0) {
      // The all-win AM-GM bound is exact even for heterogeneous independent
      // Bernoulli outcomes, so it does not require the i.i.d. declaration.
      lower = lowerKlBound(winCount, total, confidenceEach);
      boundMethod = 'all-win-exact';
    } else if (nonwinCount === 1 && exactIidMode) {
      lower = exactOneLossIidLowerBound(
        v.attemptsPerRankSeatAndFirstPlayer, alphaEach, v.target);
      if (lower !== null) {
        boundMethod = 'exact-one-loss-iid';
      } else {
        lower = lowerKlBound(winCount, total, confidenceEach);
        boundMethod = 'heterogeneous-kl';
      }
    } else if (nonwinCount === 2 && exactIidMode) {
      lower = exactTwoLossIidLowerBound(
        v.attemptsPerRankSeatAndFirstPlayer, alphaEach, v.target);
      if (lower !== null) {
        boundMethod = 'exact-two-loss-iid';
      } else {
        lower = lowerKlBound(winCount, total, confidenceEach);
        boundMethod = 'heterogeneous-kl';
      }
    } else {
      lower = lowerKlBound(winCount, total, confidenceEach);
      boundMethod = 'heterogeneous-kl';
    }
    return {
      rank: index + 1,
      winCount,
      nonwinCount,
      totalAttempts: total,
      observedWinRate: winCount / total,
      conditionalLowerBound: lower,
      boundMethod,
      reachesTarget: lower >= v.target
    };
  });
  const minMatchupLowerBound = Math.min(
    ...perRank.map(row => row.conditionalLowerBound));
  return {
    conditionalSimultaneousThresholdMet:
      perRank.every(row => row.reachesTarget),
    minMatchupLowerBound,
    perRank,
    totalAttempts: v.totalAttempts,
    winCount: v.winCount,
    attemptsPerRankSeatAndFirstPlayer:
      v.attemptsPerRankSeatAndFirstPlayer,
    requiredPerStratumForAllWinTarget,
    requiredPerOpponentForAllWinTarget,
    requiredTotalForAllWinTarget,
    samplingModelDeclaration,
    rejectionReasons: v.rejectionReasons,
    externalPaperAndIndependenceAuditRequired: true
  };
}

module.exports = {assessSimultaneousMatchups, exactOneLossIidLowerBound,
  exactTwoLossIidLowerBound};
