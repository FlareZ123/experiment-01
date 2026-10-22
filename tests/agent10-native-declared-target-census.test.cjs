'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {classifyAcceptedTarget,auditAcceptedTargetSemantics}=
  require('../simulation/evaluation/agent10-native-declared-target-census.cjs');

/** @param {object} [changes] */
function receipt(changes={}){
  return {
    rootActionOrdinal:49,turnBefore:7,playerSlot:0,action:'PlayCardAction',
    declared:{kind:'play-card',status:'captured',ownerHandPrinting:'Darkness Energy MEE',
      target:{player:2,slot:1,index:0}},
    publicBoardChanges:[{seat:0,position:'active',index:0}],
    visibility:'public-after-dispatch',storeAccepted:true,...changes
  };
}

test('Active Energy attachment yields bounded public-slot receipt',()=>{
  const r=classifyAcceptedTarget(receipt());
  assert.equal(r.category,'declared-own-slot-public-delta-confirmed');
  assert.equal(r.position,'active');
  assert.equal(r.actionOrdinal,49);
});

test('Bench recipient must match actor-owned Bench position and index',()=>{
  const good=receipt({
    playerSlot:1,
    declared:{kind:'play-card',status:'captured',ownerHandPrinting:'Crobat V DAA',
      target:{player:2,slot:2,index:1}},
    publicBoardChanges:[{seat:1,position:'bench',index:1}]
  });
  assert.equal(classifyAcceptedTarget(good).category,
    'declared-own-slot-public-delta-confirmed');
  assert.equal(classifyAcceptedTarget({...good,
    publicBoardChanges:[{seat:0,position:'bench',index:1}]}).category,
    'unverified');
  assert.equal(classifyAcceptedTarget({...good,
    publicBoardChanges:[{seat:1,position:'bench',index:0}]}).category,
    'unverified');
});

test('Guzma and Hala sentinel is coordinate-only even after accepted Store',()=>{
  const r=classifyAcceptedTarget(receipt({
    declared:{kind:'play-card',status:'captured',
      ownerHandPrinting:'Guzma & Hala CEC',
      target:{player:0,slot:0,index:0}},
    publicBoardChanges:[]
  }));
  assert.equal(r.category,'coordinate-only-unverified');
});

test('native owner slot without observable board change is unverified',()=>{
  const row=receipt({publicBoardChanges:[]});
  assert.equal(classifyAcceptedTarget(row).category,'unverified');
  assert.equal(classifyAcceptedTarget({...row,
    visibility:'target-unobserved'}).category,'unverified');
  assert.equal(classifyAcceptedTarget({...row,storeAccepted:false}).category,
    'unverified');
});

test('Retreat requires both public Active and selected Bench slot deltas',()=>{
  const row=receipt({action:'RetreatAction',
    declared:{kind:'retreat',status:'captured',benchIndex:2},
    publicBoardChanges:[
      {seat:0,position:'active',index:0},
      {seat:0,position:'bench',index:2}]});
  assert.equal(classifyAcceptedTarget(row).category,
    'retreat-board-slot-confirmed');
  assert.equal(classifyAcceptedTarget({...row,
    publicBoardChanges:[{seat:0,position:'active',index:0}]}).category,
    'unverified');
});

test('sidecar census preserves every coordinate without upgrading dummy geometry',()=>{
  const target=receipt();
  const nonboard=receipt({rootActionOrdinal:18,
    declared:{kind:'play-card',status:'captured',
      ownerHandPrinting:'Fog Crystal CRE',
      target:{player:0,slot:0,index:0}},publicBoardChanges:[]});
  const a=auditAcceptedTargetSemantics({
    rootOrdinalLinked:true,events:[target,nonboard]});
  assert.equal(a.acceptedDeclaredPlayOrRetreat,2);
  assert.equal(a.publicOwnRecipientConfirmed,1);
  assert.equal(a.coordinateOnlyUnverified,1);
  assert.equal(a.additionalUnverified,0);
  assert.equal(a.records[1].category,'coordinate-only-unverified');

  const b=auditAcceptedTargetSemantics({
    rootOrdinalLinked:false,events:[target,nonboard]});
  assert.equal(b.publicOwnRecipientConfirmed,0);
  assert.equal(b.coordinateOnlyUnverified,0);
  assert.equal(b.additionalUnverified,2);
});

test('missing native geometry never becomes confirmed',()=>{
  for(const target of [null,{}, {player:2,slot:2,index:-1}]){
    const item=receipt({declared:{kind:'play-card',status:'captured',
      ownerHandPrinting:'Psychic Energy MEE',target}});
    assert.notEqual(classifyAcceptedTarget(item).category,
      'declared-own-slot-public-delta-confirmed');
  }
});
