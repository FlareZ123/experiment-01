'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createFundedPerfectionPassObserver}=require('../simulation/twinleaf/agent36-funded-perfection-pass-observer.cjs');

test('funded Perfection observer probes the immutable owner pre-Pass state',()=>{
  class PassTurnAction {}
  class DrawCardAction {}
  class FakeStore {
    constructor(state){this.state=state;}
    dispatch(action) {
      if(action instanceof PassTurnAction)
        this.state={...this.state,activePlayer:1};
      return {accepted:true,action};
    }
  }
  const calls=[];
  const samplerFactory=({maxRecords})=>({
    observe(state,playerId,actionName,actionOrdinal) {
      calls.push({state,playerId,actionName,actionOrdinal,maxRecords});
      return {actionOrdinal,playerId};
    },
    summary(){return {maxRecords,observed:calls.length};}
  });
  const original=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  const observer=createFundedPerfectionPassObserver({
    Store:FakeStore,maxRecords:4,samplerFactory
  });
  observer.install();
  const state={activePlayer:0,players:[{id:'owner-0'},{id:'owner-1'}]};
  const store=new FakeStore(state);
  const action=new PassTurnAction();
  const result=store.dispatch(action);
  const sample=observer.onRootActionDispatched(store,action,17,0,6);
  observer.restore();

  assert.equal(result.accepted,true);
  assert.equal(calls.length,1);
  assert.equal(calls[0].state,state);
  assert.equal(calls[0].playerId,'owner-0');
  assert.equal(calls[0].actionName,'PassTurnAction');
  assert.equal(calls[0].actionOrdinal,17);
  assert.equal(calls[0].maxRecords,4);
  assert.deepEqual(sample,{actionOrdinal:17,playerId:'owner-0'});
  assert.equal(observer.summary().passRootCount,1);
  assert.equal(observer.summary().missingPreStateCount,0);
  assert.equal(Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch').value,
    original.value);
});

test('funded Perfection observer ignores non-Pass roots and reports missing prestate',()=>{
  class PassTurnAction {}
  class DrawCardAction {}
  class FakeStore {
    constructor(state){this.state=state;}
    dispatch(action){return action;}
  }
  const calls=[];
  const observer=createFundedPerfectionPassObserver({
    Store:FakeStore,
    samplerFactory:()=>({
      observe(...args){calls.push(args);return {sampled:true};},
      summary(){return {observed:calls.length};}
    })
  });
  observer.install();
  const store=new FakeStore({players:[{id:'owner-0'},{id:'owner-1'}]});
  const other=new DrawCardAction();
  observer.onRootActionDispatched(store,other,1,0,1);
  observer.onRootActionDispatched(store,new PassTurnAction(),2,0,1);
  observer.restore();

  assert.equal(calls.length,0);
  assert.equal(observer.summary().passRootCount,1);
  assert.equal(observer.summary().missingPreStateCount,1);
});

test('funded Perfection observer rejects double installation and restores dispatch',()=>{
  class FakeStore {
    dispatch(action){return action;}
  }
  const observer=createFundedPerfectionPassObserver({
    Store:FakeStore,
    samplerFactory:()=>({observe:()=>null,summary:()=>({})})
  });
  observer.install();
  assert.throws(()=>observer.install(),/already installed/);
  observer.restore();
  assert.equal(observer.summary().passRootCount,0);
});
