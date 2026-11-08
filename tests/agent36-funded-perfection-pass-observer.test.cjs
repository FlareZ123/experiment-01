'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createFundedPerfectionPassObserver,sanitizePostPassProbe,sanitizeHeldTelepathProbe}=require('../simulation/twinleaf/agent36-funded-perfection-pass-observer.cjs');

test('funded Perfection observer probes the immutable owner pre-Pass state',()=>{
  class PassTurnAction {}
  class DrawCardAction {}
  class FakeStore {
    constructor(state){this.state=state;}
    dispatch(action) {
      if(action instanceof PassTurnAction) {
        this.state.activePlayer=1;
        this.state.players[0].canEvolve=false;
      }
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
    Store:FakeStore,deepClone:structuredClone,
    deepCloneImplementation:'test structuredClone',maxRecords:4,samplerFactory
  });
  observer.install();
  const state={activePlayer:0,players:[{id:'owner-0',canEvolve:true},{id:'owner-1'}]};
  const store=new FakeStore(state);
  const action=new PassTurnAction();
  const result=store.dispatch(action);
  const sample=observer.onRootActionDispatched(store,action,17,0,6);
  observer.restore();

  assert.equal(result.accepted,true);
  assert.equal(calls.length,1);
  assert.notEqual(calls[0].state,state);
  assert.notEqual(calls[0].state.players[0],state.players[0]);
  assert.equal(calls[0].state.activePlayer,0);
  assert.equal(calls[0].state.players[0].canEvolve,true);
  assert.equal(state.activePlayer,1);
  assert.equal(state.players[0].canEvolve,false);
  assert.equal(calls[0].playerId,'owner-0');
  assert.equal(calls[0].actionName,'PassTurnAction');
  assert.equal(calls[0].actionOrdinal,17);
  assert.equal(calls[0].maxRecords,4);
  assert.deepEqual(sample,{actionOrdinal:17,playerId:'owner-0'});
  assert.equal(observer.summary().passRootCount,1);
  assert.equal(observer.summary().missingPreStateCount,0);
  assert.equal(observer.summary().preDispatchCloneErrorCount,0);
  assert.equal(observer.summary().preDispatchStateDetached,true);
  assert.equal(observer.summary().deepCloneImplementation,'test structuredClone');
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
    Store:FakeStore,deepClone:structuredClone,
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
    Store:FakeStore,deepClone:structuredClone,
    samplerFactory:()=>({observe:()=>null,summary:()=>({})})
  });
  observer.install();
  assert.throws(()=>observer.install(),/already installed/);
  observer.restore();
  assert.equal(observer.summary().passRootCount,0);
});

test('funded Perfection observer redacts arbitrary native probe error strings',()=>{
  const probe=sanitizePostPassProbe({
    evidenceType:'post-choice-cloned-perfection-attack-menu-v1',
    validAttackNames:['Miraculous Duo'],
    rejection:'private opponent card identity leaked by engine error',
    auditError:'another hidden card identity'
  });
  assert.deepEqual(probe.validAttackNames,['Miraculous Duo']);
  assert.equal(probe.rejectionPresent,true);
  assert.equal(probe.auditErrorPresent,true);
  assert.equal(Object.hasOwn(probe,'rejection'),false);
  assert.equal(Object.hasOwn(probe,'auditError'),false);
  const held=sanitizeHeldTelepathProbe({
    nativeAccepted:false,
    physicalEnergyAttached:false,
    nativeRejection:'private hidden card name in exception'
  });
  assert.equal(held.nativeRejectionPresent,true);
  assert.equal(Object.hasOwn(held,'nativeRejection'),false);
});


test('physical owner ID zero is a valid native Pass root',()=>{
  class PassTurnAction {}
  class Store {
    constructor(){this.state={players:[{id:0},{id:1}]};}
    dispatch(action){return action;}
  }
  const before=Store.prototype.dispatch;
  let observedPlayer=null;
  const observer=createFundedPerfectionPassObserver({
    Store,deepClone:structuredClone,
    samplerFactory:()=>({
      observe(_state,id){observedPlayer=id;return {actorPlayerId:id};},
      summary(){return {};}
    })
  });
  observer.install();
  const store=new Store();
  const action=new PassTurnAction();
  store.dispatch(action);
  const sample=observer.onRootActionDispatched(store,action,0,0,1);
  observer.restore();
  assert.strictEqual(observedPlayer,0);
  assert.deepEqual(sample,{actorPlayerId:0});
  assert.strictEqual(Store.prototype.dispatch,before);
});

test('out-of-order restore refuses to overwrite a younger Store wrapper',()=>{
  class Store {dispatch(action){return action;}}
  const base=Store.prototype.dispatch;
  const make=()=>createFundedPerfectionPassObserver({
    Store,deepClone:structuredClone,
    samplerFactory:()=>({observe(){return null;},summary(){return {};}})
  });
  const older=make();
  older.install();
  const olderWrapper=Store.prototype.dispatch;
  const newer=make();
  newer.install();
  const newerWrapper=Store.prototype.dispatch;
  assert.notStrictEqual(olderWrapper,newerWrapper);
  assert.throws(()=>older.restore(),/later Store wrapper is active/);
  assert.strictEqual(Store.prototype.dispatch,newerWrapper);
  newer.restore();
  assert.strictEqual(Store.prototype.dispatch,olderWrapper);
  older.restore();
  assert.strictEqual(Store.prototype.dispatch,base);
});
