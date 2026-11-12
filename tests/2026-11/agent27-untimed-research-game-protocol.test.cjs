'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent27-untimed-research-game-protocol.cjs');

function fixture(overrides = {}) {
  const protocolSha256 = protocol.untimedResearchProtocolSha256();
  const registration = {
    mode: protocol.MODE,
    trialId: 'untimed-trial-1',
    ref: 'registration/untimed-trial-1.json',
    sha256: 'a'.repeat(64),
    registeredAt: '2026-11-12T00:00:00.000Z',
    dealGeneratedAt: '2026-11-12T00:01:00.000Z',
    protocolSha256
  };
  const trial = {
    admissionMode: protocol.MODE,
    trialId: registration.trialId,
    registration,
    clockDisposition: protocol.CLOCK_DISPOSITION,
    eventStage: null,
    clockReceiptId: null,
    clockEvidence: null,
    clockEvidenceRef: null,
    noCallClockPacket: null,
    timeCallPacket: null,
    extensionLedgerPacket: null,
    officialClockCoverageEvidenceRef: null,
    timerUsed: false,
    officialEndCallObserved: false,
    timeLimitApplied: false,
    paperReceiptId: 'paper-receipt-1',
    paperGameWinner: 0,
    paperGameTie: false,
    untimedProtocolPacket: {
      schema: protocol.PACKET_SCHEMA,
      mode: protocol.MODE,
      clockDisposition: protocol.CLOCK_DISPOSITION,
      clockReceiptId: null,
      clockEvidence: null,
      clockEvidenceRef: null,
      noCallClockPacket: null,
      timeCallPacket: null,
      extensionLedgerPacket: null,
      officialClockCoverageEvidenceRef: null,
      trialId: registration.trialId,
      registrationRef: registration.ref,
      registrationSha256: registration.sha256,
      protocolSha256,
      timerUsed: false,
      officialEndCallObserved: false,
      officialEndCallPossible: false,
      timeLimitApplied: false,
      eventStage: null,
      naturalTerminalOnly: true,
      paperReceiptId: 'paper-receipt-1',
      paperGameWinner: 0,
      paperGameTie: false,
      terminalEvidenceRef: 'evidence/paper-terminal.mp4',
      terminalEvidenceSha256: 'b'.repeat(64),
      protocolEvidenceRef: 'evidence/untimed-session.mp4',
      protocolEvidenceSha256: 'c'.repeat(64),
      attestedAt: '2026-11-12T00:02:00.000Z'
    }
  };
  return { ...trial, ...overrides };
}

test('valid preregistered natural win is complete but still requires independent paper review', () => {
  const result = protocol.inspectUntimedResearchGame(fixture());
  assert.equal(result.shapeComplete, true);
  assert.equal(result.status,
    'UNTIMED_RESEARCH_PACKET_COMPLETE_PENDING_INDEPENDENT_PAPER_REVIEW');
  assert.equal(result.clockDisposition, protocol.CLOCK_DISPOSITION);
  assert.equal(result.outcome, 'paper-win');
  assert.equal(result.winnerSeat, 0);
  assert.equal(result.paperReviewerRequired, true);
  assert.equal(result.paperReviewerMustConfirmNaturalTerminal, true);
  assert.equal(result.paperReviewerMustConfirmNoTimer, true);
  assert.equal(result.clockReviewerRequired, false);
  assert.equal(result.strategyReviewerRequired, true);
  assert.equal(result.competitiveAdmission, false);
  assert.equal(result.conditionalOnly, true);
});

test('valid natural tie remains a tie and has no winner seat', () => {
  const row = fixture({ paperGameWinner: null, paperGameTie: true });
  row.untimedProtocolPacket.paperGameWinner = null;
  row.untimedProtocolPacket.paperGameTie = true;
  const result = protocol.inspectUntimedResearchGame(row);
  assert.equal(result.shapeComplete, true);
  assert.equal(result.outcome, 'paper-tie');
  assert.equal(result.winnerSeat, null);
});

test('missing preregistration is not inferred from a null clock packet', () => {
  const row = fixture({ registration: null });
  const result = protocol.inspectUntimedResearchGame(row);
  assert.equal(result.shapeComplete, false);
  assert.ok(result.failures.includes('frozen-registration-missing'));
  assert.equal(result.competitiveAdmission, false);
});

test('registration after deal generation fails', () => {
  const row = fixture();
  row.registration.registeredAt = '2026-11-12T00:02:00.000Z';
  const result = protocol.inspectUntimedResearchGame(row);
  assert.ok(result.failures.includes('untimed-mode-not-preregistered-before-deal'));
});

test('unknown mode or mismatched registration mode fails', () => {
  const row = fixture({ admissionMode: 'aichi-event-match' });
  const result = protocol.inspectUntimedResearchGame(row);
  assert.ok(result.failures.includes('untimed-mode-not-explicit'));
  const row2 = fixture();
  row2.registration.mode = 'aichi-event-match';
  assert.ok(protocol.inspectUntimedResearchGame(row2).failures.includes('registration-mode-mismatch'));
});

test('stale protocol digest fails both preregistration and packet binding', () => {
  const row = fixture();
  row.registration.protocolSha256 = 'd'.repeat(64);
  row.untimedProtocolPacket.protocolSha256 = 'd'.repeat(64);
  const result = protocol.inspectUntimedResearchGame(row);
  assert.ok(result.failures.includes('untimed-protocol-digest-mismatch'));
  assert.ok(result.failures.includes('packet-protocol-digest-mismatch'));
});

test('trial and registration identity must agree', () => {
  const row = fixture();
  row.registration.trialId = 'other-trial';
  const result = protocol.inspectUntimedResearchGame(row);
  assert.ok(result.failures.includes('registration-trial-id-mismatch'));
});

test('packet trial and registration binding must agree', () => {
  const row = fixture();
  row.untimedProtocolPacket.trialId = 'other-trial';
  row.untimedProtocolPacket.registrationRef = 'other-registration';
  const result = protocol.inspectUntimedResearchGame(row);
  assert.ok(result.failures.includes('packet-trial-id-mismatch'));
  assert.ok(result.failures.includes('packet-registration-binding-mismatch'));
});

test('timer use or official end call invalidates untimed mode', () => {
  for (const overrides of [
    { timerUsed: true },
    { officialEndCallObserved: true },
    { timeLimitApplied: true }
  ]) {
    const result = protocol.inspectUntimedResearchGame(fixture(overrides));
    assert.ok(result.failures.includes('timer-or-event-adjudication-used-in-untimed-mode'));
  }
  const row = fixture();
  row.untimedProtocolPacket.officialEndCallObserved = true;
  assert.ok(protocol.inspectUntimedResearchGame(row).failures.includes(
    'packet-claims-timer-or-event-adjudication'));
});

test('event stage and event clock evidence are forbidden in untimed mode', () => {
  const stage = protocol.inspectUntimedResearchGame(fixture({ eventStage: 'open-swiss' }));
  assert.ok(stage.failures.includes('event-stage-present-in-untimed-mode'));
  const receipt = protocol.inspectUntimedResearchGame(fixture({ clockReceiptId: 'clock-1' }));
  assert.ok(receipt.failures.includes('event-clock-evidence-present-in-untimed-mode'));
  const noCall = protocol.inspectUntimedResearchGame(fixture({ noCallClockPacket: {} }));
  assert.ok(noCall.failures.includes('event-clock-evidence-present-in-untimed-mode'));
});

test('missing explicit not-applicable disposition fails', () => {
  const result = protocol.inspectUntimedResearchGame(fixture({ clockDisposition: null }));
  assert.ok(result.failures.includes('untimed-clock-disposition-not-explicit'));
});

test('natural terminal must bind the paper receipt and evidence digest', () => {
  const row = fixture();
  row.untimedProtocolPacket.paperReceiptId = 'other-paper-receipt';
  row.untimedProtocolPacket.terminalEvidenceSha256 = 'not-a-sha';
  const result = protocol.inspectUntimedResearchGame(row);
  assert.ok(result.failures.includes('packet-paper-receipt-binding-mismatch'));
  assert.ok(result.failures.includes('paper-terminal-evidence-digest-invalid'));
});

test('paper outcome must be a consistent winner or natural tie', () => {
  const badWinner = protocol.inspectUntimedResearchGame(fixture({ paperGameWinner: 2 }));
  assert.ok(badWinner.failures.includes('paper-game-winner-seat-invalid'));
  const badTie = fixture({ paperGameWinner: 0, paperGameTie: true });
  badTie.untimedProtocolPacket.paperGameTie = true;
  const tieResult = protocol.inspectUntimedResearchGame(badTie);
  assert.ok(tieResult.failures.includes('tied-paper-game-has-winner-seat'));
});

test('protocol evidence reference, digest and post-deal attestation time are required', () => {
  const row = fixture();
  row.untimedProtocolPacket.protocolEvidenceRef = ' ';
  row.untimedProtocolPacket.protocolEvidenceSha256 = 'bad';
  row.untimedProtocolPacket.attestedAt = '2026-11-12T00:00:30.000Z';
  const result = protocol.inspectUntimedResearchGame(row);
  assert.ok(result.failures.includes('untimed-protocol-evidence-reference-missing'));
  assert.ok(result.failures.includes('untimed-protocol-evidence-digest-invalid'));
  assert.ok(result.failures.includes('untimed-protocol-attestation-time-invalid'));
});

test('invalid paper terminal and preregistration evidence references fail closed', () => {
  const row = fixture();
  row.paperReceiptId = ' ';
  row.registration.sha256 = 'bad';
  row.untimedProtocolPacket.terminalEvidenceRef = '';
  const result = protocol.inspectUntimedResearchGame(row);
  assert.ok(result.failures.includes('paper-receipt-id-missing'));
  assert.ok(result.failures.includes('registration-digest-invalid'));
  assert.ok(result.failures.includes('paper-terminal-evidence-reference-missing'));
});

test('timestamps must be offset-aware ISO date-times', () => {
  const row = fixture();
  row.registration.registeredAt = '2026-11-12';
  const result = protocol.inspectUntimedResearchGame(row);
  assert.ok(result.failures.includes('untimed-mode-not-preregistered-before-deal'));
});

test('event clock fields inside the untimed packet also invalidate it', () => {
  const row = fixture();
  row.untimedProtocolPacket.clockReceiptId = 'event-clock-1';
  const result = protocol.inspectUntimedResearchGame(row);
  assert.ok(result.failures.includes('packet-event-clock-evidence-present'));
});
