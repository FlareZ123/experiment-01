'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const test = require('node:test');
const {auditCampaignQuality} = require('../scripts/aichi-campaign-quality-screen.cjs');

const trace = [{
  actionOrdinal: 1, action: 'PassTurnAction', playerSlot: 0,
  turnBefore: 1, turnAfter: 2, prizesAfter: [6, 6], decksAfter: [44, 43]
}];
const traceHash = createHash('sha256').update(JSON.stringify(trace)).digest('hex');

function fixture() {
  const source = {
    purpose: 'engine-and-policy-diagnostic-only',
    planDigest: 'a-frozen-plan',
    seedProtocol: 'independent-slots-v2',
    campaignSchemaVersion: 2,
    selectedPilotRanks: [6],
    candidateRows: [{id: 'reference', deckDigest: 'reference-digest'},
      {id: 'challenger', deckDigest: 'challenger-digest'}],
    totalScheduled: 4,
    engineAndPolicyQualified: false,
    strengthClaimPermitted: false,
    records: [{
      trialId: 'pilot:6:0:reference:A',
      phase: 'pilot', seed: 20367160, opponentDigest: 'source-rank-6',
      planDigest: 'a-frozen-plan', opponentRank: 6,
      candidateId: 'reference', candidateDigest: 'reference-digest',
      candidateEngineSlot: 'A', candidateActualTurn: 'first',
      turnEvidence: {firstTurnSlot: 0, verifiedByDrawLog: true},
      status: 'completed-engine-game', candidateAttacks: 0, opponentAttacks: 2,
      traceSummary: {
        chronologicalActionTrace: trace,
        chronologicalActionTraceSha256: traceHash,
        coversAllActionsAndPromptResolutions: false,
        terminalTransition: {after: {players: [
          {deckRemaining: 0, prizesRemaining: 3},
          {deckRemaining: 1, prizesRemaining: 4}
        ]}}
      }
    }, {
      trialId: 'pilot:6:0:challenger:B',
      phase: 'pilot', seed: 20367161, opponentDigest: 'source-rank-6',
      planDigest: 'a-frozen-plan', opponentRank: 6,
      candidateId: 'challenger', candidateDigest: 'challenger-digest',
      candidateEngineSlot: 'B', candidateActualTurn: 'second',
      turnEvidence: {firstTurnSlot: 0, verifiedByDrawLog: true},
      status: 'completed-engine-game', candidateAttacks: 3, opponentAttacks: 0,
      traceSummary: {
        chronologicalActionTrace: trace,
        chronologicalActionTraceSha256: traceHash,
        coversAllActionsAndPromptResolutions: false
      }
    }]
  };
  source.records.push(
    {...source.records[0], trialId: 'pilot:6:0:reference:B',
      candidateEngineSlot: 'B', candidateActualTurn: 'second',
      seed: 20367161, candidateAttacks: 3, opponentAttacks: 2},
    {...source.records[1], trialId: 'pilot:6:0:challenger:A',
      candidateEngineSlot: 'A', candidateActualTurn: 'first',
      seed: 20367160, candidateAttacks: 3, opponentAttacks: 2}
  );
  return source;
}

test('engine completions expose rank-level inactivity without ranking candidates', () => {
  const report = auditCampaignQuality(fixture());
  assert.equal(report.kind, 'aichi-fixed-campaign-quality-screen-v1');
  assert.equal(report.winRateEvidence, false);
  assert.equal(report.candidateRankingPermitted, false);
  assert.equal(Object.hasOwn(report, 'winRate'), false);
  assert.equal(report.totalTrials, 4);
  assert.equal(report.fullPilotMatrixVerified, true);
  assert.equal(report.repeatsVerified, 1);
  assert.equal(report.coverage.length, 2);
  assert.equal(report.coverage[0].observedFirst, 1);
  assert.equal(report.coverage[1].observedSecond, 1);
  assert.equal(report.coverage[0].zeroCandidateAttackTrials, 1);
  assert.equal(report.coverage[1].zeroOpponentAttackTrials, 1);
  assert.equal(report.coverage[0].independentlyQualifiedGames, 0);
  assert.equal(report.records[0].traceIntegrity, 'digest-valid');
  assert.ok(report.records[0].blockers.includes('empty-deck-at-terminal'));
  assert.ok(report.records[1].blockers.includes('terminal-board-unavailable'));
  assert.equal(report.records[0].priority, 'attacker-policy-investigation');
});

test('a changed stored action trace loses digest integrity', () => {
  const f = fixture();
  f.records[0].traceSummary.chronologicalActionTrace = [{changed: true}];
  const out = auditCampaignQuality(f);
  assert.equal(out.records[0].traceIntegrity, 'digest-mismatch');
  assert.ok(out.records[0].blockers.includes('trace-digest-mismatch'));
});

test('candidate seat claims must agree with independently captured first turn', () => {
  const f = fixture();
  f.records[1].candidateActualTurn = 'first';
  const out = auditCampaignQuality(f);
  assert.ok(out.records[1].blockers.includes('unverified-starting-turn'));
});

test('incomplete diagnostic, duplicate trial and source drift are rejected', () => {
  const f = fixture();
  f.totalScheduled++;
  assert.throws(() => auditCampaignQuality(f), /complete/);
  f.totalScheduled--;
  f.records[1].trialId = f.records[0].trialId;
  assert.throws(() => auditCampaignQuality(f), /identity/);
  f.records[1].trialId = 'pilot:6:0:challenger:B';
  f.records[1].candidateDigest = 'changed-after-scheduling';
  assert.throws(() => auditCampaignQuality(f), /identity/);
});

test('engine failures remain separate from policy-quality observations', () => {
  const f = fixture();
  f.records[0].status = 'engine-exception';
  f.records[0].candidateAttacks = null;
  f.records[0].opponentAttacks = null;
  f.records[0].traceSummary = null;
  const out = auditCampaignQuality(f);
  assert.ok(out.records[0].blockers.includes('engine-status:engine-exception'));
  assert.ok(out.records[0].blockers.includes('missing-attack-counts'));
  assert.equal(out.records[0].priority, 'engine-or-resolver-investigation');
});

test('an expected record count cannot conceal omitted pilot matrix cells', () => {
  const f = fixture();
  f.records[2].trialId = 'pilot:6:1:reference:B';
  assert.throws(() => auditCampaignQuality(f), /scheduled trial identity/);
});

test('candidate variants must retain exactly matched physical-slot seeds', () => {
  const f = fixture();
  f.records[3].seed += 17;
  assert.throws(() => auditCampaignQuality(f), /scheduled slot seed/);
});

test('independent slot protocol rejects falsely paired A and B seeds', () => {
  const f = fixture();
  f.records[1].seed = f.records[0].seed;
  f.records[2].seed = f.records[0].seed;
  assert.throws(() => auditCampaignQuality(f), /Independent physical slots/);
});

test('all candidates at a rank must reference the same opponent printing inventory', () => {
  const f = fixture();
  f.records[1].opponentDigest = 'a-different-list';
  assert.throws(() => auditCampaignQuality(f), /source digest drift/);
});

test('rank/candidate identities must agree with the encoded trial identifier', () => {
  const f = fixture();
  f.records[0].opponentRank = 10;
  assert.throws(() => auditCampaignQuality(f), /scheduled trial identity|source-drifted trial identity/);
});
