'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {planAichi}=
  require('../simulation/evaluation/aichi-pilot.cjs');
const {runMatch}=
  require('../simulation/twinleaf/headless.cjs');
const {withOwnerSetupConfirm}=
  require('../simulation/twinleaf/agent4-owner-setup-confirm.cjs');
const {withOwnerEntryPriorityOpening:entryPriority}=
  require('../simulation/twinleaf/agent50-owner-entry-priority-single-basic.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('../simulation/evaluation/agent7-canonical-actor-composition.cjs');
const {CODE,withNativeRawStateFallbackQuarantine:quarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const plan=planAichi(1,{
  allowEquivalentBasicEnergies:true,
  allowBasicEnergyMirrorPrintings:true,
  allowJapanesePromoHooks:true
});
const source=plan.opponents.find(x=>x.rank===5);
assert.equal(plan.engineRevision,PIN);
assert.equal(source?.status,'ready');

for(const sourceSeat of [0,1]){
  test('preregistered original5 source seat '+sourceSeat+
      ': entry-priority owner native setup/store before guard',()=>{
    const seed=20261118+sourceSeat;
    let blocked=null;
    try{
      quarantine(()=>withOwnerSetupConfirm(()=>entryPriority(()=>
        withCanonicalActorOnlyPolicy(()=>runMatch({
          deckA:sourceSeat===0?source.cards:plan.candidate.cards,
          deckB:sourceSeat===1?source.cards:plan.candidate.cards,
          seed,maxActions:80,captureNativeAbortEvidence:true
        })))));
    }catch(error){
      blocked=error;
    }
    assert.ok(blocked instanceof Error);
    assert.equal(blocked.code,CODE,
      'Unsupported native setup/root must still fail closed');
    const native=blocked.ownerEntryPriorityAudit;
    const starting=native?.nativeStoreAdapterAudit;
    const outer=blocked.nativeRawStateFallbackQuarantine;
    assert.ok(native,'Missing opt-in entry-priority actual native audit');
    assert.ok(starting,'Missing pinned Store setup placement receipt');
    assert.ok(starting.accepted>=1,
      'Both authentic physical players must settle a setup Active');
    assert.equal(starting.physicallyPlacedActiveConfirmed,
      starting.accepted,'Actual pinned native Store placement must settle');
    assert.equal(starting.physicallyPlacedActiveMissing,0);
    assert.equal(starting.rejected,0);
    assert.ok(native.ownerEntrySelectionEvents.length>=2);
    assert.ok(native.ownerEntrySelectionEvents.every(e=>
      e.validEligibleBasics>=1&&e.eligibleTurnEntrySupports>=0&&
      (!e.chosenEntrySupport||
        e.validEligibleBasics===e.eligibleTurnEntrySupports)));
    assert.equal(outer?.originalNativeDecoderExecuted,false);
    assert.ok(outer?.rawStateFallbackCalls>=1);
    assert.deepEqual([...new Set(starting.events.map(e=>e.seat))].sort(),
      [0,1]);
    console.log('AGENT50_REGISTERED_OWNER_ENTRY_PRIORITY_RANK5',JSON.stringify({
      schema:'agent50-owner-entry-priority-original5-native-v1',
      sourceSeat,seed,pinned:plan.engineRevision,sourceRank:5,
      actualNativeSourceDeals:blocked.nativeAbortEvidence??null,
      selected:starting.selected,
      StoreAccepted:starting.accepted,
      physicallyPlacedActive:starting.physicallyPlacedActiveConfirmed,
      ownerEntrySelections:native.ownerEntrySelectionEvents,
      selectedCards:starting.events.map(e=>({
        seat:e.seat,printing:e.printing,
        eligible:e.eligibleCount})),
      nextNativeFallback:outer.records?.[0]??null,
      nativeOriginalDecoderExecuted:false,
      competitiveQualifiedGames:0,
      disposition:'developmental-Store-acceptance-only'
    }));
  });
}
