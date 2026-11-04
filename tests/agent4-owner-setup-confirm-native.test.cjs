'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
const {runMatch}=require('../simulation/twinleaf/headless.cjs');
const {withOwnerSetupConfirm}=require('../simulation/twinleaf/agent4-owner-setup-confirm.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('../simulation/evaluation/agent7-canonical-actor-composition.cjs');
const {CODE,withNativeRawStateFallbackQuarantine:guard}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

const plan=planAichi(1,{
  allowEquivalentBasicEnergies:true,
  allowBasicEnergyMirrorPrintings:true,
  allowJapanesePromoHooks:true
});
const source=plan.opponents.find(x=>x.rank===5);
assert.equal(source?.status,'ready');

/** @param {0|1} sourceSeat */
function run(sourceSeat){
  const deckA=sourceSeat===0?source.cards:plan.candidate.cards;
  const deckB=sourceSeat===1?source.cards:plan.candidate.cards;
  return guard(()=>withOwnerSetupConfirm(()=>
    withCanonicalActorOnlyPolicy(()=>runMatch({
      deckA,deckB,seed:20261118+sourceSeat,maxActions:48,
      captureNativeAbortEvidence:true
    }))));
}

for(const seat of [0,1]){
  test('native rank5 seat '+seat+' advances beyond setup Confirm',()=>{
    let failure;
    try {run(seat);}
    catch(error){failure=error;}
    assert.ok(failure instanceof Error);
    assert.equal(failure.code,CODE);
    const setup=failure.ownerSetupConfirmAudit;
    assert.ok(setup?.accepted>0);
    assert.equal(setup.selected,setup.accepted);
    const next=failure.nativeRawStateFallbackQuarantine.records[0];
    assert.notEqual(next.promptType,'ConfirmPrompt');
    process.stdout.write(JSON.stringify({
      schema:'agent4-setup-confirm-native-next-interface-v1',
      sourceRank:5,sourceSeat:seat,
      ownerConfirmAccepted:setup.accepted,
      ownerConfirmMessageCodes:setup.ownerVisiblePromptMessageCodes,
      nextInterface:next,
      qualifiedGames:0
    })+'\n');
  });
}
