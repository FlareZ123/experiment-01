'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const test=require('node:test');
const {runStewardInnermostPrizeV5}=
  require('../simulation/evaluation/agent36-issue25-steward-innermost-prize-v5.cjs');
const {runAgent45OwnerTagCallV7,VERSION}=
  require('../simulation/evaluation/agent45-issue25-owner-tagcall-v7.cjs');
const {writeReceipt}=
  require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

function summarizeOwnerTagCall(entry){
  const audit=entry.ownerTagCallAudit;
  const seats=[0,1].map(seat=>{
    const owner=audit?.ownerBySeat?.[seat]??{};
    return {
      seat,heldTagRoots:owner.heldTagRoots??0,
      nativeEligibleRoots:owner.eligibleRoots??0,
      actualNativeAcceptedItemRoots:owner.acceptedRoots??0,
      actualNativeAcceptedGHPrompts:owner.acceptedGHDeckPrompts??0,
      physicalGHHandGained:owner.physicalGHHandGained??0,
      rejectedItemRoots:owner.storeRejectedRoots??0,
      rejectedSearchPrompts:owner.storeRejectedPrompts??0
    };
  });
  return {
    nativeMatchLabel:entry.nativeMatchLabel,
    wrapperStatus:entry.status,
    ownerAudited:Boolean(audit),
    seats,
    totalOwnerNativeErrors:audit?.nativeErrors?.length??null,
    wholeGameQualified:false
  };
}

test('same original eight paired v5 owner Tag Call treatment with all error/cap dispositions',()=>{
  const control=runStewardInnermostPrizeV5();
  const treatment=runAgent45OwnerTagCallV7();
  const baselines=new Map(control.diagnostic.selectedNativeAttempts
    .map(row=>[row.id,row]));
  const attempts=treatment.diagnostic.selectedNativeAttempts;
  const pairs=attempts.map(row=>{
    const before=baselines.get(row.id);
    return {
      id:row.id,
      sourceSeat:row.sourceSeat,
      v5Status:before?.status??null,
      ownerTagCallStatus:row.status,
      controlNativeRoots:before?.rootCount??null,
      treatmentNativeRoots:row.rootCount,
      sameOriginalSourcePhysicalDeal:Boolean(
        before?.sourcePhysicalDealFingerprint&&
        before.sourcePhysicalDealFingerprint===
        row.sourcePhysicalDealFingerprint),
      sameEntireInitialPhysicalDeal:Boolean(
        before?.fullPhysicalDealFingerprint&&
        before.fullPhysicalDealFingerprint===
        row.fullPhysicalDealFingerprint),
      sourceAttackSettlementCount:row.sourceAttackCount,
      competitiveMatchQualified:false
    };
  });
  const actual=treatment.diagnostic.nativeOwnerTagCallAudits;
  const selected=actual.map(summarizeOwnerTagCall);
  const total=(key)=>selected.reduce((n,row)=>
    n+row.seats.reduce((k,seat)=>k+seat[key],0),0);
  const summary={
    actualRegisteredNativeMatchCalls:actual.length,
    actualHeldTagRoots:total('heldTagRoots'),
    actualNativeEligibleTagRoots:total('nativeEligibleRoots'),
    actualNativeAcceptedItemRoots:total('actualNativeAcceptedItemRoots'),
    actualNativeAcceptedGHPrompts:total('actualNativeAcceptedGHPrompts'),
    actualPhysicalGuzmaHalaHandGains:total('physicalGHHandGained'),
    nativeRejectedItemRoots:total('rejectedItemRoots'),
    nativeRejectedSearchPrompts:total('rejectedSearchPrompts'),
    errorsWithOwnerAudit:actual.filter(row=>
      row.status!=='returned-unqualified'&&
      row.ownerTagCallAudit!==null).length,
    sourceNativeAttackSettlements:pairs.reduce((n,row)=>
      n+(row.sourceAttackSettlementCount??0),0)
  };
  const base=process.env.ISSUE25_AGENT45_TAGCALL_V7_DIR;
  const lockedArchives=base?{
    control:writeReceipt(control,path.join(base,'control'),{
      prefix:'issue25-steward-v5',
      policyEntryPoint:control.manifest.policyEntryPoint
    }),
    treatment:writeReceipt(treatment,path.join(base,'treatment'),{
      prefix:'issue25-steward-v5',
      policyEntryPoint:treatment.manifest.policyEntryPoint
    })
  }:null;
  const report={
    schema:VERSION,
    observedRepositoryRevision:process.env.GITHUB_SHA??null,
    observedTwinleafRevision:treatment.manifest.observedTwinleafGitCommit,
    exactRegisteredIDs:treatment.diagnostic.registered,
    actualAllEightInitialSourceDealsIdentical:pairs.every(row=>
      row.sameOriginalSourcePhysicalDeal),
    actualAllEightEntireInitialDealsIdentical:pairs.every(row=>
      row.sameEntireInitialPhysicalDeal),
    actualNativeOwnerTagCallSummary:summary,
    individualBothSeatOwnerAudits:selected,
    pairedNativeRootOutcomes:pairs,
    lockedAllEightControlTreatmentArchives:lockedArchives,
    sourcePolicyCausalPreferenceCertified:false,
    sourceAttacksPayableOrDominantNotEstablished:true,
    entireFieldQualified:false,
    qualifiedCompetitiveGames:0,
    demonstratedWinRate:null
  };
  console.log('AGENT45_ISSUE25_OWNER_TAGCALL_V7',JSON.stringify(report));
  assert.equal(control.diagnostic.selectedNativeAttempts.length,8);
  assert.equal(attempts.length,8);
  assert.equal(baselines.size,8);
  assert.equal(new Set(pairs.map(row=>row.id)).size,8);
  assert.ok(pairs.every(row=>baselines.has(row.id)));
  assert.equal(report.actualAllEightInitialSourceDealsIdentical,true);
  assert.equal(report.actualAllEightEntireInitialDealsIdentical,true);
  assert.equal(actual.length,8);
  assert.equal(treatment.diagnostic.nativeOwnerTagCallMatchCalls,8);
  assert.equal(treatment.diagnostic.completeRegisteredAttemptReconciliation,true);
  assert.equal(treatment.manifest.releaseQualified,false);
  assert.equal(treatment.diagnostic.competitiveGamesQualified,0);
});
