'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {evidenceBundleSha256: canonicalSha256} =
  require('../simulation/evaluation/canonical-evidence-json.cjs');
const {
  validateTerminalAdjudicationReceipt,
  RECEIPT_SCHEMA,
  RUNNER_EVIDENCE_SCHEMA,
  ADJUDICATOR_EVIDENCE_SCHEMA,
  RESULT_TO_STATUS
} = require('../scripts/2026-11/shared/terminal-adjudication-receipt.cjs');

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
  noWinnerDisposition = 'count-as-nonwin',
  clockMode = 'clock-free-game-win'
} = {}) {
  const expected = {
    attemptId: 'attempt-1',
    slotId: 'slot-1',
    registrationSha: hash('1'),
    rank: 1,
    candidatePhysicalSeat: 0,
    actualStarterSeat: 1,
    physicalDealId: 'deal-1',
    source60Sha: hash('2'),
    candidate60Sha: hash('3'),
    candidatePolicySha: hash('4'),
    engineAndHooksSha: hash('5'),
    opponentPolicyBundleSha: hash('6'),
    adjudicationProtocolSha256: hash('7'),
    clockMode,
    noWinnerDisposition,
    rngMaterialCommitmentSha256: hash('8'),
    enginePin: gitHash('a'),
    runnerRevision: gitHash('b'),
    endedAt: '2026-11-25T12:00:00Z',
    status: RESULT_TO_STATUS[result]
  };
  const attempt = {
    attemptId: expected.attemptId,
    trialId: expected.attemptId,
    slotId: expected.slotId,
    paperReceiptId: 'paper-1',
    status: expected.status,
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
    physicalDealId: expected.physicalDealId,
    source60Sha: expected.source60Sha,
    candidate60Sha: expected.candidate60Sha,
    candidatePolicySha: expected.candidatePolicySha,
    engineAndHooksSha: expected.engineAndHooksSha,
    opponentPolicyBundleSha: expected.opponentPolicyBundleSha,
    adjudicationProtocolSha256: expected.adjudicationProtocolSha256,
    clockMode,
    noWinnerDisposition,
    rngMaterialCommitmentSha256: expected.rngMaterialCommitmentSha256,
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
    statisticalStatus: RESULT_TO_STATUS[result],
    gameStarted: true,
    terminalReached: true,
    adjudicationStatus: 'determinate'
  }, 'receiptSha256');
  attempt.terminalAdjudicationReceipt = receipt;
  attempt.terminalAdjudicationReceiptSha256 = receipt.receiptSha256;
  return {attempt, expected, runnerEvidence, adjudicationEvidence};
}

function validate(input, extra = {}) {
  return validateTerminalAdjudicationReceipt({
    ...input,
    seenReceiptSha256: new Set(),
    seenTerminalEventSha256: new Set(),
    seenRunnerEvidenceSha256: new Set(),
    seenAdjudicationEvidenceSha256: new Set(),
    ...extra
  });
}

test('valid receipt binds the played attempt to separate runner and adjudicator evidence', () => {
  const input = fixture();
  const result = validate(input);
  assert.equal(result.valid, true, result.rejectionReasons.join(','));
  assert.equal(input.attempt.status, 'paper-qualified-win');
});

test('receipt alone is insufficient without independently supplied runner and adjudicator evidence', () => {
  const input = fixture();
  const result = validate({...input, runnerEvidence: null, adjudicationEvidence: null});
  assert.equal(result.valid, false);
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

test('no-winner is a distinct nonwin and never maps to a candidate win or genuine tie', () => {
  const input = fixture({
    result: 'no-winner',
    terminalClass: 'no-winner',
    reason: 'simultaneous-game-loss'
  });
  const result = validate(input);
  assert.equal(result.valid, true, result.rejectionReasons.join(','));
  assert.equal(input.attempt.status, 'paper-qualified-no-winner');
  assert.equal(RESULT_TO_STATUS['no-winner'], 'paper-qualified-no-winner');
  const forged = fixture({
    result: 'candidate-win',
    terminalClass: 'no-winner',
    reason: 'simultaneous-game-loss'
  });
  const forgedResult = validate(forged);
  assert.equal(forgedResult.valid, false);
  assert.ok(forgedResult.rejectionReasons.includes('terminal-adjudication-terminal-class-result-incompatible'));
});

test('registered invalidate-batch disposition rejects a no-winner terminal', () => {
  const input = fixture({
    result: 'no-winner',
    terminalClass: 'no-winner',
    reason: 'simultaneous-game-loss',
    noWinnerDisposition: 'invalidate-batch'
  });
  const result = validate(input);
  assert.equal(result.valid, false);
  assert.ok(result.rejectionReasons.includes('terminal-adjudication-no-winner-invalidates-batch'));
});

test('terminal class and reason vocabulary are controlled and compatible', () => {
  const unknown = fixture({terminalClass: 'arbitrary-terminal', reason: 'arbitrary'});
  const unknownResult = validate(unknown);
  assert.equal(unknownResult.valid, false);
  assert.ok(unknownResult.rejectionReasons.includes('terminal-adjudication-terminal-class-result-incompatible'));
  const tie = fixture({
    result: 'genuine-tie',
    terminalClass: 'genuine-tie',
    reason: 'genuine-tie'
  });
  assert.equal(validate(tie).valid, true);
});

test('clock mode is an explicit enum and event-clock reasons require the Aichi Top32 mode', () => {
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
  assert.ok(result.rejectionReasons.includes('terminal-adjudication-clock-reason-mode-mismatch'));
});

test('adjudicator evidence is independently bound to result, class, reason and protocol', () => {
  const input = fixture();
  input.adjudicationEvidence.adjudicatedCandidateResult = 'candidate-loss';
  seal(input.adjudicationEvidence, 'evidenceSha256');
  const result = validate(input);
  assert.equal(result.valid, false);
  assert.ok(result.rejectionReasons.includes('terminal-adjudication-adjudicator-evidence-binding-mismatch'));
});

test('receipt and terminal event replay are rejected', () => {
  const input = fixture();
  const result = validate(input, {
    seenReceiptSha256: new Set([input.attempt.terminalAdjudicationReceiptSha256]),
    seenTerminalEventSha256: new Set([input.runnerEvidence.terminalEventSha256])
  });
  assert.equal(result.valid, false);
  assert.ok(result.rejectionReasons.includes('terminal-adjudication-receipt-replayed'));
  assert.ok(result.rejectionReasons.includes('terminal-adjudication-terminal-event-replayed'));
});
