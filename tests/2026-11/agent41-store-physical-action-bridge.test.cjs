'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  physicalZone,certifyStoreRoot,summarizeNativeCapture
} = require('../../simulation/evaluation/2026-11/agent41-store-physical-action-bridge.cjs');

const originals = [
  {id:'0:0',originalSeat:0,printing:'Psychic Energy MEE'},
  {id:'0:1',originalSeat:0,printing:"Trainers' Mail ROS"},
  {id:'1:0',originalSeat:1,printing:'Fog Crystal CRE'}
];
const example = overrides => ({
  trialId:'fixture:1',actionOrdinal:8,seat:0,turnBefore:2,
  action:'PlayCardAction',declaredCard:null,
  beforePositions:{
    '0:0':'s0.hand:0','0:1':'s0.deck:0','1:0':'s1.deck:0'
  },
  afterPositions:{
    '0:0':'s0.active:1','0:1':'s0.deck:1','1:0':'s1.deck:0'
  },...overrides
});

test('physical zone strips ordering indexes and preserves owner seat',()=>{
  assert.equal(physicalZone('s0.deck:13'),'s0.deck');
  assert.equal(physicalZone('s1.bench3.tools:1'),'s1.bench3.tools');
  assert.equal(physicalZone(null),null);
  assert.throws(()=>physicalZone('s1.deck:missing'),/Malformed/);
});

test('native identity comes from exactly one actor hand exit, not absent declaredCard',()=>{
  const result=certifyStoreRoot(example(),originals);
  assert.equal(result.playedCardStatus,'UNIQUE_ACTOR_HAND_EXIT');
  assert.deepEqual(result.playedCard,{
    physicalId:'0:0',printing:'Psychic Energy MEE',
    from:'s0.hand',to:'s0.active'
  });
  assert.equal(result.physicalZoneTransitions.length,1);
  assert.equal(result.indexOnlyReorders,1);
  assert.equal(result.ownerZoneViolations.length,0);
  assert.equal(result.printedPaymentReviewed,false);
  assert.equal(result.competitiveGameQualified,false);
});

test('multiple simultaneous actor hand exits cannot falsely certify played card',()=>{
  const root=example({afterPositions:{
    '0:0':'s0.active:1','0:1':'s0.discard:1','1:0':'s1.deck:0'
  },beforePositions:{
    '0:0':'s0.hand:0','0:1':'s0.hand:1','1:0':'s1.deck:0'
  }});
  const result=certifyStoreRoot(root,originals);
  assert.equal(result.actorHandExits.length,2);
  assert.equal(result.playedCard,null);
  assert.equal(result.playedCardStatus,'AMBIGUOUS_OR_INCOMPLETE_PHYSICAL_PLAY');
});

test('temporary absence from visible zones is not a discard payment',()=>{
  const root=example({action:'ResolvePromptAction',afterPositions:{
    '0:0':undefined,'0:1':'s0.deck:1','1:0':'s1.deck:0'
  }});
  const result=certifyStoreRoot(root,originals);
  assert.equal(result.physicalZoneTransitions.length,0);
  assert.equal(result.transientOffzone.length,1);
  assert.equal(result.actorHandExits.length,0);
});

test('foreign-owner physical zones and extra IDs fail closed for a card play',()=>{
  const root=example({afterPositions:{
    '0:0':'s1.active:1','0:1':'s0.deck:1','1:0':'s1.deck:0',
    'extra:0':'s0.deck:2'
  }});
  const result=certifyStoreRoot(root,originals);
  assert.equal(result.foreignOwnerViolations,undefined);
  assert.equal(result.ownerZoneViolations.length,1);
  assert.deepEqual(result.unknownPhysicalIds,['extra:0']);
  assert.equal(result.playedCardStatus,'AMBIGUOUS_OR_INCOMPLETE_PHYSICAL_PLAY');
});

test('native declared printing conflict blocks play identity promotion',()=>{
  const result=certifyStoreRoot(example({
    declaredCard:'Wrong Card XXX'
  }),originals);
  assert.equal(result.playedCard,null);
  assert.equal(result.playedCardStatus,'DECLARED_PRINTING_CONFLICT');
});

test('full-archive reduction includes every attempt and distinct reorder counts',()=>{
  const archive={observedVendorGitCommit:'pinned-vendor',
    captured:[{trialId:'fixture:1',storeRaw:{
      originalPhysicalCards:originals,receipts:[example()]}}]};
  const result=summarizeNativeCapture(archive);
  assert.equal(result.attemptedTrials,1);
  assert.equal(result.summary.roots,1);
  assert.equal(result.summary.cardPlayRoots,1);
  assert.equal(result.summary.identifiedCardPlays,1);
  assert.equal(result.summary.genuineZoneTransfers,1);
  assert.equal(result.summary.withinZoneReorders,1);
  assert.equal(result.printedPaymentReviewed,false);
  assert.equal(result.competitiveGameQualified,false);
});
