'use strict';

const {validateFieldLedger} =
  require('./agent12-balanced-field-ledger-validator.cjs');

/**
 * Binary KL divergence D(q || p), for q in (0,1], p in (0,q).
 * Used only for a one-sided LOWER confidence bound on the mean.
 * @param {number} q Observed complete-paper-game win fraction.
 * @param {number} p Candidate null field win probability.
 * @returns {number}
 */
function binaryKl(q, p) {
  if (p === 0) return Infinity;
  if (q === 1) return -Math.log(p);
  return q * Math.log(q / p) +
    (1 - q) * Math.log1p((p - q) / (1 - p));
}

/**
 * Inverse of the heterogeneous independent Bernoulli upper-tail
 * Chernoff-KL inequality. For a balanced panel of independent, identically
 * configured but NOT necessarily identically distributed Bernoulli games:
 *
 * Pr(S/N >= q | population mean mu < q) <= exp(-N D(q || mu)).
 *
 * For Bernoulli games with different probabilities, the MGF is at most the
 * MGF of N Bernoulli(mu) by Jensen's inequality for log(1-p+p*exp(t)).
 * This bound therefore does not assume matchups have equal strengths.
 *
 * @param {number} wins Number of actual qualified game wins.
 * @param {number} total Number of all prospectively registered completed games.
 * @param {number} confidence Desired one-sided coverage, e.g. 0.95.
 * @returns {number} Conservative lower confidence bound on equal field mean.
 */
function lowerKlBound(wins, total, confidence) {
  if (!Number.isSafeInteger(wins) || !Number.isSafeInteger(total) ||
      total < 1 || wins < 0 || wins > total) {
    throw new RangeError('invalid qualified win/attempt counts');
  }
  if (!(confidence > 0 && confidence < 1)) {
    throw new RangeError('confidence must be strictly between 0 and 1');
  }
  if (wins === 0) return 0;
  const q = wins / total;
  if (wins === total) return Math.exp(Math.log(1 - confidence) / total);
  const threshold = -Math.log1p(-confidence) / total;
  let lo = 0;
  let hi = q;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (binaryKl(q, mid) > threshold) lo = mid;
    else hi = mid;
  }
  return lo;
}

/**
 * Complete 32-original-opponent balanced paper-game panel, including
 * paper-qualified wins, losses, and ties. Ties count as nonwins for the
 * objective of maximizing GAME WIN PROBABILITY. Assumes independently sampled
 * deals and truly externally audited outcomes: labels are caller assertions.
 *
 * Returns no lower bound unless all 32 unique original source rosters are
 * attested, all expected 128 rank/seat/first-player strata are equally
 * exposed, all preregistered attempts are present, source and candidate
 * fingerprints match, engine + hooks/opponent policy/adjudication bundle are
 * immutable, deal and receipt IDs do not repeat, and no native-only errors,
 * censoring, or unqualified rows are present.
 *
 * @param {object} request The shared qualified field ledger contract.
 * @returns {{conditionalLowerBound:number|null,
 *  conditionalStatisticalThresholdMet:boolean,
 *  observedWinRate:number|null,winCount:number|null,totalAttempts:number,
 *  attemptsPerRankSeatAndFirstPlayer:number|null,rejectionReasons:string[],
 *  externalPaperAndIndependenceAuditRequired:true}}
 */
function assessBalancedFieldKl(request) {
  const v = validateFieldLedger(request,
    ['paper-qualified-win','paper-qualified-loss','paper-qualified-tie'],
    'noncompleted-or-unqualified-attempt');
  const valid = v.rejectionReasons.length === 0;
  const lower = valid ?
    lowerKlBound(v.winCount, v.totalAttempts, v.confidence) : null;
  return {
    conditionalLowerBound: lower,
    conditionalStatisticalThresholdMet: valid && lower >= v.target,
    observedWinRate: valid ? v.winCount / v.totalAttempts : null,
    winCount: valid ? v.winCount : null,
    totalAttempts: v.totalAttempts,
    attemptsPerRankSeatAndFirstPlayer: v.attemptsPerRankSeatAndFirstPlayer,
    rejectionReasons: v.rejectionReasons,
    externalPaperAndIndependenceAuditRequired: true
  };
}

module.exports = {assessBalancedFieldKl,lowerKlBound,binaryKl};
