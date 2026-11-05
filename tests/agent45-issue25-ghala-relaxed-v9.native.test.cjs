'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {runAgent45GuzmaHalaV8}=
  require('../simulation/evaluation/agent45-issue25-ghala-followup-v8.cjs');
const {runAgent45GuzmaHalaRelaxedV9,VERSION}=
  require('../simulation/evaluation/agent45-issue25-ghala-relaxed-v9.cjs');
const {writeReceipt,buildReceipt}=
  require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');
const {compareTagCallPublicRoots}=
  require('../simulation/evaluation/agent45-owner-tagcall-public-difference.cjs');

test('exact eight native G&H v8 strict versus v9 physical-payability stress with same source openings',()=>{
  const baseline=runAgent45GuzmaHalaV8();
  const variant=runAgent45GuzmaHalaRelaxedV9();
  const originals=new Map(baseline.diagnostic.selectedNativeAttempts
    .map(a=>[a.id,a]));
  const pairs=variant.diagnostic.selectedNativeAttempts.map(row=>{
    const a=originals.get(row.id);
    return {
      id:row.id,
      sourceSeat:row.sourceSeat,
      strictStatus:a?.status??null,
      relaxedStatus:row.status,
      strictRoots:a?.rootCount??null,
      relaxedRoots:row.rootCount,
      fullDealParity:Boolean(a?.fullPhysicalDealFingerprint&&
        a.fullPhysicalDealFingerprint===row.fullPhysicalDealFingerprint),
      originalSourceDealParity:Boolean(a?.sourcePhysicalDealFingerprint&&
        a.sourcePhysicalDealFingerprint===
          row.sourcePhysicalDealFingerprint),
      sourceAttackCount:row.sourceAttackCount,
      competitiveGameQualified:false
    };
  });
  const live=variant.diagnostic.nativeTagThenHalaAttempts;
  const sample=live.map(row=>{
    const a=row.halaAudit??{};
    return {
      nativeMatchLabel:row.matchLabel,
      status:row.status,
      actualAcceptedTagCallRoots:a.printedTagCallRootsAccepted??0,
      physicalGuzmaHalaHandGains:a.actualGHPhysicalHandGains??0,
      actualAcceptedSupporterRoots:a.nativeGHSupporterRootsAccepted??0,
      actualFreeModeSelections:a.modeChoiceAccepted?.free??0,
      actualPaidModeSelections:a.modeChoiceAccepted?.paid??0,
      physicalTwoOtherCardPayments:a.physicalTwoCardPayments??0,
      realOwnerDeckSearchSettlements:a.ownerDeckSearchAccepted??0,
      physicalCardsMovedIntoOwnerHand:a.physicalRetrievedCards??0,
      publicPaymentCostWitnesses:(a.boundedEvents??[])
        .filter(x=>x.kind==='two-card-physical-payment')
        .map(x=>({
          sourceSeat:x.seat,globalTurn:x.globalTurn,
          physicallyDiscardedOrLostZonePrintings:
            x.publiclySettledDiscardPrintings
        })),
      nativeRejectedProposals:a.rejectedNativeProposals??0,
      auditAvailable:Boolean(row.halaAudit),
      competitiveGameQualified:false
    };
  });
  const total=key=>sample.reduce((n,row)=>n+row[key],0);
  const rawComparison=compareTagCallPublicRoots(
    buildReceipt(baseline,{
      policyEntryPoint:baseline.manifest.policyEntryPoint
    }),
    buildReceipt(variant,{
      policyEntryPoint:variant.manifest.policyEntryPoint
    }),
    variant.diagnostic.registered
  );
  const publicSourceGuzmaHalaPlays=rawComparison.rows.reduce((n,row)=>
    n+row.treatmentSourceActions.guzmaHalaPlayed,0);
  const folder=process.env.ISSUE25_AGENT45_GHALA_V9_DIR;
  const archive=folder?{
    control:writeReceipt(baseline,path.join(folder,'strict'),{
      prefix:'issue25-steward-v5',
      policyEntryPoint:baseline.manifest.policyEntryPoint
    }),
    variant:writeReceipt(variant,path.join(folder,'relaxed'),{
      prefix:'issue25-steward-v5',
      policyEntryPoint:variant.manifest.policyEntryPoint
    })
  }:null;
  const receipt={
    schema:VERSION,
    originalFrozenAttemptIds:variant.diagnostic.registered,
    originalSourceDealsAllMatched:pairs.every(x=>x.originalSourceDealParity),
    entireInitialPhysicalDealsAllMatched:pairs.every(x=>x.fullDealParity),
    actualReturnedAttempts:pairs.length,
    actualSourcePublicGuzmaHalaPlayRoots:publicSourceGuzmaHalaPlays,
    observed:{
      genuineTagCallRoots:total('actualAcceptedTagCallRoots'),
      physicalGuzmaHalaHandGains:total('physicalGuzmaHalaHandGains'),
      acceptedGuzmaHalaSupporterRoots:total('actualAcceptedSupporterRoots'),
      freeModeSelections:total('actualFreeModeSelections'),
      paidModeSelections:total('actualPaidModeSelections'),
      physicallyVerifiedTwoOtherCardPayments:
        total('physicalTwoOtherCardPayments'),
      realGuzmaHalaOwnerDeckSearchSettlements:
        total('realOwnerDeckSearchSettlements'),
      physicallyMovedOwnerDeckToHandCards:
        total('physicalCardsMovedIntoOwnerHand'),
      nativeRejectedGuzmaHalaProposals:total('nativeRejectedProposals')
    },
    perArmActualOwnerPaymentAndNativeOutcome:sample,
    perArmDispositions:pairs,
    completePublicRootFirstDifferences:rawComparison.rows.map(r=>({
      id:r.id,firstDifference:r.firstPublicActionDifference,
      controlSource:r.controlSourceActions,
      treatmentSource:r.treatmentSourceActions
    })),
    completeNativeReceiptsWithLockedSha256:archive,
    relaxedPaymentStrategicallyOptimal:false,
    completePaperGameOrOpponentReplyQualified:false,
    qualifiedCompetitiveGames:0,
    inferredCompetitiveWinRate:null
  };
  console.log('AGENT45_ISSUE25_RELAXED_GHALA_V9',JSON.stringify(receipt));
  assert.equal(pairs.length,8);
  assert.equal(originals.size,8);
  assert.equal(new Set(pairs.map(x=>x.id)).size,8);
  assert.equal(receipt.originalSourceDealsAllMatched,true);
  assert.equal(receipt.entireInitialPhysicalDealsAllMatched,true);
  assert.equal(live.length,8);
  assert.equal(variant.diagnostic.nativeTagThenHalaMatchCalls,8);
  assert.equal(variant.diagnostic.completeRegisteredAttemptReconciliation,true);
  assert.equal(variant.diagnostic.competitiveGamesQualified,0);
  assert.equal(variant.manifest.releaseQualified,false);
});
