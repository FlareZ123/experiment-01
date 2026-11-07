'use strict';

// Shared conservative evidence admission gate. No paper evidence or original
// source authenticity is established from caller-supplied boolean/hash strings.
const FIELD_SIZE = 32;
const SEATS = [0, 1];
const FIRST_PLAYER_SEATS = [0, 1];
const SHA256 = /^[a-f0-9]{64}$/i;

/**
 * Verify structure of a COMPLETE equally weighted 32-rank, two-seat,
 * two-first-player 128-stratum registration ledger. For statistical validity,
 * every row must also be externally verified to be a genuinely independent,
 * paper-legal completed game, and the registration must predate the experiment.
 *
 * @param {object} request Caller-supplied complete field receipt manifest.
 * @param {readonly string[]} allowedStatuses Exact externally audited labels.
 * @param {string} unqualifiedLabel Rejection label when status is not allowed.
 * @returns {{target:number,confidence:number,rejectionReasons:string[],
 *   totalAttempts:number,winCount:number,
 *   attemptsPerRankSeatAndFirstPlayer:number|null}}
 */
function validateFieldLedger(request, allowedStatuses, unqualifiedLabel) {
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
  let winCount = 0;

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
  let engineAndHooksSha = null;
  let opponentPolicyBundleSha = null;
  let adjudicationProtocolSha = null;
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
    if (!allowedStatuses.includes(attempt.status)) {
      problems.add(unqualifiedLabel);
    }
    if (attempt.status === 'paper-qualified-win') winCount++;
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
    if (![attempt.engineAndHooksSha,
          attempt.opponentPolicyBundleSha,
          attempt.adjudicationProtocolSha].every(x => SHA256.test(x))) {
      problems.add('engine-opponent-or-adjudication-unverified');
    }
    if (engineAndHooksSha === null) {
      engineAndHooksSha = attempt.engineAndHooksSha;
    }
    if (opponentPolicyBundleSha === null) {
      opponentPolicyBundleSha = attempt.opponentPolicyBundleSha;
    }
    if (adjudicationProtocolSha === null) {
      adjudicationProtocolSha = attempt.adjudicationProtocolSha;
    }
    if (attempt.engineAndHooksSha !== engineAndHooksSha ||
        attempt.opponentPolicyBundleSha !== opponentPolicyBundleSha ||
        attempt.adjudicationProtocolSha !== adjudicationProtocolSha) {
      problems.add('engine-opponent-or-adjudication-changed');
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
  return {
    target, confidence, rejectionReasons, totalAttempts: attempts.length,
    winCount,
    attemptsPerRankSeatAndFirstPlayer:
      rejectionReasons.length === 0 ? n : null
  };
}

module.exports = {validateFieldLedger, FIELD_SIZE};
