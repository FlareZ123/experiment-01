'use strict';

const assert = require('node:assert/strict');
const {preflight} =
  require('./agent31-rank1-prospective-basic-recipient-pair.cjs');
const {prereg} =
  require('./agent31-crossrank5-11-floatstone-transfer.cjs');
const {runDevelopment} =
  require('./agent41-bilateral-v2-development.cjs');
const {save} =
  require('./agent43-guzma-original-source-pair.cjs');
const {installUnderworldDoorPsychicRecipientHook} =
  require('../twinleaf/underworld-door-psychic-recipient-hook.cjs');

const VERSION = 'agent31-allowner-pass-known-seed-native-retrospective-v1';
const ID = '11:3:B:champion-reference';
const EXPECTED = Object.freeze({
  rootActionLedgerSha256:
    '6dea2dca172a2740b0bf9f3e274d1b0272acf02a0e7ebfddc55b78ce61db0769',
  sourceDealFingerprint:
    'de60debedfc78872cdc2fa8ee85ce8d565ca941d1717246c75e84900b0354c1c',
  fullPhysicalDealFingerprint:
    '2aa46c91895e7c08cb40309356d8fe2601a0515137dba1100986f61ab5dacbf6',
  candidatePassRoots:0
});

/**
 * Retrospective observer only. Reuses two originally registered candidate
 * arms on the same original source deal to meet the shared runner's exact
 * two-candidate registration invariant. No new seed is claimed as held out.
 * Old decision policy and both 60-card decks are unchanged.
 * @returns {object}
 */
function run() {
  const reg = prereg(), prior = preflight();
  const selected = reg.trials.filter(trial =>
    trial.id.startsWith('11:3:B:'));
  assert.equal(selected.length,2);
  assert.ok(selected.some(trial => trial.id === ID));
  const previous = process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const undo=installUnderworldDoorPsychicRecipientHook();
  let full;
  try {
    full=runDevelopment({
      ...prior.registration.frozenCommonPolicy,
      registeredTrials:selected,
      registeredFrameName:VERSION,
      bilateralBasicEnergyRecipientFrontier:true,
      actorUnderworldDoorPromptOwner:true,
      actorUnderworldDoorRoot:true,
      actorFundedShadowRiderFloatStoneRoot:false,
      nativeAllOwnerPassFrontier:true
    });
  }finally{
    undo();
    if(previous===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=previous;
  }
  assert.equal(full.rows.length,2);
  const selectedRow=full.rows.find(row=>row.trial.id===ID);
  assert.ok(selectedRow);
  const audit=selectedRow.nativeAllOwnerPassFrontier;
  assert.ok(audit?.completeNativePassCoverage);
  const rootCount=selectedRow.rootActionLedger.filter(root=>
    root.action==='PassTurnAction').length;
  assert.equal(audit.observedOwnerPassRoots,rootCount);
  const candidatePasses=selectedRow.rootActionLedger.filter(root=>
    root.action==='PassTurnAction'&&root.playerSlot===selectedRow.candidateSeat).length;
  assert.equal(audit.counts.candidate.passes,candidatePasses);
  const observed={
    rootActionLedgerSha256:selectedRow.rootActionLedgerSha256,
    sourceDealFingerprint:selectedRow.sourceDealFingerprint,
    fullPhysicalDealFingerprint:selectedRow.fullPhysicalDealFingerprint,
    candidatePassRoots:candidatePasses
  };
  const oldSameDeal = observed.sourceDealFingerprint===EXPECTED.sourceDealFingerprint &&
    observed.fullPhysicalDealFingerprint===EXPECTED.fullPhysicalDealFingerprint;
  const oldSameRoots =
    observed.rootActionLedgerSha256===EXPECTED.rootActionLedgerSha256;
  const missed= audit.receipts.filter(r=>
    r.role==='candidate'&&r.visibleFundedVmax!==null);
  const first=missed[0]??null;
  return {
    version:VERSION, retrospectiveKnownPositive:true,
    originalPreregisteredTrial:ID,
    registeredBeforeOriginalNativeOutcomes:reg.registeredBeforeNativeResults,
    expectedHistorical:{...EXPECTED},
    observed,oldSameDeal,oldSameRoots,
    actualOwnerPassCoverageExact:true,
    candidatePassesWithVisibleFundedVmax:missed.length,
    firstOpportunityRoot:first?.actionOrdinal??null,
    originalSourceSixtyAndCandidateSixtiesUnchanged:true,
    native:full, paperCompetitivelyQualifiedGames:0,
    qualification:'Retrospective native observer, not a new game-strength trial'
  };
}

if(require.main===module){
  const result=run();
  if(process.env.AGENT31_ALL_OWNER_PASS_RECEIPT){
    save(process.env.AGENT31_ALL_OWNER_PASS_RECEIPT,result);
  }
  process.stdout.write('AGENT31_ALL_OWNER_NATIVE '+JSON.stringify({
    version:result.version,observed:result.observed,
    oldSameDeal:result.oldSameDeal,oldSameRoots:result.oldSameRoots,
    candidatePassesWithVisibleFundedVmax:
      result.candidatePassesWithVisibleFundedVmax,
    firstOpportunityRoot:result.firstOpportunityRoot,
    paperCompetitivelyQualifiedGames:0
  })+'\n');
  assert.equal(result.oldSameDeal,true,'original registered source/physical deal changed');
  assert.equal(result.oldSameRoots,true,'native decision policy drift from archived baseline');
  assert.equal(result.firstOpportunityRoot,137);
  assert.ok(result.candidatePassesWithVisibleFundedVmax>=9);
}
module.exports={VERSION,ID,EXPECTED,run};
