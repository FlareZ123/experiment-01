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
/**
 * Peel wrappers that return {result,audit} until the actual headless result.
 * The quarantine may legitimately return without a blocked fallback when the
 * bounded run reached its action cap or a native terminal state.
 * @param {object} returned
 * @returns {{inner:object,audits:object[]}}
 */
function unwrap(returned){
  const audits=[];
  let inner=returned;
  while(inner&&typeof inner==='object'&&
    Object.hasOwn(inner,'audit')&&Object.hasOwn(inner,'result')){
    audits.push(inner.audit);
    inner=inner.result;
  }
  return {inner,audits};
}
for(const sourceSeat of [0,1]){
  test('original rank5 source seat '+sourceSeat+
    ' owner modal real Store outcome with native scorer quarantined',()=>{
    let error,returned;
    try{returned=run(sourceSeat);}
    catch(e){error=e;}
    let modal,wait,next=null,outcome;
    let quarantineCalls;
    let headlessStatus=null;
    if(error){
      assert.equal(error.code,CODE);
      modal=error.ownerModalAudit;
      wait=error.ownerWaitProgressAudit;
      const guard=error.nativeRawStateFallbackQuarantine;
      assert.ok(guard);
      quarantineCalls=guard.rawStateFallbackCalls;
      assert.equal(quarantineCalls,1);
      assert.equal(guard.originalNativeDecoderExecuted,false);
      next=guard.records[0];
      outcome='quarantined-fallback';
    }else{
      const {inner,audits}=unwrap(returned);
      assert.ok(audits.length>=6);
      const guardAudit=audits.find(a=>a?.version===
        'agent4-raw-state-native-fallback-quarantine-v1');
      assert.ok(guardAudit,
        'Complete native result must retain raw decoder quarantine audit');
      quarantineCalls=guardAudit.rawStateFallbackCalls;
      assert.equal(quarantineCalls,0);
      modal=audits.find(a=>a?.version==='agent4-owner-modal-acknowledgements-v1');
      wait=audits.find(a=>a?.version==='agent4-owner-wait-prompt-progress-v1');
      outcome='returned-from-headless';
      headlessStatus={
        finished:inner?.finished??null,
        winner:inner?.winner??null,
        stopReason:inner?.reason??null,
        actions:inner?.actions??null
      };
    }
    assert.ok(modal);
    assert.ok(modal.selected>0);
    assert.equal(modal.selected,modal.accepted);
    assert.equal(modal.accepted,modal.settled);
    if(wait)assert.ok(wait.accepted>0);
    process.stdout.write(JSON.stringify({
      schema:'agent4-owner-modal-native-outcome-v2',
      sourceRank:5,sourceSeat,pin:plan.engineRevision,
      outcome,headlessStatus,
      originalDecoderCalls:quarantineCalls,
      acceptedModal:modal.accepted,byKind:modal.byKind,
      modalEvents:modal.events,
      firstOriginalNativeFallback:next,
      competitivelyQualifiedGames:0
    })+'\n');
  });
}
