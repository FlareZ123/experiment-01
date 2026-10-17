'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {compareFrozenPolicyArchives} = require('../scripts/aichi-frozen-policy-compare.cjs');
/** @param {unknown} v */
const sha = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');

/** @param {boolean} enabled */
function sample(enabled) {
  const trace = [{actionOrdinal:1, action:'PassTurnAction',turnBefore:6}];
  return {
    purpose:'engine-and-policy-diagnostic-only',
    strengthClaimPermitted:false,engineAndPolicyQualified:false,
    planDigest:'plan',fieldDigest:'field',campaignSchemaVersion:3,
    seedProtocol:'decorrelated-slots-v3',
    candidateRows:[{id:'temple',deckDigest:'deck'}],
    fieldCoverage:[{rank:10}],selectedPilotRanks:[10],
    maxActions:600,totalScheduled:1,
    researchPolicyProfile:'fixed-core-v1',
    policyFlags:{shadowRiderOpeningPivot:enabled,other:false},
    researchRevision:enabled?'r2':'r1',
    records:[{
      trialId:'pilot:10:0:temple:A',candidateId:'temple',
      candidateDigest:'deck',opponentDigest:'regidrago',opponentRank:10,
      candidateEngineSlot:'A',seed:3162592764,candidateActualTurn:'second',
      candidateAttacks:0,opponentAttacks:7,
      turnEvidence:{firstTurnSlot:1,verifiedByDrawLog:true},
      traceSummary:{chronologicalActionTrace:trace,
        chronologicalActionTraceSha256:sha(trace),
        coversAllActionsAndPromptResolutions:false,
        terminalTransition:{after:{players:[
          {deckRemaining:19,prizesRemaining:6},
          {deckRemaining:17,prizesRemaining:0}
        ]}}}
    }]
  };
}

test('same source campaign captured action is identical under one policy switch',()=>{
  const r=compareFrozenPolicyArchives(sample(false),sample(true),
    'shadowRiderOpeningPivot');
  assert.equal(r.comparedTrials,1);
  assert.equal(r.identicalCapturedTraceTrials,1);
  assert.equal(r.allCapturedTracesIdentical,true);
  assert.equal(r.fullReplayCaptured,false);
  assert.equal(r.gameStrengthClaimPermitted,false);
});
test('changes to a captured action are detected',()=>{
  const before=sample(false),after=sample(true);
  const trace=after.records[0].traceSummary.chronologicalActionTrace;
  trace[0].action='AttackAction';
  after.records[0].traceSummary.chronologicalActionTraceSha256=sha(trace);
  assert.equal(compareFrozenPolicyArchives(before,after,
    'shadowRiderOpeningPivot').identicalCapturedTraceTrials,0);
});
test('mismatched sources, RNG and other flags are rejected',()=>{
  const before=sample(false),after=sample(true);
  after.records[0].seed=77;
  assert.throws(()=>compareFrozenPolicyArchives(before,after,
    'shadowRiderOpeningPivot'),/resource drift/);
  after.records[0].seed=3162592764;
  after.policyFlags.other=true;
  assert.throws(()=>compareFrozenPolicyArchives(before,after,
    'shadowRiderOpeningPivot'),/More than one/);
});

test('source changes do not prove isolated policy effects', () => {
  const report = compareFrozenPolicyArchives(sample(false), sample(true), 'shadowRiderOpeningPivot');
  assert.equal(report.controlledRevisionDiagnostic, false);
  assert.ok(report.provenanceGaps.includes('research-revision-unpinned-or-drifted'));
  assert.ok(report.provenanceGaps.includes('engine-revision-unpinned-or-drifted'));
});

test('equal full revisions and source echoes meet the bounded provenance gate', () => {
  const before = sample(false), after = sample(true);
  for (const row of [before, after]) {
    row.researchRevision = 'a'.repeat(40);
    row.expectedEngineRevision = 'twinleafgg/' + 'b'.repeat(40);
    row.records[0].engineRevision = row.expectedEngineRevision;
    row.records[0].traceSummary.coversAllActionsAndPromptResolutions = true;
  }
  const report = compareFrozenPolicyArchives(before, after, 'shadowRiderOpeningPivot');
  assert.deepEqual(report.provenanceGaps, []);
  assert.equal(report.controlledRevisionDiagnostic, true);
  assert.equal(report.gameStrengthClaimPermitted, false);
});

test('absent terminal evidence and suspect starting turn cannot appear identical', () => {
  const before = sample(false), after = sample(true);
  before.records[0].turnEvidence.verifiedByDrawLog = false;
  delete before.records[0].traceSummary.terminalTransition;
  delete after.records[0].traceSummary.terminalTransition;
  const report = compareFrozenPolicyArchives(before, after, 'shadowRiderOpeningPivot');
  assert.equal(report.allActualTurnOrdersIdentical, false);
  assert.equal(report.allTerminalTransitionsIdentical, false);
  assert.equal(report.rows[0].terminalEvidenceAvailable, false);
});
