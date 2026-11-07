'use strict';

const FIELD_SIZE = 32;
const SEATS = [0, 1];
const FIRST_PLAYER_SEATS = [0, 1];
const SHA256 = /^[a-f0-9]{64}$/i;

/**
 * Conservative all-success-only inference for an equally weighted 32-rank,
 * two-seat, two-first-player-condition opponent field. The arithmetic assumes every observation is an
 * independent Bernoulli game under an unchanged candidate and policy.
 *
 * This module can check the supplied receipts for completeness and repeated
 * physical deals. It cannot independently authenticate paper legality,
 * policy competence, independence, or the completeness of a preregistration.
 * Its return value is conditional statistical evidence, never game admission.
 *
 * @param {{
 *  originalSources: Array<{rank:number, source60Sha:string,
 *    authenticatedSource60:boolean}>,
 *  attempts: Array<{rank:number, seat:number, trialId:string,
 *    physicalDealId:string, paperReceiptId:string, status:string,
 *    firstPlayerSeat:number,
 *    source60Sha:string, candidate60Sha:string,
 *    candidatePolicySha:string, registrationSha:string}>,
 *  registeredAttemptCount:number,
 *  registrationSha:string,
 *  target?:number,
 *  confidence?:number
 * }} request
 * @returns {{
 *   conditionalStatisticalThresholdMet:boolean,
 *   conditionalLowerBound:number|null, totalAttempts:number,
 *   attemptsPerRankSeatAndFirstPlayer:number|null,
 *   requiredPerRankSeatAndFirstPlayer:number,
 *   rejectionReasons:string[], externalPaperAndIndependenceAuditRequired:true
 * }}
 */
function assessPerfectField(request) {
  if (!request || !Array.isArray(request.originalSources) ||
      !Array.isArray(request.attempts)) {
    throw new TypeError('originalSources and attempts must be arrays');
  }
  const {originalSources, attempts, registeredAttemptCount,
    registrationSha, target = 0.995, confidence = 0.95} = request;
  if (!(target > 0 && target < 1) ||
      !(confidence > 0 && confidence < 1)) {
    throw new RangeError('target and confidence must be between 0 and 1');
  }
  const requiredPerRankSeatAndFirstPlayer = Math.ceil(
    Math.log(1 - confidence) / (FIELD_SIZE * SEATS.length * FIRST_PLAYER_SEATS.length * Math.log(target))
  );
  const problems = new Set();
  const sourceByRank = new Map();
  if (originalSources.length !== FIELD_SIZE) problems.add('field-incomplete');
  for (const source of originalSources) {
    if (!Number.isInteger(source.rank) ||
        source.rank < 1 || source.rank > FIELD_SIZE ||
        sourceByRank.has(source.rank)) {
      problems.add('invalid-or-repeated-source-rank');
      continue;
    }
    sourceByRank.set(source.rank, source);
    if (!SHA256.test(source.source60Sha) ||
        source.authenticatedSource60 !== true) {
      problems.add('source-unverified');
    }
  }
  if (sourceByRank.size !== FIELD_SIZE) problems.add('field-incomplete');
  if (!Number.isSafeInteger(registeredAttemptCount) ||
      registeredAttemptCount !== attempts.length) {
    problems.add('incomplete-preregistered-attempt-ledger');
  }
  if (!SHA256.test(registrationSha)) problems.add('registration-unverified');
  const counts = Array.from({length: FIELD_SIZE}, () =>
    SEATS.map(() => [0, 0]));
  const trialIds = new Set();
  const physicalDealIds = new Set();
  const paperReceiptIds = new Set();
  let candidate60Sha = null;
  let candidatePolicySha = null;
  for (const attempt of attempts) {
    if (!Number.isInteger(attempt.rank) || attempt.rank < 1 ||
        attempt.rank > FIELD_SIZE || !SEATS.includes(attempt.seat) ||
        !FIRST_PLAYER_SEATS.includes(attempt.firstPlayerSeat)) {
      problems.add('invalid-rank-seat-or-first-player');
      continue;
    }
    counts[attempt.rank - 1][attempt.seat][attempt.firstPlayerSeat]++;
    const source = sourceByRank.get(attempt.rank);
    if (!source || attempt.source60Sha !== source.source60Sha) {
      problems.add('source-identity-mismatch');
    }
    if (attempt.status !== 'paper-qualified-win') {
      problems.add('nonwin-or-unqualified-attempt');
    }
    for (const [key, seen, error] of [
      ['trialId', trialIds, 'duplicate-or-missing-trial'],
      ['physicalDealId', physicalDealIds, 'duplicate-or-missing-physical-deal'],
      ['paperReceiptId', paperReceiptIds, 'duplicate-or-missing-paper-receipt']
    ]) {
      const value = attempt[key];
      if (typeof value !== 'string' || value.length === 0 || seen.has(value)) {
        problems.add(error);
      } else {
        seen.add(value);
      }
    }
    if (!SHA256.test(attempt.candidate60Sha) ||
        !SHA256.test(attempt.candidatePolicySha)) {
      problems.add('candidate-or-policy-unverified');
    }
    if (candidate60Sha === null) candidate60Sha = attempt.candidate60Sha;
    if (candidatePolicySha === null) {
      candidatePolicySha = attempt.candidatePolicySha;
    }
    if (attempt.candidate60Sha !== candidate60Sha ||
        attempt.candidatePolicySha !== candidatePolicySha) {
      problems.add('candidate-or-policy-changed');
    }
    if (attempt.registrationSha !== registrationSha) {
      problems.add('registration-mismatch');
    }
  }
  const strata = counts.flat(2);
  const n = strata[0];
  if (n === 0 || strata.some(value => value !== n)) {
    problems.add('rank-seat-first-player-exposure-unbalanced');
  }
  const rejectionReasons = [...problems].sort();
  const admissible = rejectionReasons.length === 0;
  // Balanced data under the independence assumptions:
  // P(all wins) = product(p_i^n) <= (mean_i p_i)^(128*n), by AM-GM.
  const lower = admissible ?
    Math.exp(Math.log(1 - confidence) / attempts.length) : null;
  return {
    conditionalStatisticalThresholdMet: admissible && lower >= target,
    conditionalLowerBound: lower,
    totalAttempts: attempts.length,
    attemptsPerRankSeatAndFirstPlayer: admissible ? n : null,
    requiredPerRankSeatAndFirstPlayer,
    rejectionReasons,
    externalPaperAndIndependenceAuditRequired: true
  };
}

module.exports = {assessPerfectField, FIELD_SIZE};
