'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
const {runMatch}=require('../simulation/twinleaf/headless.cjs');
const {withOwnerSetupConfirm}=require('../simulation/twinleaf/agent4-owner-setup-confirm.cjs');
const {withOwnerStartingPokemon}=
  require('../simulation/twinleaf/agent4-owner-setup-starting-pokemon.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('../simulation/evaluation/agent7-canonical-actor-composition.cjs');
const {CODE,withNativeRawStateFallbackQuarantine:guard}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');
const plan=planAichi(1,{allowEquivalentBasicEnergies:true,
  allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
const source=plan.opponents.find(x=>x.rank===5);
assert.equal(source?.status,'ready');

/** @param {0|1} sourceSeat */
function attempt(sourceSeat){
  return guard(()=>withOwnerSetupConfirm(()=>withOwnerStartingPokemon(()=>
    withCanonicalActorOnlyPolicy(()=>runMatch({
      deckA:sourceSeat===0?source.cards:plan.candidate.cards,
      deckB:sourceSeat===1?source.cards:plan.candidate.cards,
      seed:20261118+sourceSeat,maxActions:80,
      captureNativeAbortEvidence:true
    })))));
}
for(const sourceSeat of [0,1]){
  test('rank5 pinned Store source seat '+sourceSeat+
    ' owner-only setup starting Basic before native fallback',()=>{
    let error;
    try{attempt(sourceSeat);}
    catch(e){error=e;}
    assert.ok(error instanceof Error);
    assert.equal(error.code,CODE);
    const confirm=error.ownerSetupConfirmAudit;
    const starting=error.ownerStartingPokemonAudit;
    assert.ok(confirm?.accepted>0);
    assert.ok(starting?.accepted>0);
    assert.equal(starting.selected,starting.accepted);
    assert.equal(starting.physicallyPlacedActiveConfirmed,starting.accepted);
    assert.equal(starting.physicallyPlacedActiveMissing,0);
    const first=error.nativeRawStateFallbackQuarantine.records[0];
    assert.ok(first);
    assert.notEqual(first.promptType,'ConfirmPrompt');
    assert.ok(first.phase!==1||first.promptType!=='ChooseCardsPrompt',
      'Initial Basic placement must be resolved without inherited native scorer');
    process.stdout.write(JSON.stringify({
      schema:'agent4-owner-setup-basic-native-next-interface-v1',
      sourceSeat,sourceRank:5,pinned:plan.engineRevision,
      ownerConfirmAccepted:confirm.accepted,
      ownerStartingBasicAccepted:starting.accepted,
      ownerStartingPhysicalPlacement:starting.physicallyPlacedActiveConfirmed,
      nextInterface:first,
      qualifiedGames:0
    })+'\n');
  });
}
