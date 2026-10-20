'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,upstreamSmokeDeck}=require('./headless.cjs');
const {withNativeDecisionDispatchWitness}=require('./agent23-native-decision-dispatch-witness.cjs');
const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const {SimpleTacticsAi}=require(path.join(base,'simple-bot/simple-tactics-ai'));
const {Store}=require(path.join(base,'game/store/store'));
const deck=upstreamSmokeDeck();
assert.equal(deck.length,60);
const request={deckA:deck,deckB:deck,seed:20310317,maxActions:100,label:'agent23-native-smoke'};
const control=runMatch(request);
const observed=withNativeDecisionDispatchWitness(()=>runMatch(request),
  {SimpleTacticsAi,Store,maxRecords:128,tapeOrdinal:1,
    captureActorViewAtTape:true});
assert.deepEqual(observed.result,control);
assert.ok(observed.audit.observedLiveStores>=1);
assert.equal(observed.audit.competitiveGameQualified,false);
assert.equal(observed.audit.nativePolicyTapes.length,1);
assert.equal(observed.audit.nativePolicyTapes[0].ordinal,1);
assert.equal(observed.audit.nativePolicyTapes[0].unchangedPortableInput,true);
assert.equal(observed.audit.nativePolicyTapes[0].dispatchReturnedWithoutThrow,true);
assert.equal(observed.audit.nativePolicyTapes[0].ownerViewError,null);
assert.equal(observed.audit.nativePolicyTapes[0].ownerObservationPreserved,true);
console.log(JSON.stringify({scope:'native smoke; no Aichi match',
  controlUnchanged:true,storeAudit:observed.audit,competitiveQualifiedGames:0}));
