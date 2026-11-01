'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {priorK1SpeedAlternative,VERSION}=
  require('../simulation/twinleaf/agent6-owner-k1-turn-bridge.cjs');

const baseline={channel:'held-guzma-hala',
  needThunder:true,needDce:false,discardCount:0};
const known={source:'accepted-original-store-owner-deck-prompt',
  ownerId:'owner-A',actorSeat:0,globalTurn:1,ownerPromptId:12,
  prizeCount:6,thunderMountainDeckCopies:0,speedLightningDeckCopies:3};
const current={ownerId:'owner-A',seat:0,turn:3,prizeCount:6,
  activeDceAttached:true,activeSpeedAttached:false,
  speedAlreadyHeld:false,energyAttachAvailable:true,
  supporterAvailable:true,twoDiscardPaymentAvailable:true};

test('authenticated previous turn own-deck absence switches only the G&H mode',()=>{
  const x=priorK1SpeedAlternative(baseline,known,current);
  assert.deepEqual(x,{...baseline,needThunder:false,
    needLiveLightningViaSpeed:true,discardCount:2,
    ownerK1KnowledgeSource:VERSION});
  assert.deepEqual(baseline,{channel:'held-guzma-hala',
    needThunder:true,needDce:false,discardCount:0});
});

test('owner identity, physical seat, prompt origin, turn and Prize custody scope the memory',()=>{
  const alternate=[
    [{...known,source:'opponent-hand'},current],
    [{...known,ownerPromptId:null},current],
    [{...known,ownerId:'opponent'},current],
    [{...known,actorSeat:1},current],
    [{...known,globalTurn:2},current],
    [{...known,prizeCount:5},current],
    [known,{...current,ownerId:'other'}],
    [known,{...current,seat:1}],
    [known,{...current,turn:4}],
    [known,{...current,prizeCount:5}]
  ];
  for(const [record,facts] of alternate){
    assert.equal(priorK1SpeedAlternative(baseline,record,facts),null);
  }
});

test('missing owner-deck Speed witness or missing hardware prevents speculative pivot',()=>{
  for(const record of [
    {...known,thunderMountainDeckCopies:1},
    {...known,speedLightningDeckCopies:0},
    {...known,speedLightningDeckCopies:-1}
  ])assert.equal(priorK1SpeedAlternative(baseline,record,current),null);
  for(const key of ['activeDceAttached','energyAttachAvailable',
    'supporterAvailable','twoDiscardPaymentAvailable']){
    assert.equal(priorK1SpeedAlternative(baseline,known,
      {...current,[key]:false}),null);
  }
  for(const key of ['activeSpeedAttached','speedAlreadyHeld']){
    assert.equal(priorK1SpeedAlternative(baseline,known,
      {...current,[key]:true}),null);
  }
});

test('ordinary direct, unknown and separately unfunded supporter plans remain intact',()=>{
  assert.equal(priorK1SpeedAlternative(
    {...baseline,channel:'direct'},known,current),null);
  assert.equal(priorK1SpeedAlternative(
    {...baseline,needThunder:false},known,current),null);
  assert.equal(priorK1SpeedAlternative(
    {...baseline,needDce:true},known,current),null);
  assert.equal(priorK1SpeedAlternative(null,known,current),null);
  assert.equal(priorK1SpeedAlternative(baseline,null,current),null);
});
