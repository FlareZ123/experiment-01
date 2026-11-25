'use strict';

const {
  evidenceBundleSha256: canonicalSha256
} = require('../../../simulation/evaluation/canonical-evidence-json.cjs');

const SHA256 = /^[a-f0-9]{64}$/i;
const RECEIPT_SCHEMA = 'aichi-terminal-adjudication-receipt-v1';
const RESULT_TO_STATUS = Object.freeze({
  'candidate-win': 'paper-qualified-win',
  'candidate-loss': 'paper-qualified-loss',
  'genuine-tie': 'paper-qualified-tie',
  'no-winner': 'paper-qualified-no-winner'
});
const NON_PAPER_TERMINAL_CLASSES = new Set([
  'policy-worker-timeout',
  'pre-game-harness-failure',
  'engine-harness-failure'
]);

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate the structural binding between one registered game attempt and its
 * content-addressed paper terminal-adjudication receipt.
 *
 * This helper does not authenticate the adjudicator, verify signatures,
 * establish that a receipt reflects the actual paper rules, or prove RNG
 * independence/fair shuffling. Those remain external audit requirements.
 *
 * @param {object} input
 * @param {object} input.attempt Registered attempt containing
 *   terminalAdjudicationReceipt and terminalAdjudicationReceiptSha256.
 * @param {object} input.expected Normalized immutable attempt identity:
 *   registrationSha, rank, candidatePhysicalSeat, actualStarterSeat,
 *   physicalDealId, source60Sha, candidate60Sha, candidatePolicySha,
 *   engineAndHooksSha, opponentPolicyBundleSha, adjudicationProtocolSha,
 *   clockMode, and optional rngMaterialCommitmentSha256.
 * @param {Set<string>} input.seenReceiptSha256 Shared receipt-digest set.
 * @param {Set<string>} input.seenTerminalEventSha256 Shared terminal-event set.
 * @returns {{valid:boolean,rejectionReasons:string[],receiptSha256:string|null}}
 */
function validateTerminalAdjudicationReceipt({
  attempt,
  expected,
  seenReceiptSha256 = new Set(),
  seenTerminalEventSha256 = new Set()
}) {
  const problems = new Set();
  if (!attempt || typeof attempt !== 'object' || Array.isArray(attempt)) {
    return {
      valid: false,
      rejectionReasons: ['terminal-adjudication-attempt-invalid'],
      receiptSha256: null
    };
  }
  if (!expected || typeof expected !== 'object' || Array.isArray(expected)) {
    return {
      valid: false,
      rejectionReasons: ['terminal-adjudication-expected-bindings-invalid'],
      receiptSha256: null
    };
  }

  const receipt = attempt.terminalAdjudicationReceipt;
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) {
    return {
      valid: false,
      rejectionReasons: ['terminal-adjudication-receipt-missing'],
      receiptSha256: null
    };
  }

  if (receipt.schema !== RECEIPT_SCHEMA)
    problems.add('terminal-adjudication-receipt-schema-invalid');

  const expectedBindings = {
    trialId: attempt.trialId,
    paperReceiptId: attempt.paperReceiptId,
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
    adjudicationProtocolSha: expected.adjudicationProtocolSha,
    clockMode: expected.clockMode
  };

  for (const [field, value] of Object.entries(expectedBindings)) {
    if (value === undefined || value === null ||
        (typeof value === 'string' && value.trim().length === 0)) {
      problems.add('terminal-adjudication-expected-binding-missing:' + field);
    } else if (receipt[field] !== value) {
      problems.add('terminal-adjudication-binding-mismatch:' + field);
    }
  }

  for (const field of [
    'registrationSha','source60Sha','candidate60Sha','candidatePolicySha',
    'engineAndHooksSha','opponentPolicyBundleSha','adjudicationProtocolSha'
  ]) {
    if (!SHA256.test(expected[field]))
      problems.add('terminal-adjudication-expected-hash-invalid:' + field);
  }
  if (!Number.isInteger(expected.rank) || expected.rank < 1 ||
      expected.rank > 32) {
    problems.add('terminal-adjudication-rank-invalid');
  }
  if (![0,1].includes(expected.candidatePhysicalSeat) ||
      ![0,1].includes(expected.actualStarterSeat)) {
    problems.add('terminal-adjudication-seat-invalid');
  }
  if (!nonEmptyString(expected.physicalDealId))
    problems.add('terminal-adjudication-physical-deal-id-invalid');
  if (!nonEmptyString(expected.clockMode) ||
      ['unresolved','tbd'].includes(String(expected.clockMode).toLowerCase())) {
    problems.add('terminal-adjudication-clock-mode-unresolved');
  }
  if (expected.rngMaterialCommitmentSha256 !== undefined) {
    if (!SHA256.test(expected.rngMaterialCommitmentSha256)) {
      problems.add('terminal-adjudication-rng-commitment-invalid');
    } else if (receipt.rngMaterialCommitmentSha256 !==
        expected.rngMaterialCommitmentSha256) {
      problems.add('terminal-adjudication-binding-mismatch:rngMaterialCommitmentSha256');
    }
  }

  if (receipt.gameStarted !== true)
    problems.add('terminal-adjudication-game-not-started');
  if (!SHA256.test(receipt.terminalEventSha256))
    problems.add('terminal-adjudication-terminal-event-digest-invalid');
  if (!nonEmptyString(receipt.terminalClass))
    problems.add('terminal-adjudication-terminal-class-invalid');
  else if (NON_PAPER_TERMINAL_CLASSES.has(receipt.terminalClass)) {
    problems.add('terminal-adjudication-execution-failure-is-not-paper-result');
  }

  const expectedStatus = RESULT_TO_STATUS[receipt.adjudicatedCandidateResult];
  if (!expectedStatus) {
    problems.add('terminal-adjudication-result-invalid');
  } else {
    if (receipt.statisticalStatus !== expectedStatus)
      problems.add('terminal-adjudication-statistical-status-mismatch');
    if (attempt.status !== expectedStatus)
      problems.add('terminal-adjudication-attempt-status-mismatch');
  }

  const receiptSha256 = receipt.receiptSha256;
  if (!SHA256.test(receiptSha256)) {
    problems.add('terminal-adjudication-receipt-digest-invalid');
  } else {
    const {receiptSha256: ignored, ...payload} = receipt;
    try {
      if (canonicalSha256(payload) !== receiptSha256)
        problems.add('terminal-adjudication-receipt-digest-mismatch');
    } catch {
      problems.add('terminal-adjudication-receipt-digest-invalid');
    }
  }
  if (attempt.terminalAdjudicationReceiptSha256 !== receiptSha256)
    problems.add('terminal-adjudication-receipt-echo-mismatch');

  if (SHA256.test(receiptSha256)) {
    if (seenReceiptSha256.has(receiptSha256))
      problems.add('terminal-adjudication-receipt-replayed');
    else
      seenReceiptSha256.add(receiptSha256);
  }
  if (SHA256.test(receipt.terminalEventSha256)) {
    if (seenTerminalEventSha256.has(receipt.terminalEventSha256))
      problems.add('terminal-adjudication-event-replayed');
    else
      seenTerminalEventSha256.add(receipt.terminalEventSha256);
  }

  return {
    valid: problems.size === 0,
    rejectionReasons: [...problems].sort(),
    receiptSha256: SHA256.test(receiptSha256) ? receiptSha256 : null
  };
}

module.exports = {
  validateTerminalAdjudicationReceipt,
  RECEIPT_SCHEMA,
  RESULT_TO_STATUS
};
