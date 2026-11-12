'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');

const VERSION = 'agent27-untimed-research-game-protocol-v1';
const MODE = 'untimed-research-game';
const PACKET_SCHEMA = 'agent27-untimed-research-game-packet-v1';
const CLOCK_DISPOSITION = 'not-applicable-by-preregistered-untimed-protocol';
const OUTPUT_SCHEMA = 'agent27-untimed-research-game-assessment-v1';

/** @param {any} value */
function nonblank(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/** @param {any} value */
function sha256(value) {
  return typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value);
}

/** @param {any} value @returns {number|null} */
function timestamp(value) {
  if (typeof value !== 'string' || value.trim() !== value ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Digest the exact research-owned protocol implementation. This is a version
 * binding, not proof that a caller-supplied registration or evidence file is
 * authentic; the V3 bundle and independent paper review must bind those.
 * @returns {string}
 */
function untimedResearchProtocolSha256() {
  return crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex');
}

/**
 * Inspect a prospective untimed paper-game protocol packet. The packet is an
 * untrusted producer assertion until an independent paper reviewer checks the
 * terminal and the no-timer evidence. This module never admits a game.
 *
 * The preregistration must be frozen before deal generation. The event clock
 * path is intentionally separate: do not use this helper for an Aichi event
 * match, and do not reinterpret a null/missing event-clock packet as untimed.
 *
 * @param {object} trial V3 trial record containing registration and packet.
 * @returns {object} Fail-closed structural assessment only.
 */
function inspectUntimedResearchGame(trial) {
  const failures = [];
  const fail = code => failures.push(code);
  const registration = trial?.registration ?? null;
  const packet = trial?.untimedProtocolPacket ?? null;
  const protocolSha256 = untimedResearchProtocolSha256();

  if (trial?.admissionMode !== MODE) fail('untimed-mode-not-explicit');
  if (!nonblank(trial?.trialId)) fail('trial-id-missing');

  if (!registration || typeof registration !== 'object' || Array.isArray(registration)) {
    fail('frozen-registration-missing');
  } else {
    if (registration.mode !== MODE) fail('registration-mode-mismatch');
    if (registration.trialId !== trial?.trialId) fail('registration-trial-id-mismatch');
    if (!nonblank(registration.ref)) fail('registration-reference-missing');
    if (!sha256(registration.sha256)) fail('registration-digest-invalid');
    const registeredAt = timestamp(registration.registeredAt);
    const dealGeneratedAt = timestamp(registration.dealGeneratedAt);
    if (registeredAt === null || dealGeneratedAt === null || registeredAt >= dealGeneratedAt)
      fail('untimed-mode-not-preregistered-before-deal');
    if (registration.protocolSha256 !== protocolSha256)
      fail('untimed-protocol-digest-mismatch');
  }

  if (trial?.clockDisposition !== CLOCK_DISPOSITION)
    fail('untimed-clock-disposition-not-explicit');
  if (trial?.eventStage !== null) fail('event-stage-present-in-untimed-mode');
  if (trial?.clockReceiptId !== null || trial?.clockEvidence !== null ||
      trial?.clockEvidenceRef !== null || trial?.noCallClockPacket !== null ||
      trial?.timeCallPacket !== null || trial?.extensionLedgerPacket !== null ||
      trial?.officialClockCoverageEvidenceRef !== null)
    fail('event-clock-evidence-present-in-untimed-mode');
  if (trial?.timerUsed !== false || trial?.officialEndCallObserved !== false ||
      trial?.timeLimitApplied !== false)
    fail('timer-or-event-adjudication-used-in-untimed-mode');

  if (!nonblank(trial?.paperReceiptId)) fail('paper-receipt-id-missing');
  if (typeof trial?.paperGameTie !== 'boolean') {
    fail('paper-game-tie-state-missing');
  } else if (trial.paperGameTie === true) {
    if (trial.paperGameWinner !== null) fail('tied-paper-game-has-winner-seat');
  } else if (trial.paperGameWinner !== 0 && trial.paperGameWinner !== 1) {
    fail('paper-game-winner-seat-invalid');
  }

  if (!packet || typeof packet !== 'object' || Array.isArray(packet)) {
    fail('untimed-protocol-packet-missing');
  } else {
    if (packet.schema !== PACKET_SCHEMA) fail('untimed-protocol-packet-schema-mismatch');
    if (packet.mode !== MODE) fail('packet-mode-mismatch');
    if (packet.clockDisposition !== CLOCK_DISPOSITION)
      fail('packet-clock-disposition-not-explicit');
    if (packet.clockReceiptId !== null || packet.clockEvidence !== null ||
        packet.clockEvidenceRef !== null || packet.noCallClockPacket !== null ||
        packet.timeCallPacket !== null || packet.extensionLedgerPacket !== null ||
        packet.officialClockCoverageEvidenceRef !== null)
      fail('packet-event-clock-evidence-present');
    if (packet.trialId !== trial?.trialId) fail('packet-trial-id-mismatch');
    if (packet.registrationRef !== registration?.ref ||
        packet.registrationSha256 !== registration?.sha256)
      fail('packet-registration-binding-mismatch');
    if (packet.protocolSha256 !== protocolSha256 ||
        packet.protocolSha256 !== registration?.protocolSha256)
      fail('packet-protocol-digest-mismatch');
    if (packet.timerUsed !== false || packet.officialEndCallObserved !== false ||
        packet.officialEndCallPossible !== false || packet.timeLimitApplied !== false)
      fail('packet-claims-timer-or-event-adjudication');
    if (packet.eventStage !== null) fail('packet-event-stage-not-null');
    if (packet.naturalTerminalOnly !== true) fail('natural-terminal-only-not-asserted');
    if (!nonblank(packet.paperReceiptId) || packet.paperReceiptId !== trial?.paperReceiptId)
      fail('packet-paper-receipt-binding-mismatch');
    if (packet.paperGameWinner !== trial?.paperGameWinner ||
        packet.paperGameTie !== trial?.paperGameTie)
      fail('packet-paper-outcome-binding-mismatch');
    if (!nonblank(packet.terminalEvidenceRef)) fail('paper-terminal-evidence-reference-missing');
    if (!sha256(packet.terminalEvidenceSha256)) fail('paper-terminal-evidence-digest-invalid');
    if (!nonblank(packet.protocolEvidenceRef)) fail('untimed-protocol-evidence-reference-missing');
    if (!sha256(packet.protocolEvidenceSha256)) fail('untimed-protocol-evidence-digest-invalid');
    const dealGeneratedAt = timestamp(registration?.dealGeneratedAt);
    const terminalAt = timestamp(packet.terminalAt);
    const attestedAt = timestamp(packet.attestedAt);
    if (dealGeneratedAt === null || terminalAt === null || attestedAt === null ||
        terminalAt < dealGeneratedAt || attestedAt < terminalAt)
      fail('untimed-protocol-attestation-time-invalid');
  }

  const complete = failures.length === 0;
  return Object.freeze({
    schema: OUTPUT_SCHEMA,
    version: VERSION,
    mode: MODE,
    status: complete ?
      'UNTIMED_RESEARCH_PACKET_COMPLETE_PENDING_INDEPENDENT_PAPER_REVIEW' :
      'UNTIMED_RESEARCH_PACKET_INCOMPLETE',
    shapeComplete: complete,
    clockDisposition: trial?.clockDisposition ?? 'unverified',
    outcome: complete ? (trial.paperGameTie ? 'paper-tie' : 'paper-win') : null,
    winnerSeat: complete ? trial.paperGameWinner : null,
    protocolSha256,
    conditionalOnly: true,
    competitiveAdmission: false,
    paperReviewerRequired: true,
    paperReviewerMustConfirmNaturalTerminal: true,
    paperReviewerMustConfirmNoTimer: true,
    clockReviewerRequired: false,
    strategyReviewerRequired: true,
    failures: Object.freeze([...failures])
  });
}

module.exports = {
  VERSION,
  MODE,
  PACKET_SCHEMA,
  CLOCK_DISPOSITION,
  OUTPUT_SCHEMA,
  nonblank,
  sha256,
  timestamp,
  untimedResearchProtocolSha256,
  inspectUntimedResearchGame
};
