'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {stateGraphFingerprint,withLiveDecisionFingerprint}=
  require('../simulation/twinleaf/rank10-live-decision-noninterference.cjs');

test('read-only graph hash detects a mutable deep card field',()=>{
  const active={name:'Mimikyu',damageTakenLastTurn:0};
  const state={players:[{active:{cards:[active]}}]};
  const first=stateGraphFingerprint(state);
  const same=stateGraphFingerprint(state);
  assert.deepEqual(first,same);
  active.damageTakenLastTurn=280;
  const changed=stateGraphFingerprint(state);
  assert.notEqual(changed.digest,first.digest);
});

test('graph hash preserves source object aliases',()=>{
  const card={id:1};
  const aliased={first:card,second:card};
  const detached={first:{id:1},second:{id:1}};
  assert.notEqual(stateGraphFingerprint(aliased).digest,
    stateGraphFingerprint(detached).digest);
});

test('graph fingerprint does not invoke getters',()=>{
  const state={};
  Object.defineProperty(state,'danger',{
    enumerable:true,get(){throw new Error('getter invoked')}
  });
  assert.ok(stateGraphFingerprint(state).digest);
});

test('live decision observer changes neither decision nor untouched State',()=>{
  class Bot {
    decodeNextAction(){return {kind:'PlayCardAction'};}
  }
  const state={turn:27,activePlayer:1,prompts:[],players:[{deck:{cards:[]}}]};
  const source=stateGraphFingerprint(state);
  const out=withLiveDecisionFingerprint(Bot,()=>new Bot().decodeNextAction(state),
    {turn:27,seat:1});
  assert.deepEqual(out.result,{kind:'PlayCardAction'});
  assert.equal(out.observations.length,1);
  assert.equal(out.observations[0].sourceMutatedDuringDecision,false);
  assert.deepEqual(stateGraphFingerprint(state),source);
});

test('live decision observer restores bot method on callback failure',()=>{
  class Bot {
    decodeNextAction(){throw Error('bot source failure');}
  }
  const original=Bot.prototype.decodeNextAction;
  assert.throws(()=>withLiveDecisionFingerprint(Bot,()=>
    new Bot().decodeNextAction({turn:27,activePlayer:1,prompts:[]}),
    {turn:27,seat:1}),/source failure/);
  assert.strictEqual(Bot.prototype.decodeNextAction,original);
});
