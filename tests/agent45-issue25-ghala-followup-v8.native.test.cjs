'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {runAgent45OwnerTagCallV7}=
  require('../simulation/evaluation/agent45-issue25-owner-tagcall-v7.cjs');
const {runAgent45GuzmaHalaV8,VERSION}=
  require('../simulation/evaluation/agent45-issue25-ghala-followup-v8.cjs');
const {writeReceipt,buildReceipt}=
  require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');
const {compareTagCallPublicRoots}=
  require('../simulation/evaluation/agent45-owner-tagcall-public-difference.cjs');

test('original eight identical native v7/v8 openings, actual after-TagCall G&H payment and public actions',()=>{
  const control=runAgent45OwnerTagCallV7();
  const variant=runAgent45GuzmaHalaV8();
  const v7=new Map(control.diagnostic.selectedNativeAttempts
    .map(row=>[row.id,row]));
  const pairs=variant.diagnostic.selectedNativeAttempts.map(row=>{
    const before=v7.get(row.id);
    return {
      id:row.id,
      sourceSeat:row.sourceSeat,
      v7Status:before?.status??null,
      v8Status:row.status,
      v7Roots:before?.rootCount??null,
      v8Roots:row.rootCount,
      sameSourcePhysicalDeal:Boolean(
        before?.sourcePhysicalDealFingerprint&&
        before.sourcePhysicalDealFingerprint===
          row.sourcePhysicalDealFingerprint),
      sameFullInitialPhysicalDeal:Boolean(
        before?.fullPhysicalDealFingerprint&&
        before.fullPhysicalDealFingerprint===
          row.fullPhysicalDealFingerprint),
      v8SourceAttackCount:row.sourceAttackCount,
      competitiveGameQualified:false
    };
  });
  const native=variant.diagnostic.nativeTagThenHalaAttempts;
  const summary=native.reduce((acc,row)=>{
    const a=row.halaAudit??{};
    acc.tagCallRootsAccepted+=a.printedTagCallRootsAccepted??0;
    acc.tagCallGHPhysicalHandGains+=a.actualGHPhysicalHandGains??0;
    acc.eligibleNativeGHActions+=a.eligibleGHFollowupRoots??0;
    acc.proposedGHActions+=a.proposedGHSupporterRoots??0;
    acc.actualAcceptedGHActions+=a.nativeGHSupporterRootsAccepted??0;
    acc.nativeFreeModeSelections+=a.modeChoiceAccepted?.free??0;
    acc.nativePaidModeSelections+=a.modeChoiceAccepted?.paid??0;
    acc.physicalTwoCardPayments+=a.physicalTwoCardPayments??0;
    acc.nativeOwnDeckGHRetrievals+=a.ownerDeckSearchAccepted??0;
    acc.actualNativePhysicalCardsRetrieved+=a.physicalRetrievedCards??0;
    acc.nativeRejectedOrUnsettled+=a.rejectedNativeProposals??0;
    acc.missingOwnerAudit+=Number(!row.halaAudit);
    return acc;
  },{
    tagCallRootsAccepted:0,tagCallGHPhysicalHandGains:0,
    eligibleNativeGHActions:0,proposedGHActions:0,
    actualAcceptedGHActions:0,
    nativeFreeModeSelections:0,nativePaidModeSelections:0,
    physicalTwoCardPayments:0,nativeOwnDeckGHRetrievals:0,
    actualNativePhysicalCardsRetrieved:0,
    nativeRejectedOrUnsettled:0,missingOwnerAudit:0
  });
  const roots=compareTagCallPublicRoots(
    buildReceipt(control,{
      policyEntryPoint:control.manifest.policyEntryPoint
    }),
    buildReceipt(variant,{
      policyEntryPoint:variant.manifest.policyEntryPoint
    }),
    variant.diagnostic.registered
  );
  const nativeGuzmaHalaPlays=roots.rows.reduce((n,row)=>
    n+row.treatmentSourceActions.guzmaHalaPlayed,0);
  const rootChanges=roots.rows.map(row=>({
    id:row.id,
    firstChange:row.firstPublicActionDifference,
    v7Source:row.controlSourceActions,
    v8Source:row.treatmentSourceActions
  }));
  const archiveDir=process.env.ISSUE25_AGENT45_GHALA_V8_DIR;
  const archives=archiveDir?{
    control:writeReceipt(control,path.join(archiveDir,'control'),{
      prefix:'issue25-steward-v5',
      policyEntryPoint:control.manifest.policyEntryPoint
    }),
    variant:writeReceipt(variant,path.join(archiveDir,'variant'),{
      prefix:'issue25-steward-v5',
      policyEntryPoint:variant.manifest.policyEntryPoint
    })
  }:null;
  const report={
    schema:VERSION,
    pinnedTwinleafCommit:variant.manifest.observedTwinleafGitCommit,
    registeredIds:variant.diagnostic.registered,
    allOriginalSourceDealsMatched:pairs.every(x=>x.sameSourcePhysicalDeal),
    allEntireInitialDealsMatched:pairs.every(x=>
      x.sameFullInitialPhysicalDeal),
    nativeActualTagThenGuzmaHalaSummary:summary,
    actualSourceGuzmaHalaPlayRoots:nativeGuzmaHalaPlays,
    sourcePublicAcceptedRootDifferences:rootChanges,
    fullEightAttemptDisposition:pairs,
    boundedNativeHalaEvents:native.map(x=>({
      matchLabel:x.matchLabel,status:x.status,
      events:x.halaAudit?.boundedEvents??[],
      sourceIndependentBothSeats:true
    })),
    signedOriginalEightNativeReceipts:archives,
    all32OriginalPrintedSourcesAuthenticated:false,
    completePaperClockAndOpponentResponseCertified:false,
    competitivelyQualifiedGames:0,demonstratedWinRate:null
  };
  console.log('AGENT45_ISSUE25_GHALA_FOLLOWUP_V8',JSON.stringify(report));
  assert.equal(pairs.length,8);
  assert.equal(v7.size,8);
  assert.ok(pairs.every(row=>v7.has(row.id)));
  assert.equal(new Set(pairs.map(row=>row.id)).size,8);
  assert.equal(report.allOriginalSourceDealsMatched,true);
  assert.equal(report.allEntireInitialDealsMatched,true);
  assert.equal(native.length,8);
  assert.equal(variant.diagnostic.nativeTagThenHalaMatchCalls,8);
  assert.equal(variant.diagnostic.completeRegisteredAttemptReconciliation,true);
  assert.equal(variant.manifest.releaseQualified,false);
  assert.equal(variant.diagnostic.competitiveGamesQualified,0);
});
