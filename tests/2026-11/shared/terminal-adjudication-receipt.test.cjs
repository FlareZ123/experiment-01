'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {evidenceBundleSha256: canonicalSha256} =
  require('../../../simulation/evaluation/canonical-evidence-json.cjs');
const {
  validateTerminalAdjudicationReceipt,
  createSetupCoinChoiceEvidence,
  RECEIPT_SCHEMA,
  RUNNER_EVIDENCE_SCHEMA,
  ADJUDICATOR_EVIDENCE_SCHEMA,
  SETUP_RECEIPT_VERSION,
  RESULT_TO_STATUS,
  NO_WINNER_STATUS
} = require('../../../scripts/2026-11/shared/terminal-adjudication-receipt.cjs');

const hash = ch => ch.repeat(64);
const gitHash = ch => ch.repeat(40);
function seal(record, field) {
  const payload = {...record};
  delete payload[field];
  record[field] = canonicalSha256(payload);
  return record;
}

function fixture({
  result = 'candidate-win',
  terminalClass = 'engine-winner',
  reason = 'engine-winner',
  clockMode = 'clock-free-game-win',
  allowedResults
} = {}) {
  const protocolRule = {
    ruleId: 'rule-' + reason,
    reason,
    terminalClass,
    allowedResults: allowedResults || (
      reason === 'engine-winner' ? ['candidate-win', 'candidate-loss'] :
      reason === 'simultaneous-game-loss' ? [null] :
      reason === 'genuine-tie' ? ['genuine-tie'] :
      reason === 'top32-prize-tiebreaker'
        ? ['candidate-win', 'candidate-loss', 'genuine-tie', 'no-winner']
        : [result]
    ),
    ...(reason === 'top32-prize-tiebreaker'
      ? {clockMode: 'aichi-top32-event-clock'} : {})
  };
  const protocolRuleSha256 = canonicalSha256(protocolRule);
  const expected = {
    attemptId: 'attempt-1',
    slotId: 'slot-1',
    registrationSha: hash('1'),
    rank: 1,
    candidatePhysicalSeat: 0,
    actualStarterSeat: 0,
    firstPlayerSeat: 0,
    coinWinnerSeat: 0,
    chooserSeat: 0,
    goFirstResponse: 'yes',
    physicalDealId: 'deal-1',
    source60Sha: hash('2'),
    candidate60Sha: hash('3'),
    candidatePolicySha: hash('4'),
    engineAndHooksSha: hash('5'),
    opponentPolicyBundleSha: hash('6'),
    adjudicationProtocolSha256: hash('7'),
    clockMode,
    protocolRule,
    rngMaterialCommitmentSha256: hash('8'),
    enginePin: gitHash('a'),
    runnerRevision: gitHash('b'),
    endedAt: '2026-11-25T12:00:00Z',
    status: result === null ? NO_WINNER_STATUS : RESULT_TO_STATUS[result]
  };
  const setupReceipt = {
    version: SETUP_RECEIPT_VERSION,
    status: 'consistent-accepted-native-setup-and-first-draw',
    coin: {
      ordinal: 1,
      resolution: 'accepted-native-prompt',
      heads: true,
      coinWinnerSeat: 0
    },
    choice: {
      ordinal: 2,
      resolution: 'accepted-native-prompt',
      choiceOwnerSeat: 0,
      choseFirst: true
    },
    firstSeatFromAcceptedSetup: 0,
    firstSeatFromVerifiedDraw: 0,
    nativeFirstDrawVerified: true,
    firstSetupOnly: true,
    malformedNativeSetupEvents: 0,
    fullGamePolicyCertified: false,
    officialCoinChoiceRuleCertified: false,
    competitiveGameQualified: false
  };
  const setupCoinChoiceEvidence = createSetupCoinChoiceEvidence({
    attemptId: expected.attemptId,
    trialId: expected.attemptId,
    slotId: expected.slotId,
    receipt: setupReceipt
  });
  const attempt = {
    attemptId: expected.attemptId,
    trialId: expected.attemptId,
    slotId: expected.slotId,
    paperReceiptId: 'paper-1',
    status: expected.status,
    coinWinnerSeat: 0,
    chooserSeat: 0,
    goFirstResponse: 'yes',
    firstPlayerSeat: 0,
    actualFirstPlayerSeat: 0,
    hostOverride: false,
    setupCoinChoiceReceiptSha256: setupCoinChoiceEvidence.receiptSha256,
    setupCoinChoiceEvidenceSha256: setupCoinChoiceEvidence.evidenceSha256,
    terminalAdjudicationReceiptSha256: null
  };
  const runnerEvidence = seal({
    schema: RUNNER_EVIDENCE_SCHEMA,
    attemptId: expected.attemptId,
    slotId: expected.slotId,
    enginePin: expected.enginePin,
    runnerRevision: expected.runnerRevision,
    gameStarted: true,
    terminalReached: true,
    terminalEventSha256: hash('9'),
    engineTerminalSha256: hash('a'),
    capturedAt: '2026-11-25T12:01:00Z'
  }, 'evidenceSha256');
  const adjudicationEvidence = seal({
    schema: ADJUDICATOR_EVIDENCE_SCHEMA,
    attemptId: expected.attemptId,
    slotId: expected.slotId,
    adjudicationProtocolSha256: expected.adjudicationProtocolSha256,
    protocolRuleId: protocolRule.ruleId,
    protocolRuleSha256,
    runnerEvidenceSha256: runnerEvidence.evidenceSha256,
    terminalEventSha256: runnerEvidence.terminalEventSha256,
    engineTerminalSha256: runnerEvidence.engineTerminalSha256,
    clockMode,
    adjudicatorId: 'adjudicator-1',
    adjudicatedAt: '2026-11-25T12:02:00Z',
    terminalClass,
    adjudicationReason: reason,
    adjudicatedCandidateResult: result,
    attestationSha256: hash('c')
  }, 'evidenceSha256');
  const receipt = seal({
    schema: RECEIPT_SCHEMA,
    attemptId: expected.attemptId,
    trialId: expected.attemptId,
    slotId: expected.slotId,
    paperReceiptId: attempt.paperReceiptId,
    registrationSha: expected.registrationSha,
    rank: expected.rank,
    candidatePhysicalSeat: expected.candidatePhysicalSeat,
    actualStarterSeat: expected.actualStarterSeat,
    firstPlayerSeat: expected.firstPlayerSeat,
    coinWinnerSeat: expected.coinWinnerSeat,
    chooserSeat: expected.chooserSeat,
    goFirstResponse: expected.goFirstResponse,
    physicalDealId: expected.physicalDealId,
    source60Sha: expected.source60Sha,
    candidate60Sha: expected.candidate60Sha,
    candidatePolicySha: expected.candidatePolicySha,
    engineAndHooksSha: expected.engineAndHooksSha,
    opponentPolicyBundleSha: expected.opponentPolicyBundleSha,
    adjudicationProtocolSha256: expected.adjudicationProtocolSha256,
    protocolRuleId: protocolRule.ruleId,
    protocolRuleSha256,
    clockMode,
    rngMaterialCommitmentSha256: expected.rngMaterialCommitmentSha256,
    setupCoinChoiceReceiptSha256: setupCoinChoiceEvidence.receiptSha256,
    setupCoinChoiceEvidenceSha256: setupCoinChoiceEvidence.evidenceSha256,
    runnerEvidenceSha256: runnerEvidence.evidenceSha256,
    adjudicationEvidenceSha256: adjudicationEvidence.evidenceSha256,
    terminalEventSha256: runnerEvidence.terminalEventSha256,
    engineTerminalSha256: runnerEvidence.engineTerminalSha256,
    adjudicatorAttestationSha256: adjudicationEvidence.attestationSha256,
    adjudicatorId: adjudicationEvidence.adjudicatorId,
    adjudicatedAt: adjudicationEvidence.adjudicatedAt,
    terminalClass,
    adjudicationReason: reason,
    adjudicatedCandidateResult: result,
    statisticalStatus: result === null ? null : RESULT_TO_STATUS[result],
    gameStarted: true,
    terminalReached: true,
    adjudicationStatus: 'determinate'
  }, 'receiptSha256');
  attempt.terminalAdjudicationReceipt = receipt;
  attempt.terminalAdjudicationReceiptSha256 = receipt.receiptSha256;
  return {attempt, expected, runnerEvidence, adjudicationEvidence, setupCoinChoiceEvidence};
}

function validate(input, extra = {}) {
  return validateTerminalAdjudicationReceipt({
    ...input,
    seenReceiptSha256: new Set(),
    seenTerminalEventSha256: new Set(),
    seenRunnerEvidenceSha256: new Set(),
    seenAdjudicationEvidenceSha256: new Set(),
    seenSetupEvidenceSha256: new Set(),
    ...extra
  });
}

test('valid receipt binds attempt, native setup, exact runner terminal and protocol-selected adjudication', () => {
  const input = fixture();
  const result = validate(input);
  assert.equal(result.valid, true, result.rejectionReasons.join(','));
});

test('receipt without separate setup, runner or adjudicator evidence is rejected', () => {
  const input = fixture();
  const result = validate({
    ...input,
    setupCoinChoiceEvidence: null,
    runnerEvidence: null,
    adjudicationEvidence: null
  });
  assert.equal(result.valid, false);
  assert.ok(result.rejectionReasons.includes('terminal-adjudication-setup-coin-choice-evidence-missing'));
  assert.ok(result.rejectionReasons.includes('terminal-adjudication-independent-runner-evidence-missing'));
  assert.ok(result.rejectionReasons.includes('terminal-adjudication-independent-adjudicator-evidence-missing'));
});

test('runner terminal-event digest must match the separately supplied runner evidence', () => {
  const input = fixture();
  input.runnerEvidence.terminalEventSha256 = hash('d');
  seal(input.runnerEvidence, 'evidenceSha256');
  const result = validate(input);
  assert.equal(result.valid, false);
  assert.ok(result.rejectionReasons.includes('terminal-adjudication-runner-evidence-binding-mismatch'));
});

test('adjudicator evidence must join the exact runner terminal, even after its own digest is resealed', () => {
  const input = fixture();
  input.adjudicationEvidence.terminalEventSha256 = hash('d');
  seal(input.adjudicationEvidence, 'evidenceSha256');
  input.attempt.terminalAdjudicationReceipt.adjudicationEvidenceSha256 =
    input.adjudicationEvidence.evidenceSha256;
  seal(input.attempt.terminalAdjudicationReceipt, 'receiptSha256');
  input.attempt.terminalAdjudicationReceiptSha256 =
    input.attempt.terminalAdjudicationReceipt.receiptSha256;
  const result = validate(input);
  assert.equal(result.valid, false);
  assert.ok(result.rejectionReasons.includes('terminal-adjudication-adjudicator-terminal-binding-mismatch'));
});

test('native setup receipt must bind the actual first draw and candidate seat/choice fields', () => {
  const input = fixture();
  input.setupCoinChoiceEvidence.receipt.firstSeatFromVerifiedDraw = 1;
  const evidence = createSetupCoinChoiceEvidence({
    attemptId: input.attempt.attemptId,
    trialId: input.attempt.trialId,
    slotId: input.attempt.slotId,
    receipt: input.setupCoinChoiceEvidence.receipt
  });
  input.setupCoinChoiceEvidence = evidence;
  input.attempt.setupCoinChoiceReceiptSha256 = evidence.receiptSha256;
  input.attempt.setupCoinChoiceEvidenceSha256 = evidence.evidenceSha256;
  input.attempt.terminalAdjudicationReceipt.setupCoinChoiceReceiptSha256 = evidence.receiptSha256;
  input.attempt.terminalAdjudicationReceipt.setupCoinChoiceEvidenceSha256 = evidence.evidenceSha256;
  seal(input.attempt.terminalAdjudicationReceipt, 'receiptSha256');
  input.attempt.terminalAdjudicationReceiptSha256 = input.attempt.terminalAdjudicationReceipt.receiptSha256;
  const result = validate(input);
  assert.equal(result.valid, false);
  assert.ok(result.rejectionReasons.includes('terminal-adjudication-native-setup-outcome-mismatch'));
});

test('setup evidence must be bound to the exact attempt and trial identifiers', () => {
  const input = fixture();
  input.setupCoinChoiceEvidence.trialId = 'other-trial';
  seal(input.setupCoinChoiceEvidence, 'evidenceSha256');
  const result = validate(input);
  assert.equal(result.valid, false);
  assert.ok(result.rejectionReasons.includes('terminal-adjudication-setup-coin-choice-evidence-invalid'));
});

test('no-winner is always a distinct nonwin and cannot be relabelled', () => {
  const input = fixture({
    result: null,
    terminalClass: 'no-winner',
    reason: 'simultaneous-game-loss'
  });
  const result = validate(input);
  assert.equal(result.valid, true, result.rejectionReasons.join(','));
  assert.equal(input.attempt.status, NO_WINNER_STATUS);
  assert.equal(input.attempt.terminalAdjudicationReceipt.adjudicatedCandidateResult, null);
  assert.equal(input.attempt.terminalAdjudicationReceipt.statisticalStatus, null);
  const forged = fixture({
    result: 'candidate-win',
    terminalClass: 'no-winner',
    reason: 'simultaneous-game-loss'
  });
  const forgedResult = validate(forged);
  assert.equal(forgedResult.valid, false);
  assert.ok(forgedResult.rejectionReasons.includes('terminal-adjudication-protocol-rule-binding-invalid'));
});

test('a concession or timeout result is determined by its registered rule, not a universal hardcoded map', () => {
  const input = fixture({
    result: 'candidate-loss',
    terminalClass: 'timeout',
    reason: 'opponent-timeout',
    allowedResults: ['candidate-loss']
  });
  const result = validate(input);
  assert.equal(result.valid, true, result.rejectionReasons.join(','));
});

test('protocol rule hash and allowed result are mandatory and content-addressed', () => {
  const input = fixture();
  input.adjudicationEvidence.protocolRuleSha256 = hash('f');
  seal(input.adjudicationEvidence, 'evidenceSha256');
  const result = validate(input);
  assert.equal(result.valid, false);
  assert.ok(result.rejectionReasons.includes('terminal-adjudication-adjudicator-evidence-binding-mismatch') ||
    result.rejectionReasons.includes('terminal-adjudication-protocol-rule-binding-invalid'));
});

test('clock mode is an explicit enum and protocol clock constraints are enforced', () => {
  const invalid = fixture({clockMode: 'whatever'});
  assert.equal(validate(invalid).valid, false);
  const wrongMode = fixture({
    result: 'candidate-win',
    terminalClass: 'clock-adjudication',
    reason: 'top32-prize-tiebreaker',
    clockMode: 'clock-free-game-win'
  });
  const result = validate(wrongMode);
  assert.equal(result.valid, false);
  assert.ok(result.rejectionReasons.includes('terminal-adjudication-protocol-rule-binding-invalid'));
});

test('adjudicator evidence is independently bound to result, class, reason and protocol', () => {
  const input = fixture();
  input.adjudicationEvidence.adjudicatedCandidateResult = 'candidate-loss';
  seal(input.adjudicationEvidence, 'evidenceSha256');
  const result = validate(input);
  assert.equal(result.valid, false);
  assert.ok(result.rejectionReasons.includes('terminal-adjudication-adjudicator-evidence-binding-mismatch'));
});

test('receipt, terminal event and setup evidence replay are rejected', () => {
  const input = fixture();
  const result = validate(input, {
    seenReceiptSha256: new Set([input.attempt.terminalAdjudicationReceiptSha256]),
    seenTerminalEventSha256: new Set([input.runnerEvidence.terminalEventSha256]),
    seenSetupEvidenceSha256: new Set([input.setupCoinChoiceEvidence.evidenceSha256])
  });
  assert.equal(result.valid, false);
  assert.ok(result.rejectionReasons.includes('terminal-adjudication-receipt-replayed'));
  assert.ok(result.rejectionReasons.includes('terminal-adjudication-terminal-event-replayed'));
  assert.ok(result.rejectionReasons.includes('terminal-adjudication-setup-coin-choice-evidence-replayed'));
});

test('setup receipt wrapper computes canonical digest and carries the attempt identity', () => {
  const input = fixture();
  assert.equal(input.setupCoinChoiceEvidence.receiptSha256,
    canonicalSha256(input.setupCoinChoiceEvidence.receipt));
  assert.equal(input.setupCoinChoiceEvidence.attemptId, input.attempt.attemptId);
  assert.equal(input.setupCoinChoiceEvidence.trialId, input.attempt.trialId);
  assert.equal(input.setupCoinChoiceEvidence.slotId, input.attempt.slotId);
});
