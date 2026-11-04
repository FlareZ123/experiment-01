'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');

const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
const {runMatch}=require('../simulation/twinleaf/headless.cjs');
const {withOwnerSetupConfirm}=
  require('../simulation/twinleaf/agent4-owner-setup-confirm.cjs');
const {withOwnerProtectedMultiBasicStore}=
  require('../simulation/twinleaf/agent50-owner-protected-multibasic-store.cjs');
const {withOwnerOpeningStoreReceipt}=
  require('../simulation/twinleaf/agent50-owner-opening-store-receipt.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('../simulation/evaluation/agent7-canonical-actor-composition.cjs');
const {CODE,withNativeRawStateFallbackQuarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

const plan=planAichi(1,{
  allowEquivalentBasicEnergies:true,
  allowBasicEnergyMirrorPrintings:true,
  allowJapanesePromoHooks:true
});
const source=plan.opponents.find(x=>x.rank===4);
assert.equal(source?.status,'ready');
assert.equal(plan.engineRevision,
  'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');

const fixtures=[
  {seat:0,seed:20261123,selected:['Gengar & Mimikyu-GX TEU'],
    held:['Tapu Lele-GX GRI','Dedenne GX UNB']},
  {seat:1,seed:20261125,selected:[
    'Squawkabilly ex PAL','Ditto Prism Star LOT'],
    held:['Eldegoss V RCL','Dedenne GX UNB']},
  {seat:1,seed:20261129,selected:[
    'Gengar & Mimikyu-GX TEU','Voltorb ROS'],
    held:['Crobat V DAA','Dedenne GX UNB']}
];

for(const fixture of fixtures){
  test('native source rank4 owner multibasic entry preservation seat '+
      fixture.seat+' seed '+fixture.seed,()=>{
    const {seat,seed}=fixture;
    let error=null;
    try{
      withNativeRawStateFallbackQuarantine(()=>withOwnerSetupConfirm(()=>
        withOwnerProtectedMultiBasicStore(()=>
          withOwnerOpeningStoreReceipt(()=>
            withCanonicalActorOnlyPolicy(()=>runMatch({
              deckA:seat===0?source.cards:plan.candidate.cards,
              deckB:seat===1?source.cards:plan.candidate.cards,
              seed,maxActions:80,captureNativeAbortEvidence:true
            })),{sourceSeat:seat}))));
    }catch(e){error=e;}
    assert.ok(error instanceof Error);
    assert.equal(error.code,CODE);
    const protectedAudit=error.ownerProtectedMultiBasicStoreAudit;
    assert.ok(protectedAudit);
    assert.equal(protectedAudit.rejected,0);
    assert.ok(protectedAudit.initialAccepted>=2);
    assert.equal(protectedAudit.missingPhysicalPlacements,0);
    assert.ok(protectedAudit.physicalActiveConfirmed>=2);
    assert.ok(protectedAudit.physicalBenchConfirmed>=2);
    const observed=error.ownerOpeningStoreReceiptAudit?.events?.[0];
    assert.ok(observed,'Owner source native setup Store observation required');
    assert.equal(observed.seat,seat);
    assert.deepEqual(observed.selectedPrintings,fixture.selected);
    assert.deepEqual(
      observed.previouslyEligibleEntryCardsStillInHand,
      fixture.held);
    assert.equal(observed.mandatoryInitialPlacementCompleted,true);
    assert.deepEqual(
      observed.actualOwnerBench.filter(x=>
        fixture.selected.slice(1).includes(x)),
      fixture.selected.slice(1));
    assert.equal(
      error.nativeRawStateFallbackQuarantine?.originalNativeDecoderExecuted,
      false);
    console.log('AGENT50_NATIVE_PROTECTED_MULTIBASIC',JSON.stringify({
      rank:4,seat,seed,
      selected:observed.selectedPrintings,
      physicalActive:observed.actualOwnerActive,
      physicalBench:observed.actualOwnerBench,
      retainedTurnEntry:observed.previouslyEligibleEntryCardsStillInHand,
      nativeStoreAccepted:protectedAudit.accepted,
      benchPlacementWitnessed:true,
      blockedLaterPrompt:
        error.nativeRawStateFallbackQuarantine?.records?.[0]??null,
      qualifiedGames:0
    }));
  });
}
