'use strict';

const {validateFieldLedger, FIELD_SIZE} =
  require('./agent12-balanced-field-ledger-validator.cjs');
const {lowerKlBound} =
  require('./agent12-balanced-kl-field-bound.cjs');

const STRATA_PER_OPPONENT = 2 * 2;

/**
 * Simultaneous one-sided confidence bounds for all 32 original matchups.
 *
 * Each opponent's target win probability is the equally weighted mean over
 * candidate physical seat 0/1 and first-player seat 0/1. The strict ledger
 * validator requires the same number of independent attempts in all 128
 * rank/seat/first-player strata. Within each rank, the heterogeneous
 * Bernoulli Chernoff-KL bound is applied to its 4k games. Bonferroni across
 * 32 ranks provides familywise confidence of at least the requested level.
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
    const lower = lowerKlBound(winCount, total, confidenceEach);
    return {
      rank: index + 1,
      winCount,
      nonwinCount: total - winCount,
      totalAttempts: total,
      observedWinRate: winCount / total,
      conditionalLowerBound: lower,
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
    rejectionReasons: v.rejectionReasons,
    externalPaperAndIndependenceAuditRequired: true
  };
}

module.exports = {assessSimultaneousMatchups};
