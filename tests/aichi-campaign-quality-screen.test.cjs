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
      status: 'completed-engine-game', actions: 12,
      candidateAttacks: 0, opponentAttacks: 2,
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
      status: 'completed-engine-game', actions: 12,
      candidateAttacks: 3, opponentAttacks: 0,
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

test('both Simulator clone modes retain explicit trial-level safety blockers', () => {
  const original = auditCampaignQuality(fixture());
  assert.equal(original.simulatorCloneProfile, 'pinned-source-card-alias-v0');
  assert.equal(original.simulatorSafetyStatus, 'known-simulator-card-alias-risk');
  assert.equal(original.simulatorSafetyBlocker, 'unvalidated-simulator-alias');
  assert.equal(original.simulatorSafetyQualified, false);
  assert.ok(original.records.every(row =>
    row.simulatorSafetyStatus === original.simulatorSafetyStatus &&
    row.simulatorSafetyBlocker === original.simulatorSafetyBlocker &&
    row.blockers.includes('unvalidated-simulator-alias') &&
    !row.blockers.includes('experimental-clone-not-qualified')));

  const experimental = fixture();
  experimental.policyFlags = {prototypeSafeSimulatorIsolation: true};
  const report = auditCampaignQuality(experimental);
  assert.equal(report.simulatorCloneProfile, 'prototype-safe-experimental-v1');
  assert.equal(report.simulatorSafetyStatus, 'experimental-clone-not-qualified');
  assert.equal(report.simulatorSafetyBlocker, 'experimental-clone-not-qualified');
  assert.equal(report.simulatorSafetyQualified, false);
  assert.ok(report.records.every(row =>
    row.simulatorCloneProfile === 'prototype-safe-experimental-v1' &&
    row.simulatorSafetyStatus === report.simulatorSafetyStatus &&
    row.simulatorSafetyBlocker === report.simulatorSafetyBlocker &&
    row.blockers.includes('experimental-clone-not-qualified') &&
    !row.blockers.includes('unvalidated-simulator-alias')));
  assert.equal(report.winRateEvidence, false);
  assert.equal(report.candidateRankingPermitted, false);
  assert.ok(report.coverage.every(row => row.independentlyQualifiedGames === 0));
  assert.deepEqual(report.records.map(row => row.trialId),
    original.records.map(row => row.trialId));
  assert.deepEqual(report.coverage, original.coverage);
  assert.ok(report.records.every((row,index) => {
    const baseline=original.records[index];
    return row.status===baseline.status &&
      row.traceIntegrity===baseline.traceIntegrity &&
      row.priority===baseline.priority &&
      row.candidateAttacks===baseline.candidateAttacks &&
      row.opponentAttacks===baseline.opponentAttacks;
  }));
});

test('physical-seat balance cannot impersonate both verified actual starting orders', () => {
  const f = fixture();
  for (const record of f.records) {
    record.turnEvidence = {
      firstTurnSlot: record.candidateEngineSlot === 'A' ? 0 : 1,
      verifiedByDrawLog: true
    };
    record.candidateActualTurn = 'first';
  }
  const out = auditCampaignQuality(f);
  assert.equal(out.missingActualTurnCoverage.length, 2);
  assert.ok(out.coverage.every(row =>
    row.actualTurnCoverageComplete === false &&
    row.observedFirst === 2 &&
    row.observedSecond === 0 &&
    JSON.stringify(row.missingActualTurnStrata) === JSON.stringify(['second'])));
  assert.equal(out.winRateEvidence, false);
});

test('an unverified first-draw log contributes no observed starting-order evidence', () => {
  const f = fixture();
  f.records[0].turnEvidence = {...f.records[0].turnEvidence, verifiedByDrawLog: false};
  const out = auditCampaignQuality(f);
  assert.equal(out.records[0].actualTurn, 'unverified');
  assert.ok(out.records[0].blockers.includes('unverified-starting-turn'));
  assert.equal(out.coverage[0].observedFirst, 0);
  assert.deepEqual(out.coverage[0].missingActualTurnStrata, ['first']);
});

test('declared mechanisms distinguish observed actions from incomplete trace silence', () => {
  const f = fixture();
  f.mechanismChecks = [
    {id: 'tool-counter', candidateId: 'challenger', rank: 6,
      action: 'PlayCardAction', detail: 'Field Blower'},
    {id: 'copy-attack', candidateId: 'challenger',
      action: 'UseAbilityAction', detail: 'Perfection'}
  ];
  let out = auditCampaignQuality(f);
  assert.equal(out.mechanismExpectationStatus, 'declared');
  assert.equal(out.coverage[0].mechanismExposure.length, 0);
  assert.deepEqual(out.coverage[1].mechanismExposure.map(x => x.status),
    ['unknown-incomplete-traces', 'unknown-incomplete-traces']);
  for (const record of f.records) {
    record.traceSummary = {...record.traceSummary,
      coversAllActionsAndPromptResolutions: true};
  }
  out = auditCampaignQuality(f);
  assert.deepEqual(out.coverage[1].mechanismExposure.map(x => x.status),
    ['unknown-incomplete-traces', 'unknown-incomplete-traces']);
  const actionTrace = [{actionOrdinal: 1, action: 'PlayCardAction',
    playerSlot: 0, card: 'Field Blower'}];
  f.records[3].traceSummary.chronologicalActionTrace = actionTrace;
  f.records[3].traceSummary.chronologicalActionTraceSha256 =
    createHash('sha256').update(JSON.stringify(actionTrace)).digest('hex');
  out = auditCampaignQuality(f);
  assert.equal(out.coverage[1].mechanismExposure[0].observedActions, 1);
  assert.equal(out.coverage[1].mechanismExposure[0].status, 'observed');
  assert.equal(out.coverage[1].mechanismExposure[1].status, 'unknown-incomplete-traces');
  f.records[3].traceSummary.chronologicalActionTraceSha256 = 'forged';
  out = auditCampaignQuality(f);
  assert.equal(out.coverage[1].mechanismExposure[0].status, 'unknown-incomplete-traces');
  assert.equal(out.coverage[1].mechanismExposure[0].observedActions, 0);
  assert.equal(out.winRateEvidence, false);
});

test('mechanism expectations reject duplicate identifiers and unregistered targets', () => {
  const f = fixture();
  const check = {id:'test', candidateId:'challenger', action:'AttackAction',
    detail:'Psychic'};
  f.mechanismChecks = [check, {...check}];
  assert.throws(() => auditCampaignQuality(f), /mechanism check/);
  f.mechanismChecks = [{...check, id:'other', candidateId:'not-in-campaign'}];
  assert.throws(() => auditCampaignQuality(f), /mechanism check/);
});

test('equal-seed candidate variants cannot claim paired starts when engine order differs', () => {
  const f = fixture();
  // Same rank/repeat/physical A/seed, but a changed deck causes the
  // candidate Challenger to actually begin second.
  f.records[3].turnEvidence = {firstTurnSlot: 1, verifiedByDrawLog: true};
  f.records[3].candidateActualTurn = 'second';
  const result = auditCampaignQuality(f);
  assert.equal(result.pairedStartOrderComparable, false);
  assert.equal(result.pairedStartOrderIssues.length, 1);
  assert.equal(result.pairedStartOrderIssues[0].status, 'mismatch');
  assert.equal(result.pairedStartOrderIssues[0].scheduledRankRepeatSlot, '6:0:A');
  for (const i of [0, 3]) {
    assert.equal(result.records[i].pairedFirstTurnStatus, 'mismatch');
    assert.ok(result.records[i].blockers.includes(
      'cross-variant-start-order-mismatch'));
  }
  for (const i of [1, 2]) {
    assert.equal(result.records[i].pairedFirstTurnStatus, 'matched');
  }
  assert.equal(result.coverage[0].pairedFirstTurnMismatches, 1);
  assert.equal(result.coverage[1].pairedFirstTurnMismatches, 1);
  assert.equal(result.winRateEvidence, false);
});

test('a missing source draw-log verification invalidates only the affected comparison pair', () => {
  const f = fixture();
  f.records[3].turnEvidence = {...f.records[3].turnEvidence, verifiedByDrawLog: false};
  f.records[3].candidateActualTurn = 'unverified';
  const result = auditCampaignQuality(f);
  assert.equal(result.pairedStartOrderComparable, false);
  assert.equal(result.pairedStartOrderIssues.length, 1);
  assert.equal(result.pairedStartOrderIssues[0].status, 'unverified');
  for (const i of [0, 3]) {
    assert.ok(result.records[i].blockers.includes(
      'cross-variant-start-order-unverified'));
  }
  assert.equal(result.coverage[0].pairedFirstTurnUnverified, 1);
  assert.equal(result.coverage[1].pairedFirstTurnUnverified, 1);
});

test('one-candidate source diagnostics are correctly labeled as unpaired', () => {
  const f = fixture();
  f.candidateRows = f.candidateRows.slice(0, 1);
  f.records = f.records.filter(record => record.candidateId === 'reference');
  f.totalScheduled = 2;
  const result = auditCampaignQuality(f);
  assert.equal(result.pairedStartOrderComparable, false);
  assert.equal(result.pairedStartOrderIssues.length, 0);
  assert.ok(result.records.every(record =>
    record.pairedFirstTurnStatus === 'not-applicable'));
});


test('Perfection delegated declaration overrides the raw root-zero diagnostic', () => {
  const f = fixture();
  const record = f.records[0];
  const protocol = 'real-store-attack-log-declarations-v1';
  const event = (slot, logIndex, ordinal) => ({
    kind: 'engine-attack-declaration', playerSlot: slot,
    playerName: slot === 0 ? 'research-A' : 'research-B',
    attackName: 'Horror House-GX', logIndex,
    actionOrdinal: ordinal
  });
  record.actions = 10;
  record.attackObservationStatus = protocol;
  record.candidateAttackDeclarations = 1;
  record.opponentAttackDeclarations = 2;
  record.traceSummary = {
    ...record.traceSummary,
    attackDeclarationTraceProtocol: protocol,
    attackDeclarationsAreCompleteEffects: false,
    attackDeclarationTrace: [
      event(0, 0, 2), event(1, 1, 3), event(1, 2, 4)
    ]
  };
  const out = auditCampaignQuality(f);
  const row = out.records[0];
  assert.equal(row.candidateAttacks, 0);
  assert.equal(row.candidateLoggedAttackDeclarations, 1);
  assert.equal(row.attackObservationStatus,
    'self-consistent-engine-attack-declarations');
  assert.ok(row.blockers.includes('candidate-root-attack-action-undercount'));
  assert.ok(!row.blockers.includes('zero-candidate-attacks'));
  assert.ok(!row.blockers.includes('zero-candidate-logged-attack-declarations'));
  assert.equal(out.coverage[0].zeroCandidateAttackTrials, 1);
  assert.equal(out.coverage[0].zeroCandidateLoggedDeclarationTrials, 0);
  assert.equal(out.winRateEvidence, false);
});

test('a logged zero is distinguished from unavailable attack telemetry', () => {
  const f = fixture();
  const record = f.records[0];
  const protocol = 'real-store-attack-log-declarations-v1';
  record.actions = 10;
  record.attackObservationStatus = protocol;
  record.candidateAttackDeclarations = 0;
  record.opponentAttackDeclarations = 0;
  record.traceSummary = {
    ...record.traceSummary,
    attackDeclarationTraceProtocol: protocol,
    attackDeclarationsAreCompleteEffects: false,
    attackDeclarationTrace: []
  };
  let row = auditCampaignQuality(f).records[0];
  assert.ok(row.blockers.includes('zero-candidate-logged-attack-declarations'));
  assert.ok(!row.blockers.includes('zero-candidate-attacks'));
  record.candidateAttackDeclarations = 1;
  row = auditCampaignQuality(f).records[0];
  assert.equal(row.attackObservationStatus, 'attack-observation-integrity-mismatch');
  assert.ok(row.blockers.includes('attack-observation-integrity-mismatch'));
  assert.ok(row.blockers.includes('zero-candidate-attacks'));
  assert.equal(row.candidateLoggedAttackDeclarations, null);
});

test('mixed ordinary and delegated attacks expose both directions of log mismatch', () => {
  const f = fixture();
  const record = f.records[0];
  const protocol = 'real-store-attack-log-declarations-v1';
  const event = (playerSlot, index, ordinal) => ({
    kind: 'engine-attack-declaration', playerSlot,
    playerName: playerSlot === 0 ? 'research-A' : 'research-B',
    attackName: 'Phantom Dive', logIndex: index, actionOrdinal: ordinal
  });
  record.actions = 10;
  record.candidateAttacks = 1;
  record.opponentAttacks = 2;
  record.attackObservationStatus = protocol;
  record.candidateAttackDeclarations = 2;
  record.opponentAttackDeclarations = 1;
  record.traceSummary = {
    ...record.traceSummary,
    attackDeclarationTraceProtocol: protocol,
    attackDeclarationsAreCompleteEffects: false,
    attackDeclarationTrace: [
      event(0, 1, 2), event(0, 2, 3), event(1, 3, 4)
    ]
  };
  const result = auditCampaignQuality(f);
  const row = result.records[0];
  assert.equal(row.candidateLoggedAttackDeclarations, 2);
  assert.equal(row.opponentLoggedAttackDeclarations, 1);
  assert.ok(row.blockers.includes('candidate-root-attack-action-undercount'));
  assert.ok(row.blockers.includes('opponent-root-action-without-declaration'));
  assert.equal(row.priority, 'engine-or-resolver-investigation');
  assert.equal(result.coverage[0].candidateRootUndercountTrials, 1);
  assert.equal(result.coverage[0].opponentRootUnloggedTrials, 1);
  assert.equal(result.winRateEvidence, false);
});


test('each mechanism witness is one actual root ordinal with later opponent root distinguished', () => {
  const f = fixture();
  f.mechanismChecks = [
    {id: 'blower', candidateId: 'challenger', rank: 6,
      action: 'PlayCardAction', detail: 'Field Blower'}
  ];
  const actions = [
    {actionOrdinal: 1, action: 'PlayCardAction', card: 'Field Blower',
      playerSlot: 0, turnBefore: 5},
    {actionOrdinal: 2, action: 'ResolvePromptAction', playerSlot: 0, turnBefore: 5},
    {actionOrdinal: 3, action: 'PlayCardAction', card: 'Opponent Supporter',
      playerSlot: 1, turnBefore: 6}
  ];
  const record = f.records[3];
  record.traceSummary.chronologicalActionTrace = actions;
  record.traceSummary.chronologicalActionTraceSha256 =
    createHash('sha256').update(JSON.stringify(actions)).digest('hex');
  const audited = auditCampaignQuality(f);
  const mechanism = audited.coverage.find(row => row.candidateId === 'challenger')
    .mechanismExposure[0];
  assert.equal(mechanism.status, 'observed');
  assert.equal(mechanism.observedActions, 1);
  assert.equal(mechanism.laterOpponentRootDispatches, 1);
  assert.equal(mechanism.opponentNextTurnRootDispatches, 1);
  assert.deepEqual(mechanism.rootWitnesses, [{
    trialId: record.trialId, rootActionOrdinal: 1,
    laterOpponentRootActionOrdinal: 3,
    opponentNextTurnRootActionOrdinal: 3
  }]);
  assert.equal(mechanism.opportunityStatus, 'unobserved');
  assert.equal(mechanism.hypotheticalProposalStatus, 'unobserved');
  assert.equal(mechanism.resolvedEffectStatus, 'unobserved');
  assert.equal(audited.records[3].rootDecisionLineageStatus,
    'self-consistent-root-decision-lineage');
  assert.equal(audited.winRateEvidence, false);
});

test('duplicate callback-style ordinal cannot manufacture a second root dispatch', () => {
  const f = fixture();
  f.mechanismChecks = [
    {id: 'blower', candidateId: 'challenger',
      action: 'PlayCardAction', detail: 'Field Blower'}
  ];
  const action = {actionOrdinal: 2, action: 'PlayCardAction',
    playerSlot: 0, card: 'Field Blower'};
  const record = f.records[3];
  record.traceSummary.chronologicalActionTrace = [action, {...action}];
  record.traceSummary.chronologicalActionTraceSha256 =
    createHash('sha256')
      .update(JSON.stringify(record.traceSummary.chronologicalActionTrace))
      .digest('hex');
  const audited = auditCampaignQuality(f);
  assert.equal(audited.records[3].traceIntegrity, 'digest-valid');
  assert.equal(audited.records[3].rootDecisionLineageStatus,
    'root-decision-lineage-integrity-mismatch');
  const mechanism = audited.coverage.find(row => row.candidateId === 'challenger')
    .mechanismExposure[0];
  assert.equal(mechanism.observedActions, 0);
  assert.equal(mechanism.laterOpponentRootDispatches, 0);
  assert.equal(mechanism.rootWitnesses.length, 0);
  assert.equal(mechanism.status, 'unknown-incomplete-traces');
  assert.ok(audited.records[3].blockers.includes(
    'root-decision-lineage-integrity-mismatch'));
});

test('root action beyond the true action bound fails closed despite matching digest', () => {
  const f = fixture();
  const record = f.records[3];
  const action = [{actionOrdinal: 12, action: 'AttackAction',
    playerSlot: 0, attack: 'Timeless-GX'}];
  record.traceSummary.chronologicalActionTrace = action;
  record.traceSummary.chronologicalActionTraceSha256 =
    createHash('sha256').update(JSON.stringify(action)).digest('hex');
  const out = auditCampaignQuality(f);
  assert.equal(out.records[3].rootDecisionLineageStatus,
    'root-decision-lineage-integrity-mismatch');
  assert.equal(out.winRateEvidence, false);
});


test('same-turn opponent prompt is not later-turn policy evidence', () => {
  const f = fixture();
  f.mechanismChecks = [{id: 'blower', candidateId: 'challenger',
    action: 'PlayCardAction', detail: 'Field Blower'}];
  const actions = [
    {actionOrdinal: 3, action: 'PlayCardAction', playerSlot: 0,
      card: 'Field Blower', turnBefore: 5},
    {actionOrdinal: 4, action: 'ResolvePromptAction',
      playerSlot: 1, turnBefore: 5}
  ];
  const record = f.records[3];
  record.traceSummary.chronologicalActionTrace = actions;
  record.traceSummary.chronologicalActionTraceSha256 =
    createHash('sha256').update(JSON.stringify(actions)).digest('hex');
  const audited = auditCampaignQuality(f);
  const mechanism = audited.coverage.find(row => row.candidateId === 'challenger')
    .mechanismExposure[0];
  assert.equal(mechanism.observedActions, 1);
  assert.equal(mechanism.laterOpponentRootDispatches, 1);
  assert.equal(mechanism.opponentNextTurnRootDispatches, 0);
  assert.equal(mechanism.rootWitnesses[0].opponentNextTurnRootActionOrdinal, null);
});


test('live Store terminal winner must agree with recorded completed-game winner', () => {
  const f = fixture();
  const record = f.records[0];
  record.winnerIndex = 1;
  record.traceSummary.terminalTransition = {
    evidenceType: 'observed-engine-terminal-transition-v1',
    before: {phase: 2},
    after: {phase: 3, winner: 1, players: [
      {deckRemaining: 3, prizesRemaining: 2},
      {deckRemaining: 5, prizesRemaining: 0}
    ]}
  };
  let out = auditCampaignQuality(f);
  assert.equal(out.records[0].terminalOutcomeStatus,
    'self-consistent-engine-terminal-outcome');
  assert.equal(out.coverage[0].completedTerminalUnboundTrials, 1);
  assert.ok(!out.records[0].blockers.includes('terminal-winner-mismatch'));
  record.winnerIndex = 0;
  out = auditCampaignQuality(f);
  assert.equal(out.records[0].terminalOutcomeStatus,
    'terminal-winner-mismatch');
  assert.ok(out.records[0].blockers.includes('terminal-winner-mismatch'));
  record.winnerIndex = 1;
  record.traceSummary.terminalTransition = {
    evidenceType: 'observed-engine-terminal-transition-v1',
    before: {phase: 3}, after: {phase: 3, winner: 1}
  };
  out = auditCampaignQuality(f);
  assert.equal(out.records[0].terminalOutcomeStatus,
    'terminal-outcome-unavailable');
  assert.equal(out.winRateEvidence, false);
});


test('full root ledger resolves selective-trace silence and identifies next-turn opponent root',()=>{
  const {PROTOCOL}=require('../scripts/aichi-root-action-ledger.cjs');
  const f=fixture();
  f.mechanismChecks=[{id:'blower',candidateId:'challenger',
    rank:6,action:'PlayCardAction',detail:'Field Blower'}];
  for (const record of f.records) {
    const roots=Array.from({length:record.actions},(_,i)=>({
      actionOrdinal:i,action:'AttachEnergyAction',playerSlot:0,
      turnBefore:i<=1?1:i<=7?2:3,
      turnAfter:i===1?2:i===7?3:i<=1?1:i<=7?2:3
    }));
    roots[1]={...roots[1],action:'PassTurnAction'};
    if (record.trialId==='pilot:6:0:challenger:A') {
      roots[4]={...roots[4],action:'PlayCardAction',card:'Field Blower'};
      roots[8]={...roots[8],action:'PlayCardAction',
        card:'Opponent Supporter',playerSlot:1};
    }
    record.traceSummary={
      ...record.traceSummary,rootActionLedgerProtocol:PROTOCOL,
      rootActionLedger:roots,
      rootActionLedgerSha256:createHash('sha256')
        .update(JSON.stringify(roots)).digest('hex'),
      rootActionLedgerCoversEveryStoreDispatch:true,
      coversAllActionsAndPromptResolutions:false
    };
  }
  const out=auditCampaignQuality(f);
  const checked=out.coverage.find(row=>row.candidateId==='challenger');
  assert.equal(checked.rootActionLedgerUnverifiedTrials,0);
  assert.equal(checked.mechanismExposure[0].observedActions,1);
  assert.equal(checked.mechanismExposure[0].completeTraces,2);
  assert.equal(checked.mechanismExposure[0].opponentNextTurnRootDispatches,1);
  assert.equal(checked.mechanismExposure[0].rootWitnesses[0]
    .opponentNextTurnRootActionOrdinal,8);
  assert.equal(out.records[3].rootActionLedgerStatus,
    'complete-root-ledger-self-consistent');
  assert.ok(out.records[3].blockers.includes('not-a-complete-replay'));
  assert.equal(out.winRateEvidence,false);
});


test('copied attack mechanism requires a real selected source printing and root dispatch',()=>{
  const {PROTOCOL}=require('../scripts/aichi-root-action-ledger.cjs');
  const f=fixture();
  const target={
    id:'delegated-poltergeist',candidateId:'challenger',rank:6,
    action:'ResolvePromptAction',detail:'Poltergeist',
    printing:'Gengar & Mimikyu-GX TEU 53',
    initiatingAction:'UseAbilityAction',initiatingDetail:'Perfection'
  };
  f.mechanismChecks=[target];
  for (const record of f.records) {
    const roots=Array.from({length:record.actions},(_,i)=>({
      actionOrdinal:i,
      action:i===1?'PassTurnAction':'AttachEnergyAction',
      playerSlot:0,
      turnBefore:i<=1?1:i<=7?2:3,
      turnAfter:i===1?2:i===7?3:i<=1?1:i<=7?2:3
    }));
    if (record.trialId==='pilot:6:0:challenger:A') {
      roots[3]={...roots[3],action:'UseAbilityAction',ability:'Perfection'};
      roots[4]={...roots[4],action:'ResolvePromptAction',
        pendingPrompt:'ChooseAttackPrompt',
        attackChoice:{printing:target.printing,attackName:target.detail,
          sourceIndex:0,attackIndex:1}};
      roots[8]={...roots[8],playerSlot:1,
        action:'AttackAction',attack:'Shadow Mist'};
    }
    for (let index=0;index<roots.length;index+=1) {
      roots[index].initiatingRootActionOrdinal=
        roots[index].action==='ResolvePromptAction'?3:index;
    }
    record.traceSummary={
      ...record.traceSummary,
      rootActionLedger:roots,rootActionLedgerProtocol:PROTOCOL,
      rootActionLedgerSha256:createHash('sha256')
        .update(JSON.stringify(roots)).digest('hex'),
      rootActionLedgerCoversEveryStoreDispatch:true,
      coversAllActionsAndPromptResolutions:false
    };
  }
  let report=auditCampaignQuality(f);
  const obs=report.coverage.find(row=>row.candidateId==='challenger')
    .mechanismExposure[0];
  assert.equal(obs.status,'observed');
  assert.equal(obs.observedActions,1);
  assert.equal(obs.completeTraces,2);
  assert.equal(obs.rootWitnesses[0].rootActionOrdinal,4);
  assert.equal(obs.rootWitnesses[0].initiatingRootActionOrdinal,3);
  assert.equal(obs.rootWitnesses[0].opponentNextTurnRootActionOrdinal,8);
  assert.equal(obs.printing,target.printing);
  assert.equal(obs.resolvedEffectStatus,'unobserved');
  assert.equal(report.winRateEvidence,false);

  f.mechanismChecks=[{...target,id:'other-print',
    printing:'Different Gengar & Mimikyu-GX printing'}];
  report=auditCampaignQuality(f);
  const other=report.coverage.find(row=>row.candidateId==='challenger')
    .mechanismExposure[0];
  assert.equal(other.status,'verified-no-exposure');
  assert.equal(other.observedActions,0);

  f.mechanismChecks=[{...target,id:'other-origin',
    initiatingDetail:'Underworld Door'}];
  report=auditCampaignQuality(f);
  const otherOrigin=report.coverage.find(row=>row.candidateId==='challenger')
    .mechanismExposure[0];
  assert.equal(otherOrigin.status,'verified-no-exposure');
  assert.equal(otherOrigin.observedActions,0);

  f.mechanismChecks=[{...target,printing:undefined}];
  assert.throws(()=>auditCampaignQuality(f),/mechanism check/);
  f.mechanismChecks=[{...target,initiatingAction:'UseAbilityAction',
    initiatingDetail:undefined}];
  assert.throws(()=>auditCampaignQuality(f),/mechanism check/);
});

test('a selective copied-attack selection can prove a positive only',()=>{
  const f=fixture();
  const target={id:'printed-copy',candidateId:'challenger',
    action:'ResolvePromptAction',detail:'Poltergeist',
    printing:'Gengar & Mimikyu-GX TEU 53'};
  f.mechanismChecks=[target];
  const chosen=[{
    actionOrdinal:4,action:'ResolvePromptAction',playerSlot:0,
    turnBefore:2,turnAfter:3,
    attackChoice:{selection:{printing:target.printing,
      attackName:target.detail}}
  }];
  f.records[3].traceSummary.chronologicalActionTrace=chosen;
  f.records[3].traceSummary.chronologicalActionTraceSha256=
    createHash('sha256').update(JSON.stringify(chosen)).digest('hex');
  let exposure=auditCampaignQuality(f).coverage.find(x=>x.candidateId==='challenger')
    .mechanismExposure[0];
  assert.equal(exposure.observedActions,1);
  assert.equal(exposure.status,'observed');
  assert.equal(exposure.completeTraces,0);
  f.mechanismChecks=[{...target,initiatingAction:'UseAbilityAction',
    initiatingDetail:'Perfection'}];
  exposure=auditCampaignQuality(f).coverage.find(x=>x.candidateId==='challenger')
    .mechanismExposure[0];
  assert.equal(exposure.status,'unknown-incomplete-traces');
  assert.equal(exposure.observedActions,0);
  f.mechanismChecks=[target];
  f.records[3].traceSummary.chronologicalActionTraceSha256='malformed';
  exposure=auditCampaignQuality(f).coverage.find(x=>x.candidateId==='challenger')
    .mechanismExposure[0];
  assert.equal(exposure.status,'unknown-incomplete-traces');
});
