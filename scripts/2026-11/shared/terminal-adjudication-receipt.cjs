'use strict';

const {
  evidenceBundleSha256: canonicalSha256
} = require('../../../simulation/evaluation/canonical-evidence-json.cjs');

const SHA256 = /^[a-f0-9]{64}$/i;
const RECEIPT_SCHEMA = 'aichi-terminal-adjudication-receipt-v2';
const RUNNER_EVIDENCE_SCHEMA = 'aichi-runner-terminal-evidence-v1';
const ADJUDICATOR_EVIDENCE_SCHEMA = 'aichi-adjudicator-evidence-v1';
const CLOCK_MODES = new Set([
  'clock-free-game-win',
  'aichi-top32-event-clock'
]);
const NO_WINNER_DISPOSITIONS = new Set([
  'count-as-nonwin',
  'invalidate-batch'
]);
const RESULT_TO_STATUS = Object.freeze({
  'candidate-win': 'paper-qualified-win',
  'candidate-loss': 'paper-qualified-loss',
  'genuine-tie': 'paper-qualified-tie',
  'no-winner': 'paper-qualified-no-winner'
});
const RESULT_BY_REASON = Object.freeze({
  'engine-winner': ['candidate-win', 'candidate-loss'],
  'genuine-tie': ['genuine-tie'],
  'simultaneous-game-loss': ['no-winner'],
  'top32-prize-tiebreaker': ['candidate-win', 'candidate-loss', 'genuine-tie', 'no-winner'],
  'candidate-concession': ['candidate-loss'],
  'opponent-concession': ['candidate-win'],
  'candidate-forfeit': ['candidate-loss'],
  'opponent-forfeit': ['candidate-win'],
  'candidate-timeout': ['candidate-loss'],
  'opponent-timeout': ['candidate-win']
});
const CLASS_BY_REASON = Object.freeze({
  'engine-winner': 'engine-winner',
  'genuine-tie': 'genuine-tie',
  'simultaneous-game-loss': 'no-winner',
  'top32-prize-tiebreaker': 'clock-adjudication',
  'candidate-concession': 'concession',
  'opponent-concession': 'concession',
  'candidate-forfeit': 'forfeit',
  'opponent-forfeit': 'forfeit',
  'candidate-timeout': 'timeout',
  'opponent-timeout': 'timeout'
});

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isSha(value) {
  return typeof value === 'string' && SHA256.test(value);
}

function validIso(value) {
  return typeof value === 'string' &&
    /(?:Z|[+-][0-9]{2}:[0-9]{2})$/.test(value) &&
    Number.isFinite(Date.parse(value));
}

function digestMatches(record, field) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return false;
  const digest = record[field];
  if (!isSha(digest)) return false;
  const payload = {...record};
  delete payload[field];
  try {
    return canonicalSha256(payload) === digest;
  } catch {
    return false;
  }
}

/**
 * Bind a played attempt to two separately supplied evidence records:
 * native-runner terminal evidence and adjudicator evidence. This is
 * structural/content-addressed validation only. It does not authenticate
 * either producer, verify signatures, decide paper rules, or prove RNG fairness.
 */
function validateTerminalAdjudicationReceipt({
  attempt,
  expected,
  runnerEvidence,
  adjudicationEvidence,
  seenReceiptSha256 = new Set(),
  seenTerminalEventSha256 = new Set(),
  seenRunnerEvidenceSha256 = new Set(),
  seenAdjudicationEvidenceSha256 = new Set()
}) {
  const problems = new Set();
  const reject = reason => problems.add(reason);

  if (!attempt || typeof attempt !== 'object' || Array.isArray(attempt)) {
    return {valid: false, rejectionReasons: ['terminal-adjudication-attempt-invalid'], receiptSha256: null};
  }
  if (!expected || typeof expected !== 'object' || Array.isArray(expected)) {
    return {valid: false, rejectionReasons: ['terminal-adjudication-expected-bindings-invalid'], receiptSha256: null};
  }
  const receipt = attempt.terminalAdjudicationReceipt;
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) {
    return {valid: false, rejectionReasons: ['terminal-adjudication-receipt-missing'], receiptSha256: null};
  }
  if (!runnerEvidence || typeof runnerEvidence !== 'object' || Array.isArray(runnerEvidence)) {
    reject('terminal-adjudication-independent-runner-evidence-missing');
  }
  if (!adjudicationEvidence || typeof adjudicationEvidence !== 'object' || Array.isArray(adjudicationEvidence)) {
    reject('terminal-adjudication-independent-adjudicator-evidence-missing');
  }

  if (receipt.schema !== RECEIPT_SCHEMA) reject('terminal-adjudication-receipt-schema-invalid');
  if (!nonEmptyString(attempt.attemptId) || attempt.trialId !== attempt.attemptId ||
      !nonEmptyString(attempt.slotId) || receipt.attemptId !== attempt.attemptId ||
      receipt.trialId !== attempt.trialId || receipt.slotId !== attempt.slotId ||
      receipt.paperReceiptId !== attempt.paperReceiptId) {
    reject('terminal-adjudication-receipt-identity-invalid');
  }

  const bindings = {
    registrationSha: expected.registrationSha,
    rank: expected.rank,
    candidatePhysicalSeat: expected.candidatePhysicalSeat,
    actualStarterSeat: expected.actualStarterSeat,
    physicalDealId: expected.physicalDealId,
    source60Sha: expected.source60Sha,
    candidate60Sha: expected.candidate60Sha,
    candidatePolicySha: expected.candidatePolicySha,
    engineAndHooksSha: expected.engineAndHooksSha,
    opponentPolicyBundleSha: expected.opponentPolicyBundleSha,
    adjudicationProtocolSha256: expected.adjudicationProtocolSha256,
    clockMode: expected.clockMode,
    noWinnerDisposition: expected.noWinnerDisposition,
    rngMaterialCommitmentSha256: expected.rngMaterialCommitmentSha256
  };
  for (const [field, value] of Object.entries(bindings)) {
    if (value === undefined || value === null ||
        (typeof value === 'string' && value.trim().length === 0)) {
      reject('terminal-adjudication-expected-binding-missing:' + field);
    } else if (receipt[field] !== value) {
      reject('terminal-adjudication-binding-mismatch:' + field);
    }
  }
  for (const field of [
    'registrationSha', 'source60Sha', 'candidate60Sha', 'candidatePolicySha',
    'engineAndHooksSha', 'opponentPolicyBundleSha', 'adjudicationProtocolSha256',
    'rngMaterialCommitmentSha256'
  ]) {
    if (!isSha(expected[field])) reject('terminal-adjudication-expected-hash-invalid:' + field);
  }
  if (!Number.isInteger(expected.rank) || expected.rank < 1 || expected.rank > 32) {
    reject('terminal-adjudication-rank-invalid');
  }
  if (![0, 1].includes(expected.candidatePhysicalSeat) ||
      ![0, 1].includes(expected.actualStarterSeat)) {
    reject('terminal-adjudication-seat-invalid');
  }
  if (!nonEmptyString(expected.physicalDealId)) reject('terminal-adjudication-physical-deal-id-invalid');
  if (!CLOCK_MODES.has(expected.clockMode)) reject('terminal-adjudication-clock-mode-invalid');
  if (!NO_WINNER_DISPOSITIONS.has(expected.noWinnerDisposition)) {
    reject('terminal-adjudication-no-winner-disposition-invalid');
  }

  if (runnerEvidence) {
    if (runnerEvidence.schema !== RUNNER_EVIDENCE_SCHEMA ||
        runnerEvidence.attemptId !== attempt.attemptId ||
        runnerEvidence.slotId !== attempt.slotId ||
        runnerEvidence.enginePin !== expected.enginePin ||
        runnerEvidence.runnerRevision !== expected.runnerRevision ||
        runnerEvidence.gameStarted !== true ||
        runnerEvidence.terminalReached !== true ||
        !isSha(runnerEvidence.terminalEventSha256) ||
        !isSha(runnerEvidence.engineTerminalSha256) ||
        !validIso(runnerEvidence.capturedAt) ||
        !validIso(expected.endedAt) ||
        Date.parse(runnerEvidence.capturedAt) < Date.parse(expected.endedAt) ||
        !digestMatches(runnerEvidence, 'evidenceSha256')) {
      reject('terminal-adjudication-runner-evidence-invalid');
    }
    if (receipt.runnerEvidenceSha256 !== runnerEvidence.evidenceSha256 ||
        receipt.terminalEventSha256 !== runnerEvidence.terminalEventSha256 ||
        receipt.engineTerminalSha256 !== runnerEvidence.engineTerminalSha256) {
      reject('terminal-adjudication-runner-evidence-binding-mismatch');
    }
    if (isSha(runnerEvidence.evidenceSha256)) {
      if (seenRunnerEvidenceSha256.has(runnerEvidence.evidenceSha256)) {
        reject('terminal-adjudication-runner-evidence-replayed');
      } else {
        seenRunnerEvidenceSha256.add(runnerEvidence.evidenceSha256);
      }
    }
    if (isSha(runnerEvidence.terminalEventSha256)) {
      if (seenTerminalEventSha256.has(runnerEvidence.terminalEventSha256)) {
        reject('terminal-adjudication-terminal-event-replayed');
      } else {
        seenTerminalEventSha256.add(runnerEvidence.terminalEventSha256);
      }
    }
  }

  if (adjudicationEvidence) {
    if (adjudicationEvidence.schema !== ADJUDICATOR_EVIDENCE_SCHEMA ||
        adjudicationEvidence.attemptId !== attempt.attemptId ||
        adjudicationEvidence.slotId !== attempt.slotId ||
        adjudicationEvidence.adjudicationProtocolSha256 !== expected.adjudicationProtocolSha256 ||
        adjudicationEvidence.clockMode !== expected.clockMode ||
        !nonEmptyString(adjudicationEvidence.adjudicatorId) ||
        !validIso(adjudicationEvidence.adjudicatedAt) ||
        Date.parse(adjudicationEvidence.adjudicatedAt) < Date.parse(expected.endedAt) ||
        !isSha(adjudicationEvidence.attestationSha256) ||
        !digestMatches(adjudicationEvidence, 'evidenceSha256')) {
      reject('terminal-adjudication-adjudicator-evidence-invalid');
    }
    if (receipt.adjudicationEvidenceSha256 !== adjudicationEvidence.evidenceSha256 ||
        receipt.adjudicatorAttestationSha256 !== adjudicationEvidence.attestationSha256 ||
        receipt.adjudicatorId !== adjudicationEvidence.adjudicatorId ||
        receipt.adjudicatedAt !== adjudicationEvidence.adjudicatedAt ||
        receipt.terminalClass !== adjudicationEvidence.terminalClass ||
        receipt.adjudicationReason !== adjudicationEvidence.adjudicationReason ||
        receipt.adjudicatedCandidateResult !== adjudicationEvidence.adjudicatedCandidateResult) {
      reject('terminal-adjudication-adjudicator-evidence-binding-mismatch');
    }
    if (isSha(adjudicationEvidence.evidenceSha256)) {
      if (seenAdjudicationEvidenceSha256.has(adjudicationEvidence.evidenceSha256)) {
        reject('terminal-adjudication-adjudicator-evidence-replayed');
      } else {
        seenAdjudicationEvidenceSha256.add(adjudicationEvidence.evidenceSha256);
      }
    }
  }

  const result = receipt.adjudicatedCandidateResult;
  const expectedStatus = RESULT_TO_STATUS[result];
  const reason = receipt.adjudicationReason;
  const expectedClass = CLASS_BY_REASON[reason];
  if (!expectedStatus || !expectedClass || receipt.terminalClass !== expectedClass ||
      !RESULT_BY_REASON[reason]?.includes(result)) {
    reject('terminal-adjudication-terminal-class-result-incompatible');
  }
  if (reason === 'top32-prize-tiebreaker' &&
      expected.clockMode !== 'aichi-top32-event-clock') {
    reject('terminal-adjudication-clock-reason-mode-mismatch');
  }
  if (result === 'no-winner' && expected.noWinnerDisposition === 'invalidate-batch') {
    reject('terminal-adjudication-no-winner-invalidates-batch');
  }
  if (receipt.statisticalStatus !== expectedStatus ||
      attempt.status !== expected.status ||
      expected.status !== expectedStatus) {
    reject('terminal-adjudication-result-status-mismatch');
  }

  if (receipt.gameStarted !== true || receipt.terminalReached !== true ||
      receipt.adjudicationStatus !== 'determinate') {
    reject('terminal-adjudication-not-determinate');
  }
  if (!validIso(receipt.adjudicatedAt) || !validIso(expected.endedAt) ||
      Date.parse(receipt.adjudicatedAt) < Date.parse(expected.endedAt)) {
    reject('terminal-adjudication-time-invalid');
  }
  if (receipt.clockMode !== expected.clockMode ||
      receipt.adjudicationProtocolSha256 !== expected.adjudicationProtocolSha256) {
    reject('terminal-adjudication-protocol-mismatch');
  }
  if (!digestMatches(receipt, 'receiptSha256') ||
      attempt.terminalAdjudicationReceiptSha256 !== receipt.receiptSha256) {
    reject('terminal-adjudication-receipt-digest-invalid');
  }

  if (isSha(receipt.receiptSha256)) {
    if (seenReceiptSha256.has(receipt.receiptSha256)) {
      reject('terminal-adjudication-receipt-replayed');
    } else {
      seenReceiptSha256.add(receipt.receiptSha256);
    }
  }

  return {
    valid: problems.size === 0,
    rejectionReasons: [...problems].sort(),
    receiptSha256: isSha(receipt.receiptSha256) ? receipt.receiptSha256 : null
  };
}

module.exports = {
  validateTerminalAdjudicationReceipt,
  RECEIPT_SCHEMA,
  RUNNER_EVIDENCE_SCHEMA,
  ADJUDICATOR_EVIDENCE_SCHEMA,
  CLOCK_MODES,
  NO_WINNER_DISPOSITIONS,
  RESULT_TO_STATUS,
  RESULT_BY_REASON,
  CLASS_BY_REASON,
  digestMatches
};
