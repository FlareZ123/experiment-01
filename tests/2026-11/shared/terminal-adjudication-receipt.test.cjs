'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  evidenceBundleSha256: canonicalSha256
} = require('../../../simulation/evaluation/canonical-evidence-json.cjs');
const {
  validateTerminalAdjudicationReceipt,
  RECEIPT_SCHEMA
} = require('../../../scripts/2026-11/shared/terminal-adjudication-receipt.cjs');

const H = value => canonicalSha256({value});
function makeAttempt(result = 'candidate-win') {
  const attempt = {
    trialId: 'trial/1',
    paperReceiptId: 'paper/1',
    status: ({
      'candidate-win':'paper-qualified-win',
      'candidate-loss':'paper-qualified-loss',
      'genuine-tie':'paper-qualified-tie',
      'no-winner':'paper-qualified-no-winner'
    })[result],
    terminalAdjudicationReceiptSha256: null
  };
  const receipt = {
    schema: RECEIPT_SCHEMA,
    trialId: attempt.trialId,
    paperReceiptId: attempt.paperReceiptId,
    registrationSha: 'a'.repeat(64),
    rank: 1,
    candidatePhysicalSeat: 0,
    actualStarterSeat: 1,
    physicalDealId: 'deal/1',
    source60Sha: 'b'.repeat(64),
    candidate60Sha: 'c'.repeat(64),
    candidatePolicySha: 'd'.repeat(64),
    engineAndHooksSha: 'e'.repeat(64),
    opponentPolicyBundleSha: 'f'.repeat(64),
    adjudicationProtocolSha: '1'.repeat(64),
    clockMode: 'clock-free-game-win',
    gameStarted: true,
    terminalEventSha256: H('terminal/1'),
    terminalClass: result === 'no-winner'
      ? 'simultaneous-game-loss'
      : result === 'genuine-tie'
        ? 'genuine-draw'
        : result === 'candidate-loss'
          ? 'candidate-forfeit'
          : 'normal-completion',
    adjudicatedCandidateResult: result,
    statisticalStatus: attempt.status
  };
  receipt.receiptSha256 = canonicalSha256(receipt);
  attempt.terminalAdjudicationReceipt = receipt;
  attempt.terminalAdjudicationReceiptSha256 = receipt.receiptSha256;
  const expected = {
    registrationSha: receipt.registrationSha,
    rank: receipt.rank,
    candidatePhysicalSeat: receipt.candidatePhysicalSeat,
    actualStarterSeat: receipt.actualStarterSeat,
    physicalDealId: receipt.physicalDealId,
    source60Sha: receipt.source60Sha,
    candidate60Sha: receipt.candidate60Sha,
    candidatePolicySha: receipt.candidatePolicySha,
    engineAndHooksSha: receipt.engineAndHooksSha,
    opponentPolicyBundleSha: receipt.opponentPolicyBundleSha,
    adjudicationProtocolSha: receipt.adjudicationProtocolSha,
    clockMode: receipt.clockMode
  };
  return {attempt, expected};
}
function reseal(attempt) {
  const receipt = attempt.terminalAdjudicationReceipt;
  const {receiptSha256: ignored, ...payload} = receipt;
  receipt.receiptSha256 = canonicalSha256(payload);
  attempt.terminalAdjudicationReceiptSha256 = receipt.receiptSha256;
}

test('valid terminal receipt binds the complete registered attempt', () => {
  const {attempt, expected} = makeAttempt();
  const result = validateTerminalAdjudicationReceipt({attempt, expected});
  assert.equal(result.valid, true);
  assert.deepEqual(result.rejectionReasons, []);
});

test('candidate win, loss, genuine tie and no-winner remain distinct', () => {
  for (const outcome of [
    ['candidate-win','paper-qualified-win'],
    ['candidate-loss','paper-qualified-loss'],
    ['genuine-tie','paper-qualified-tie'],
    ['no-winner','paper-qualified-no-winner']
  ]) {
    const {attempt, expected} = makeAttempt(outcome[0]);
    const result = validateTerminalAdjudicationReceipt({attempt, expected});
    assert.equal(result.valid, true, outcome[0]);
    assert.equal(attempt.status, outcome[1]);
  }
});

test('missing receipt and pre-game terminal do not qualify as a paper game', () => {
  const missing = makeAttempt();
  delete missing.attempt.terminalAdjudicationReceipt;
  assert.ok(validateTerminalAdjudicationReceipt(missing).rejectionReasons
    .includes('terminal-adjudication-receipt-missing'));

  const preGame = makeAttempt();
  preGame.attempt.terminalAdjudicationReceipt.gameStarted = false;
  reseal(preGame.attempt);
  const result = validateTerminalAdjudicationReceipt(preGame);
  assert.ok(result.rejectionReasons.includes('terminal-adjudication-game-not-started'));
});

test('receipt/status mismatch and unresolved adjudication fail closed', () => {
  const mismatch = makeAttempt();
  mismatch.attempt.status = 'paper-qualified-loss';
  assert.ok(validateTerminalAdjudicationReceipt(mismatch).rejectionReasons
    .includes('terminal-adjudication-attempt-status-mismatch'));

  const unresolved = makeAttempt();
  unresolved.attempt.terminalAdjudicationReceipt.adjudicatedCandidateResult =
    'unresolved';
  reseal(unresolved.attempt);
  assert.ok(validateTerminalAdjudicationReceipt(unresolved).rejectionReasons
    .includes('terminal-adjudication-result-invalid'));
});

test('digest tampering, binding mismatch and forbidden worker timeout fail closed', () => {
  const tampered = makeAttempt();
  tampered.attempt.terminalAdjudicationReceipt.terminalClass = 'altered';
  assert.ok(validateTerminalAdjudicationReceipt(tampered).rejectionReasons
    .includes('terminal-adjudication-receipt-digest-mismatch'));

  const wrongBinding = makeAttempt();
  wrongBinding.attempt.terminalAdjudicationReceipt.rank = 2;
  reseal(wrongBinding.attempt);
  assert.ok(validateTerminalAdjudicationReceipt(wrongBinding).rejectionReasons
    .includes('terminal-adjudication-binding-mismatch:rank'));

  const workerTimeout = makeAttempt();
  workerTimeout.attempt.terminalAdjudicationReceipt.terminalClass =
    'policy-worker-timeout';
  reseal(workerTimeout.attempt);
  assert.ok(validateTerminalAdjudicationReceipt(workerTimeout).rejectionReasons
    .includes('terminal-adjudication-execution-failure-is-not-paper-result'));
});

test('cross-attempt receipt and terminal-event replay are rejected', () => {
  const first = makeAttempt();
  const second = makeAttempt();
  second.attempt.trialId = 'trial/2';
  second.attempt.paperReceiptId = 'paper/2';
  second.attempt.terminalAdjudicationReceipt = {
    ...first.attempt.terminalAdjudicationReceipt
  };
  second.attempt.terminalAdjudicationReceiptSha256 =
    first.attempt.terminalAdjudicationReceiptSha256;
  const seenReceiptSha256 = new Set();
  const seenTerminalEventSha256 = new Set();
  const a = validateTerminalAdjudicationReceipt({
    ...first, seenReceiptSha256, seenTerminalEventSha256
  });
  const b = validateTerminalAdjudicationReceipt({
    ...second, seenReceiptSha256, seenTerminalEventSha256
  });
  assert.equal(a.valid, true);
  assert.ok(b.rejectionReasons.includes('terminal-adjudication-binding-mismatch:trialId'));
  assert.ok(b.rejectionReasons.includes('terminal-adjudication-receipt-replayed'));
  assert.ok(b.rejectionReasons.includes('terminal-adjudication-event-replayed'));
});
