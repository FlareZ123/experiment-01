'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
const {runMatch}=require('../simulation/twinleaf/headless.cjs');
const {withOwnerSetupConfirm}=require('../simulation/twinleaf/agent4-owner-setup-confirm.cjs');
const {withOwnerStartingPokemon}=require('../simulation/twinleaf/agent4-owner-setup-starting-pokemon.cjs');
const {withOwnerWaitProgress}=require('../simulation/twinleaf/agent4-owner-wait-progress.cjs');
const {withOwnerModalAcknowledgements}=require('../simulation/twinleaf/agent4-owner-modal-acknowledgements.cjs');
const {withCanonicalActorOnlyPolicy}=require('../simulation/evaluation/agent7-canonical-actor-composition.cjs');
const {CODE,withNativeRawStateFallbackQuarantine:guard}=require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');
const plan=planAichi(1,{allowEquivalentBasicEnergies:true,
  allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
const source=plan.opponents.find(x=>x.rank===5);
assert.equal(source?.status,'ready');
/** @param {0|1} sourceSeat */
function run(sourceSeat){
  return guard(()=>withOwnerSetupConfirm(()=>withOwnerStartingPokemon(()=>
    withOwnerWaitProgress(()=>withOwnerModalAcknowledgements(()=>
      withCanonicalActorOnlyPolicy(()=>runMatch({
        deckA:sourceSeat===0?source.cards:plan.candidate.cards,
        deckB:sourceSeat===1?source.cards:plan.candidate.cards,
        seed:20261118+sourceSeat,maxActions:180,
        captureNativeAbortEvidence:true
      })))))));
}
for(const sourceSeat of [0,1]){
  test('original rank5 source seat '+sourceSeat+
    ' modal responses advance real Store under strict native fallback',()=>{
    let error;
    try{run(sourceSeat);}
    catch(e){error=e;}
    assert.ok(error instanceof Error);
    assert.equal(error.code,CODE);
    const modal=error.ownerModalAudit;
    assert.ok(modal);
    assert.ok(modal.selected>0,'Expected in-game show or confirmation modal');
    assert.equal(modal.accepted,modal.selected);
    assert.equal(modal.settled,modal.accepted);
    assert.ok(error.ownerWaitProgressAudit.accepted>0);
    const next=error.nativeRawStateFallbackQuarantine.records[0];
    assert.ok(next);
    assert.equal(error.nativeRawStateFallbackQuarantine.rawStateFallbackCalls,1);
    process.stdout.write(JSON.stringify({
      schema:'agent4-owner-modal-next-native-interface-v1',
      sourceRank:5,sourceSeat,pin:plan.engineRevision,
      acceptedModal:modal.accepted,
      byKind:modal.byKind,
      modalEvents:modal.events,
      firstOriginalNativeFallback:next,
      competitivelyQualifiedGames:0
    })+'\n');
  });
}
