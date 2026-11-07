'use strict';

const {validateFieldLedger, FIELD_SIZE} =
  require('./agent12-balanced-field-ledger-validator.cjs');
const STRATA = FIELD_SIZE * 2 * 2;

/**
 * One-sided conservative inference for an all-win prospectively balanced
 * 32-rank x 2 physical-seat x 2 first-player assignment panel. This does
 * NOT authenticate paper legality, real independent deals, complete event
 * adjudication, opposition decision quality, or any supplied source roster.
 *
 * Proof: when each of the 128 stratum win probabilities p_i is observed
 * in k independent games and ALL N=128k outcomes are wins,
 * P(all wins)=product(p_i^k) <= (mean(p_i))^(128k), by AM-GM.
 *
 * @param {object} request Complete signed-off-by-external-auditor
 *   originalSources/attempts/registration fields as specified in
 *   agent12-balanced-field-ledger-validator.cjs. Only a paper-qualified-win
 *   status is admissible. Self-asserted receipt labels remain untrusted.
 * @returns {{conditionalStatisticalThresholdMet:boolean,
 *   conditionalLowerBound:number|null,totalAttempts:number,
 *   attemptsPerRankSeatAndFirstPlayer:number|null,
 *   requiredPerRankSeatAndFirstPlayer:number,rejectionReasons:string[],
 *   externalPaperAndIndependenceAuditRequired:true}}
 */
function assessPerfectField(request) {
  const v = validateFieldLedger(request,
    ['paper-qualified-win'], 'nonwin-or-unqualified-attempt');
  const requiredPerRankSeatAndFirstPlayer =
    Math.ceil(Math.log(1 - v.confidence) /
      (STRATA * Math.log(v.target)));
  const admissible = v.rejectionReasons.length === 0;
  const lower = admissible ?
    Math.exp(Math.log(1 - v.confidence) / v.totalAttempts) : null;
  return {
    conditionalStatisticalThresholdMet: admissible && lower >= v.target,
    conditionalLowerBound: lower,
    totalAttempts: v.totalAttempts,
    attemptsPerRankSeatAndFirstPlayer: v.attemptsPerRankSeatAndFirstPlayer,
    requiredPerRankSeatAndFirstPlayer,
    rejectionReasons: v.rejectionReasons,
    externalPaperAndIndependenceAuditRequired: true
  };
}

module.exports = {assessPerfectField, FIELD_SIZE};
