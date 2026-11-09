'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,CANDIDATES,readRegistration,schedule,paired}=
  require('../../simulation/evaluation/2026-11/agent38-rank5-mail-hood-fresh-transfer.cjs');

test('frozen four fresh physical seed/seat groups and fixed printed Hood 60',()=>{
  const {r,hood,registrationSha256}=readRegistration();
  assert.equal(VERSION,r.schema);
  assert.equal(r.status,'FROZEN_BEFORE_NATIVE_EXECUTION');
  assert.equal(registrationSha256.length,64);
  assert.equal(r.registeredGroups.length,4);
  assert.deepEqual(new Set(r.registeredGroups.map(x=>x.seed)),
    new Set([895287650,1130119946,495999543,1513056614]));
  assert.deepEqual(CANDIDATES,['hood-shield-v1','champion-reference']);
  assert.equal(hood.cards.reduce((n,x)=>n+x.count,0),60);
  assert.deepEqual(schedule(r,CANDIDATES[0]).map(x=>x.id),[
    '5:3801:A:hood-shield-v1','5:3801:B:hood-shield-v1',
    '5:3802:A:hood-shield-v1','5:3802:B:hood-shield-v1']);
});

test('only a completed, physically matched, settled native Mail can reverse a winner',()=>{
  const trial={id:'5:3801:A:hood-shield-v1'};
  const a={trial,initialFullDeal:'full',initialSourceDeal:'source',
    firstPlayer:0,finished:true,sourceWon:false,
    sourceAttackDeclarations:2};
  const b={...a,sourceWon:true,sourceAttackDeclarations:4,
    sourceMailStoreAccepted:1,sourceMailPromptsAccepted:1};
  const x=paired(a,b);
  assert.equal(x.physicalMatched,true);
  assert.equal(x.mailSettled,true);
  assert.equal(x.sourceWinnerReversed,true);
  assert.equal(x.sourceAttackDelta,2);
  assert.equal(paired(a,{...b,sourceMailStoreAccepted:0}).sourceWinnerReversed,false);
  assert.equal(paired(a,{...b,initialFullDeal:'changed'}).sourceWinnerReversed,false);
  assert.equal(paired(a,{...b,initialSourceDeal:'changed'}).sourceWinnerReversed,false);
  assert.equal(paired(a,{...b,firstPlayer:1}).sourceWinnerReversed,false);
  assert.equal(paired(a,{...b,finished:false}).sourceWinnerReversed,false);
  assert.equal(paired(a,{...b,sourceWon:false}).sourceWinnerReversed,false);
});

test('unchanged printed identity and source opener do not imply a native finish',()=>{
  const trial={id:'5:3802:B:champion-reference'};
  const a={trial,initialFullDeal:'x',initialSourceDeal:'y',
    firstPlayer:1,finished:false,sourceWon:null,
    sourceAttackDeclarations:null};
  const x=paired(a,{...a,sourceMailStoreAccepted:1,
    sourceMailPromptsAccepted:1});
  assert.equal(x.physicalMatched,true);
  assert.equal(x.bothTerminated,false);
  assert.equal(x.sourceWinnerReversed,false);
  assert.equal(x.sourceAttackDelta,null);
});
