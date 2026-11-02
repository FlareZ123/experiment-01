'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {preflight,gitBlobSha}=require('./agent15-rank31-v10-natural-paired-development.cjs');

const ROOT=path.resolve(__dirname,'../..');
const DIAGNOSTIC='results/aichi-2026/registrations/agent15-rank31-roxie-held-supporter-retrospective-20261102.json';
const DIAGNOSTIC_BLOB='4c8c59e574a5603375e9a6cc908f0fadc9d3f237';

/** @returns {object} */
function registeredDiagnostic(){
  const bytes=fs.readFileSync(path.join(ROOT,DIAGNOSTIC));
  assert.equal(gitBlobSha(bytes),DIAGNOSTIC_BLOB);
  const d=JSON.parse(bytes.toString('utf8'));
  const p=preflight();
  assert.equal(d.priorSourceTrialRegistrationGitBlob,
    'b0a3859fe16e8bd9bee54af57a95ba4401a09f69');
  assert.equal(d.priorSourceTrialEffectiveAmendmentGitBlob,
    '7cdf9be1eab951568560e0535d39cf25e722fcae');
  assert.equal(d.sourceRank,31);
  assert.equal(d.enginePin,p.registration.enginePin);
  assert.deepEqual(d.originalSeeds,p.registration.seeds);
  assert.equal(d.priorNativeRun,41395836041);
  assert.equal(d.nativeAttempts,8);
  return {d,p};
}
/** @param {object} row */
function sourceOwnerSupporterReceipt(row){
  const audit=row.ownerSupporterOpportunityAudit??
    row.ownerSupporterOpportunityAbortEvidence??null;
  const sourceSeat=row.sourceSeat;
  if(!audit)return {
    sourceSeat,auditPresent:false,
    sourceNativePaperSupporterQualified:false
  };
  const roots=(audit.firstRoots??[]).filter(x=>x.ownerSeat===sourceSeat);
  const passes=(audit.passes??[]).filter(x=>x.ownerSeat===sourceSeat);
  const sourceSupporters=(audit.supporterRoots??[])
    .filter(x=>x.seat===sourceSeat);
  const hasRoxie=x=>x.supporters?.some(p=>
    p.printing==='Roxie CEC')===true;
  const enginePositiveRoxie=x=>x.supporters?.some(p=>
    p.printing==='Roxie CEC'&&p.nativeNullCanPlay==='true')===true;
  const trimmed=x=>({
    ownerTurn:x.turn,ownerSeat:x.ownerSeat,action:x.action,
    heldSupporters:x.supporters,rootDispatchOrdinal:x.rootDispatchOrdinal,
    supporterQuota:x.supporterQuota,ownerSupporterLock:x.ownerSupporterLock,
    firstGlobalTurn:x.firstGlobalTurn,publicGuzmaGeometry:x.publicGuzmaGeometry
  });
  return {
    sourceSeat,auditPresent:true,observedLiveStore:audit.observedLiveStore,
    sourceFirstOwnerTurns:roots.length,
    sourceAcceptedPassTurns:passes.length,
    sourceFirstOwnerTurnsHoldingRoxie:roots.filter(hasRoxie).length,
    sourcePassTurnsHoldingRoxie:passes.filter(hasRoxie).length,
    sourcePassTurnsWithNativeNullTrueRoxie:
      passes.filter(enginePositiveRoxie).length,
    sourceAcceptedSupporterRoots:sourceSupporters.length,
    sourceAcceptedSupporters:sourceSupporters,
    sourceFirstRootRoxieSamples:roots.filter(hasRoxie).map(trimmed),
    sourcePassRoxieSamples:passes.filter(hasRoxie).map(trimmed),
    nativeNullCanPlayOnlyEngineEvidence:true,
    sourceNativePaperSupporterQualified:false,
    truncatedOwnerTurns:(audit.firstRootsTruncated??0)>0,
    truncatedPasses:(audit.passesTruncated??0)>0
  };
}
/** @returns {object} */
function run(){
  const {d,p}=registeredDiagnostic();
  const fixed={...p.registration.fixedOptions,
    ...p.amendment.effectiveOverrides,
    registeredTrials:p.registration.trials,
    registeredFrameName:p.registration.schema,
    allowAdditionalOriginalSourceRanks:true,
    sharedPaperPaymentPortfolio:true};
  const control=runDevelopment({...fixed,nativeOwnerSupporterOpportunity:false});
  const observed=runDevelopment({...fixed,nativeOwnerSupporterOpportunity:true});
  assert.equal(control.rows.length,4);
  assert.equal(observed.rows.length,4);
  const cById=new Map(control.rows.map(x=>[x.trial.id,x]));
  const oById=new Map(observed.rows.map(x=>[x.trial.id,x]));
  const pairs=p.registration.trials.map(t=>{
    const c=cById.get(t.id),o=oById.get(t.id);
    assert.ok(c&&o);
    const setupCertified=c.nativeSetupCoinChoiceReceipt?.status===
      'consistent-accepted-native-setup-and-first-draw'&&
      o.nativeSetupCoinChoiceReceipt?.status===
      'consistent-accepted-native-setup-and-first-draw';
    const fullDealMatch=typeof c.fullPhysicalDealFingerprint==='string'&&
      typeof o.fullPhysicalDealFingerprint==='string'?
      c.fullPhysicalDealFingerprint===o.fullPhysicalDealFingerprint:null;
    const sourceDealMatch=typeof c.sourceDealFingerprint==='string'&&
      typeof o.sourceDealFingerprint==='string'?
      c.sourceDealFingerprint===o.sourceDealFingerprint:null;
    const rootLedgerMatch=typeof c.rootActionLedgerSha256==='string'&&
      typeof o.rootActionLedgerSha256==='string'?
      c.rootActionLedgerSha256===o.rootActionLedgerSha256:null;
    const outcomeMatch=c.finished===o.finished&&
      c.winner===o.winner&&c.endReason===o.endReason;
    return {
      id:t.id,sourceRank:31,seat:t.candidateSlot,seed:t.seed,
      nativeSetupCertifiedBoth:setupCertified,
      fullPhysicalDealMatch:fullDealMatch,
      sourcePhysicalDealMatch:sourceDealMatch,
      rootLedgerMatch,outcomeMatch,
      observerNoninterfering:setupCertified&&fullDealMatch===true&&
        sourceDealMatch===true&&rootLedgerMatch===true&&outcomeMatch,
      sourceOwnerSupporter:sourceOwnerSupporterReceipt(o)
    };
  });
  return {
    schema:'agent15-rank31-owner-roxie-retrospective-Store-root-audit-v1',
    diagnosticRegisteredBlob:DIAGNOSTIC_BLOB,
    originalPreregisteredBlob:d.priorSourceTrialRegistrationGitBlob,
    pinnedSourceRank:31,enginePin:d.enginePin,
    priorKnownZeroRoxieRoots:true,
    retrospectiveSameSeedsNotIndependent:true,
    attempted:8,observedPairedGames:4,
    observerNoninterferingAllArms:pairs.every(p=>p.observerNoninterfering),
    pairs,control,observed,
    competitiveQualifiedGames:0,
    caveat:'Read-only postgame owner private hand exposure and bounded native canPlay(null). Source characteristic Supporter selection and paper legality remain unverified. Retrospective replay cannot estimate win rate.'
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={DIAGNOSTIC,DIAGNOSTIC_BLOB,registeredDiagnostic,
  sourceOwnerSupporterReceipt,run};
