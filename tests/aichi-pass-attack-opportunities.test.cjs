'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {auditPassedAttackAnnouncements} =
  require('../scripts/aichi-pass-attack-opportunities.cjs');

/** @param {object[]} trace */
function archived(trace, seat = 'B') {
  const sha = createHash('sha256').update(JSON.stringify(trace)).digest('hex');
  return {
    purpose: 'engine-and-policy-diagnostic-only',
    engineAndPolicyQualified: false, strengthClaimPermitted: false,
    totalScheduled: 1, planDigest: 'fixed-provenance',
    researchPolicyProfile: 'fixed-core-v1',
    records: [{
      trialId: 'pilot:2:0:hood-shield-v1:' + seat,
      candidateId: 'hood-shield-v1', candidateEngineSlot: seat,
      opponentRank: 2, opponentDigest: 'fixed-rank-2-source',
      status: 'completed-engine-game', candidateAttacks: 3, opponentAttacks: 0,
      traceSummary: {
        chronologicalActionTrace: trace,
        chronologicalActionTraceSha256: sha
      }
    }]
  };
}
/** @param {number} seat @param {object|undefined} probe @param {number} ordinal */
function pass(seat, probe, ordinal) {
  return {
    action: 'PassTurnAction', actionOrdinal: ordinal,
    playerSlot: seat, turnBefore: ordinal, turnAfter: ordinal + 1,
    ...(probe ? {attackPassProbe: probe} : {})
  };
}
function probe(id, accepted = true) {
  return {
    evidenceType: 'post-choice-cloned-attack-announcements-v1',
    playerId: id, activePokemon: 'Bunnelby',
    tested: [
      {name: 'Burrow', source: 'printed', engineAcceptedAnnouncement: false},
      {name: 'Evolution', source: 'attached-tool',
        engineAcceptedAnnouncement: accepted}
    ],
    truncated: false
  };
}

test('count accepted Tool attack announcement separately from skipped passes', () => {
  const archive = archived([
    pass(0, probe(101), 3),
    pass(1, undefined, 5),
    pass(1, probe(202, false), 8)
  ]);
  const report = auditPassedAttackAnnouncements(archive);
  assert.equal(report.totalTrials, 1);
  assert.equal(report.coverage.recordedPasses, 3);
  assert.equal(report.coverage.probedPasses, 2);
  assert.equal(report.coverage.skippedPasses, 1);
  assert.equal(report.coverage.acceptedAttackPasses, 1);
  assert.equal(report.trials[0].acceptedToolAttackPasses, 1);
  assert.equal(report.trials[0].acceptedPrintedAttackPasses, 0);
  assert.equal(report.checkedPasses[0].side, 'opponent');
  assert.equal(report.checkedPasses[1].side, 'candidate');
  assert.equal(report.winRateEvidence, false);
  assert.equal(report.candidateRankingPermitted, false);
});

test('reject malformed provenance and changed action-trace data', () => {
  const valid = archived([pass(0, probe(101), 3)]);
  valid.records[0].traceSummary.chronologicalActionTrace[0].turnBefore++;
  const report = auditPassedAttackAnnouncements(valid);
  assert.equal(report.trials[0].traceIntegrity, 'unverified');
  assert.equal(report.coverage.recordedPasses, 0);
  valid.records[0].traceSummary.chronologicalActionTraceSha256 =
    createHash('sha256').update(JSON.stringify(
      valid.records[0].traceSummary.chronologicalActionTrace)).digest('hex');
  valid.records[0].candidateEngineSlot = 'Z';
  assert.throws(() => auditPassedAttackAnnouncements(valid), /seat/);
});

test('fail closed on forged player ownership or duplicate attack-name outcomes', () => {
  const wrong = archived([pass(0, probe(202), 7)], 'A');
  assert.throws(() => auditPassedAttackAnnouncements(wrong), /Malformed cloned/);
  const repeated = probe(101);
  repeated.tested.push({...repeated.tested[0]});
  assert.throws(() => auditPassedAttackAnnouncements(
    archived([pass(0, repeated, 8)], 'A')), /duplicate attack/);
});

test('audit errors are not silently counted as an absence of legal attacks', () => {
  const error = {
    evidenceType: 'post-choice-cloned-attack-announcements-v1',
    auditError: 'Failed to clone pinned Store'
  };
  const report = auditPassedAttackAnnouncements(archived([
    pass(0, error, 0),
    pass(0, undefined, 1)
  ]));
  assert.equal(report.coverage.auditErrors, 1);
  assert.equal(report.coverage.probedPasses, 0);
  assert.equal(report.coverage.skippedPasses, 1);
  assert.equal(report.checkedPasses.length, 0);
});

test('accepted announcements preserve the contemporaneous public board but no hidden zones', () => {
  const selected = pass(0, probe(101), 14);
  selected.publicBoardBeforePass = [
    {active: {name: 'Pidgeot ex', energyCards: ['Capture Energy', 'Jet Energy']},
      bench: []},
    {active: {name: 'Shadow Rider Calyrex V'}, bench: []}
  ];
  const report = auditPassedAttackAnnouncements(archived([selected]));
  assert.deepEqual(report.checkedPasses[0].publicBoardBeforePass,
    selected.publicBoardBeforePass);
  assert.equal(Object.hasOwn(report.checkedPasses[0], 'playerHand'), false);
});
