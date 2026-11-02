'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {followingOpponentSourcePass}=require(
  '../simulation/evaluation/agent27-source-followup-pass.cjs');

class PassTurnAction{
  /** @param {number} clientId */
  constructor(clientId){this.clientId=clientId;}
}
const cases=[{nativeStoreActionAccepted:true,actorSeat:0,
  globalTurn:20,promptId:57}];
test('pinned PassTurnAction.clientId binds exactly next owner turn',()=>{
  assert.equal(followingOpponentSourcePass({
    turn:21,players:[{id:19},{id:73}]},
    new PassTurnAction(73),0,cases)?.promptId,57);
});
test('opp own action, wrong turn and source player cannot count',()=>{
  const state={turn:21,players:[{id:19},{id:73}]};
  assert.equal(followingOpponentSourcePass(state,new PassTurnAction(19),0,cases),null);
  assert.equal(followingOpponentSourcePass(
    {...state,turn:22},new PassTurnAction(73),0,cases),null);
  assert.equal(followingOpponentSourcePass(state,
    {clientId:73},0,cases),null);
});
test('both physical seats and a paper-invalid original source are isolated',()=>{
  const state={turn:16,players:[{id:19},{id:73}]};
  const receipts=[{nativeStoreActionAccepted:false,actorSeat:1,
    globalTurn:15,promptId:36},{nativeStoreActionAccepted:true,
    actorSeat:1,globalTurn:15,promptId:37}];
  assert.equal(followingOpponentSourcePass(state,new PassTurnAction(19),
    1,receipts)?.promptId,37);
});
