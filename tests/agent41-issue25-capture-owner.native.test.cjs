'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {runDevelopment}=
  require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const {runMirroredIssue25V6}=
  require('../simulation/evaluation/agent1-issue25-mirrored-r6-r11-v6.cjs');
const {withThreePrintedOwnerAttackFrontiers}=
  require('../simulation/evaluation/agent1-issue25-joined-three-attacks-v5.cjs');
const {withOwnerCaptureEnergySearch}=
  require('../simulation/twinleaf/agent41-owner-capture-energy-search.cjs');

/** Same three source-printed ATTACK owners plus a generic Capture prompt only. */
function withCaptureContinuation(next){
  let capture=null;
  const joined=withThreePrintedOwnerAttackFrontiers(()=>{
    const added=withOwnerCaptureEnergySearch(next);
    capture=added.audit;
    return added.result;
  });
  return {result:joined.result,audit:{
    ...joined.audit,ownerCaptureEnergySearch:capture
  }};
}

/**
 * Retrospective native policy interface test on the original frozen v6 eight
 * contexts, unchanged original and candidate sixties, both physical seats.
 * Baseline: Agent18's actual executing two-seat Special Energy option.
 * Treatment: only new owner-deck Capture Energy prompt continuation.
 */
test('frozen v6 both-seat source Capture Energy search follows accepted Energy root',()=>{
  const run=attackLayer=>runMirroredIssue25V6({
    runner:opts=>runDevelopment({...opts,
      bilateralSpecialEnergyRoot:true,nativeAcceptedTargets:true}),
    ...(attackLayer?{attackLayer}:{})
  });
  const control=run(null);
  const treatment=run(withCaptureContinuation);
  const a=control.rawDevelopment.rows;
  const b=treatment.rawDevelopment.rows;
  const byId=new Map(a.map(r=>[r.trial.id,r]));
  const pairs=b.map(row=>{
    const old=byId.get(row.trial.id);
    return {
      id:row.trial.id,
      sameOriginalDeal:old?.sourceDealFingerprint===row.sourceDealFingerprint,
      sameFullDeal:old?.fullPhysicalDealFingerprint===
        row.fullPhysicalDealFingerprint,
      oldDisposition:old.status??'returned',
      newDisposition:row.status??'returned',
      oldAbortType:old.nativeAbortEvidence?.pendingPrompt??null,
      newAbortType:row.nativeAbortEvidence?.pendingPrompt??null,
      oldAcceptedRootCount:old.rootActionLedger?.length??null,
      newAcceptedRootCount:row.rootActionLedger?.length??null
    };
  });
  const capture=treatment.diagnostic.audit?.
    firstBlockedPromptEnvelope?.ownerCaptureEnergySearch??null;
  const packet={
    schema:'agent41-issue25-capture-owner-prompt-native-v1',
    registeredTrialIDs:control.diagnostic.registered,
    treatmentOnly:'ownerCaptureEnergySearch',
    matchedActualOriginalAndFullInitialDeals:pairs.every(row=>
      row.sameOriginalDeal&&row.sameFullDeal),
    bothSeatSourceIndependentSelected:
      control.manifest.actualRunnerConfirmedOption===true&&
      treatment.manifest.actualRunnerConfirmedOption===true,
    captureSearchAudit:capture,
    captureExposureVerdict:!capture?.originalCapturePlayRootAttempts?
      'NO_SELECTED_CAPTURE_PLAY_ROOT':
      !capture.acceptedCaptureAttachments?
        'CAPTURE_ROOT_WITHOUT_PHYSICAL_ATTACHMENT':
        !capture.matchedOwnerDeckPrompts?
          'CAPTURE_ATTACHMENT_WITHOUT_MATCHED_OWNER_SEARCH':
          !capture.acceptedOwnerSearches?
            'CAPTURE_SEARCH_WITHOUT_NATIVE_SETTLEMENT':
            capture.records.some(r=>r.paperEffectVerified)?
              'CAPTURE_SEARCH_SETTLED_WITH_EFFECT':
              'CAPTURE_SEARCH_SETTLED_EFFECT_UNVERIFIED',
    pairs,paperGamesQualified:0,competitiveGamesQualified:0
  };
  console.log('AGENT41_CAPTURE_OWNER_V6',JSON.stringify(packet));
  // Public native roots only. Preserve the post-search owner/opponent
  // continuation without exporting concealed card identities or hands.
  const rescued=b.find(row=>
    row.trial.id==='6:100:A:new-moon-lockbreaker-v1');
  const publicRoots=(rescued?.rootActionLedger??[]).filter(row=>
    Number.isSafeInteger(row.turnBefore)&&row.turnBefore>=8&&
    row.turnBefore<=11).slice(0,32).map(row=>({
      ordinal:row.actionOrdinal,turn:row.turnBefore,
      seat:row.playerSlot,action:row.action,
      card:row.card??null,attack:row.attack??null,
      pendingPrompt:row.pendingPrompt??null
    }));
  console.log('AGENT41_CAPTURE_POST_SEARCH_PUBLIC_ROOTS',
    JSON.stringify({
      schema:'agent41-capture-post-search-public-continuation-v1',
      registeredTrialId:rescued?.trial?.id??null,
      sourceSeat:rescued?.sourceSeat??null,
      availableRootActions:rescued?.rootActionLedger?.length??null,
      sourceAttackSettlements:
        rescued?.sourceAttackSettlement?.attacks?.length??null,
      redactedTurn8To11Roots:publicRoots,
      truncated:publicRoots.length===32,
      competitiveGamesQualified:0
    }));
  assert.equal(a.length,8);
  assert.equal(b.length,8);
  assert.equal(byId.size,8);
  assert.equal(new Set(b.map(r=>r.trial.id)).size,8);
  assert.ok(pairs.every(row=>row.sameOriginalDeal&&row.sameFullDeal));
  assert.equal(packet.bothSeatSourceIndependentSelected,true);
  assert.ok(capture,'Actual running wrapper must expose owner-Capture audit');
  // Zero selected original-source Capture roots is a registered negative
  // opportunity observation, never a failed physical prompt response.
  if(capture.originalCapturePlayRootAttempts===0){
    assert.equal(packet.captureExposureVerdict,'NO_SELECTED_CAPTURE_PLAY_ROOT');
    assert.equal(capture.acceptedCaptureAttachments,0);
    assert.equal(capture.matchedOwnerDeckPrompts,0);
    assert.equal(capture.acceptedOwnerSearches,0);
    assert.equal(treatment.manifest.releaseQualified,false);
    assert.equal(packet.competitiveGamesQualified,0);
    return;
  }
  assert.ok(capture.acceptedCaptureAttachments>=1);
  assert.ok(capture.matchedOwnerDeckPrompts>=1,
    'Genuine Capture attachment must yield a recognizable owner-deck prompt');
  assert.ok(capture.acceptedOwnerSearches>=1,
    'Owner-deck search must actually resolve through native Store');
  assert.ok(capture.records.some(x=>x.nativePromptSettled&&
    x.paperEffectVerified&&
    (x.kind==='empty-valid-search'||x.physicalDeckToBenchVerified)),
    'Native Capture search requires settled prompt and supported physical effect');
  assert.equal(treatment.manifest.releaseQualified,false);
  assert.equal(packet.competitiveGamesQualified,0);
});
