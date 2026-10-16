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

test('legacy archives remain readable but receive an explicit unversioned profile', () => {
  const result = auditCampaignQuality(fixture());
  assert.equal(result.researchPolicyProfile, 'unversioned-legacy');
  assert.ok(result.records.every(record =>
    record.researchPolicyProfile === 'unversioned-legacy'));
});

test('versioned fixed trial policy drift is rejected before quality scoring', () => {
  const f = fixture();
  f.researchPolicyProfile = 'expanded-action-fidelity-probe-v1';
  for (const record of f.records) {
    record.researchPolicyProfile = 'expanded-action-fidelity-probe-v1';
  }
  const checked = auditCampaignQuality(f);
  assert.equal(checked.researchPolicyProfile, 'expanded-action-fidelity-probe-v1');
  f.records[1].researchPolicyProfile = 'fixed-core-v1';
  assert.throws(() => auditCampaignQuality(f), /policy profile differs/);
  f.records[1].researchPolicyProfile = 'expanded-action-fidelity-probe-v1';
  f.researchPolicyProfile = 'forged-game-policy';
  assert.throws(() => auditCampaignQuality(f), /research policy profile/);
});


test('v3 source-locked decorrelated seeds pass the same quality gate', () => {
  const f = fixture();
  f.campaignSchemaVersion = 3;
  f.seedProtocol = 'decorrelated-slots-v3';
  for (const record of f.records) {
    record.seed = record.candidateEngineSlot === 'A' ? 1509836216 : 995631139;
  }
  const out = auditCampaignQuality(f);
  assert.equal(out.seedProtocol, 'decorrelated-slots-v3');
  assert.equal(out.fullPilotMatrixVerified, true);
  assert.equal(out.winRateEvidence, false);
  assert.equal(out.coverage[0].independentlyQualifiedGames, 0);
  f.records[1].seed = f.records[0].seed;
  f.records[2].seed = f.records[0].seed;
  assert.throws(() => auditCampaignQuality(f), /Independent physical slots/);
});

test('v3 schema rejects an unrecognized or falsely labeled protocol', () => {
  const f = fixture();
  f.campaignSchemaVersion = 3;
  assert.throws(() => auditCampaignQuality(f), /unsupported campaign schedule/);
  f.seedProtocol = 'decorrelated-slots-v3';
  assert.equal(auditCampaignQuality(f).winRateEvidence, false);
  f.campaignSchemaVersion = 4;
  assert.throws(() => auditCampaignQuality(f), /unsupported campaign schedule/);
});


test('v3 archive rederives each physical-slot seed when base is preserved', () => {
  const {deriveSlotSeeds} = require('../scripts/aichi-decorrelated-seeds.cjs');
  const f = fixture();
  f.campaignSchemaVersion = 3;
  f.seedProtocol = 'decorrelated-slots-v3';
  f.seedBase = 20261016;
  const seeds = deriveSlotSeeds(f.seedBase, 'pilot', 6, 0);
  for (const record of f.records) {
    record.seed = seeds[record.candidateEngineSlot];
  }
  const out = auditCampaignQuality(f);
  assert.equal(out.seedBase, 20261016);
  assert.equal(out.seedDerivationStatus, 'v3-derived-and-matched');
  assert.equal(out.winRateEvidence, false);
  f.records[0].seed += 2;
  f.records[3].seed += 2;
  assert.throws(() => auditCampaignQuality(f), /v3 seed differs/);
  f.records[0].seed -= 2;
  f.records[3].seed -= 2;
  f.seedBase = -1;
  assert.throws(() => auditCampaignQuality(f), /Invalid v3 archive seed base/);
});

test('a legacy v3 archive without the seed base is clearly marked', () => {
  const f = fixture();
  f.campaignSchemaVersion = 3;
  f.seedProtocol = 'decorrelated-slots-v3';
  assert.equal(auditCampaignQuality(f).seedDerivationStatus,
    'v3-base-missing-legacy');
});

test('experimental Simulator clone profile remains visible and is never ranked',()=>{
  const experimental=fixture();
  experimental.policyFlags={prototypeSafeSimulatorIsolation:true};
  const report=auditCampaignQuality(experimental);
  assert.equal(report.simulatorCloneProfile,'prototype-safe-experimental-v1');
  assert.ok(report.records.every(row=>
    row.simulatorCloneProfile==='prototype-safe-experimental-v1'));
  assert.equal(report.winRateEvidence,false);
  assert.equal(report.candidateRankingPermitted,false);
  const original=auditCampaignQuality(fixture());
  assert.equal(original.simulatorCloneProfile,'pinned-source-card-alias-v0');
});
