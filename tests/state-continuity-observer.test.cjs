'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  firstMismatch,withSourceContinuity,withRootPolicyMutationAudit,hash,cardHistory
}=require('../simulation/twinleaf/source-state-continuity.cjs');

class AddPlayerAction {}
class AddOne {}
class Store {
  constructor(){this.state={count:0,card:{damageTakenLastTurn:0}};}
  dispatch(action) {
    if (action instanceof AddPlayerAction || action instanceof AddOne) {
      this.state.count++;
    }
    return this.state.count;
  }
}
const sample=state=>({
  count:state.count,damageTakenLastTurn:state.card.damageTakenLastTurn
});

test('field-level difference detects a mutable Card scalar',()=>{
  const diff=firstMismatch({a:[{history:0}]},{a:[{history:70}]});
  assert.deepEqual(diff,{path:'$.a[0].history',before:0,after:70});
  assert.equal(firstMismatch({a:1},{a:1}),null);
  assert.notEqual(hash({a:1}),hash({a:2}));
  assert.deepEqual(cardHistory([{fullName:'Dragon A',damageTakenLastTurn:20},
    {fullName:'Item X'}]),[
    {printing:'Dragon A',damageTakenLastTurn:20},
    {printing:'Item X',damageTakenLastTurn:null}
  ]);
});

test('changes inside Store.dispatch do not create a continuity gap',()=>{
  const store=new Store(),prior=Store.prototype.dispatch;
  const capture=withSourceContinuity(Store,()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new AddOne());
    return store.dispatch(new AddOne());
  },{snapshot:sample});
  assert.equal(capture.result,3);
  assert.equal(capture.liveDispatches,3);
  assert.deepEqual(capture.discontinuities,[]);
  assert.equal(Store.prototype.dispatch,prior);
});

test('mutation between root actions is detected',()=>{
  const store=new Store();
  const capture=withSourceContinuity(Store,()=>{
    store.dispatch(new AddPlayerAction());
    store.state.card.damageTakenLastTurn=90;
    store.dispatch(new AddOne());
    return store.state.count;
  },{snapshot:sample});
  assert.equal(capture.result,2);
  assert.equal(capture.discontinuities.length,1);
  assert.equal(capture.discontinuities[0].nextAction,'AddOne');
  assert.deepEqual(capture.discontinuities[0].firstMismatch,{
    path:'$.damageTakenLastTurn',before:0,after:90
  });
});

test('ignores speculative Stores and restores wrapper on failure',()=>{
  const live=new Store(),sim=new Store(),prior=Store.prototype.dispatch;
  const capture=withSourceContinuity(Store,()=>{
    live.dispatch(new AddPlayerAction());
    sim.dispatch(new AddOne());
    live.dispatch(new AddOne());
  },{snapshot:sample});
  assert.equal(capture.liveDispatches,2);
  assert.equal(capture.otherDispatches,1);
  assert.equal(capture.discontinuities.length,0);
  assert.equal(Store.prototype.dispatch,prior);
  assert.throws(()=>withSourceContinuity(Store,()=>{
    live.dispatch(new AddPlayerAction());
    throw new Error('deliberate');
  },{snapshot:sample}),/deliberate/);
  assert.equal(Store.prototype.dispatch,prior);
});

test('policy observation is read-only for a pure bot',()=>{
  class TestBot {decodeNextAction(){return new AddOne();}}
  const live=new Store(),bot=new TestBot();
  const result=withRootPolicyMutationAudit(Store,TestBot,()=>{
    live.dispatch(new AddPlayerAction());
    live.dispatch(bot.decodeNextAction(live.state));
    return live.state.count;
  },{snapshot:sample});
  assert.equal(result.result,2);
  assert.equal(result.rootPolicyCalls,1);
  assert.deepEqual(result.rootPolicyStateMutations,[]);
});

test('policy observer attributes an actual source scalar write',()=>{
  class TestBot {
    decodeNextAction(state){
      state.card.damageTakenLastTurn=200;
      return new AddOne();
    }
  }
  const live=new Store(),bot=new TestBot();
  const result=withRootPolicyMutationAudit(Store,TestBot,()=>{
    live.dispatch(new AddPlayerAction());
    live.dispatch(bot.decodeNextAction(live.state));
  },{snapshot:sample});
  assert.equal(result.rootPolicyCalls,1);
  assert.equal(result.rootPolicyStateMutations.length,1);
  assert.equal(result.rootPolicyStateMutations[0].firstMismatch.path,
    '$.damageTakenLastTurn');
  assert.equal(result.rootPolicyStateMutations[0].firstMismatch.after,200);
});
