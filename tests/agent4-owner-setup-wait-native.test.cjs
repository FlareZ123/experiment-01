'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
const {runMatch}=require('../simulation/twinleaf/headless.cjs');
const {withOwnerSetupConfirm}=
  require('../simulation/twinleaf/agent4-owner-setup-confirm.cjs');
const {withOwnerStartingPokemon}=
  require('../simulation/twinleaf/agent4-owner-setup-starting-pokemon.cjs');
const {withOwnerWaitProgress}=
  require('../simulation/twinleaf/agent4-owner-wait-progress.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('../simulation/evaluation/agent7-canonical-actor-composition.cjs');
const {CODE,withNativeRawStateFallbackQuarantine:guard}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');
const plan=planAichi(1,{
  allowEquivalentBasicEnergies:true,
  allowBasicEnergyMirrorPrintings:true,
  allowJapanesePromoHooks:true
});
const source=plan.opponents.find(p=>p.rank===5);
assert.equal(source?.status,'ready');

/** @param {0|1} sourceSeat */
function run(sourceSeat){
  return guard(()=>withOwnerSetupConfirm(()=>
    withOwnerStartingPokemon(()=>
      withOwnerWaitProgress(()=>
        withCanonicalActorOnlyPolicy(()=>runMatch({
          deckA:sourceSeat===0?source.cards:plan.candidate.cards,
          deckB:sourceSeat===1?source.cards:plan.candidate.cards,
          seed:20261118+sourceSeat,maxActions:140,
          captureNativeAbortEvidence:true
        }))))));
}
for(const sourceSeat of [0,1]){
  test('pinned Store rank5 source seat '+sourceSeat+
    ' passes owner-only setup and Wait before first unsafe fallback',()=>{
    let failure;
    try{run(sourceSeat);}
    catch(error){failure=error;}
    assert.ok(failure instanceof Error);
    assert.equal(failure.code,CODE);
    assert.ok(failure.ownerSetupConfirmAudit?.accepted>0);
    assert.ok(failure.ownerStartingPokemonAudit?.accepted>0);
    assert.equal(
      failure.ownerStartingPokemonAudit.physicallyPlacedActiveConfirmed,
      failure.ownerStartingPokemonAudit.accepted);
    assert.ok(failure.ownerWaitProgressAudit?.accepted>0);
    assert.equal(failure.ownerWaitProgressAudit.selected,
      failure.ownerWaitProgressAudit.accepted);
    const first=failure.nativeRawStateFallbackQuarantine.records[0];
    assert.ok(first);
    assert.notEqual(first.promptType,'WaitPrompt');
    process.stdout.write(JSON.stringify({
      schema:'agent4-three-stage-owner-setup-native-next-gap-v1',
      sourceRank:5,sourceSeat,
      pin:plan.engineRevision,
      acceptedConfirm:failure.ownerSetupConfirmAudit.accepted,
      acceptedStarting:failure.ownerStartingPokemonAudit.accepted,
      acceptedWait:failure.ownerWaitProgressAudit.accepted,
      firstOriginalNativeFallback:first,
      competitivelyQualifiedGames:0
    })+'\n');
  });
}
