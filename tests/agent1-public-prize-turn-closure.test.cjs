'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  VERSION,publicPrizes,withPublicPrizeTurnClosures
}=require('../simulation/twinleaf/agent1-public-prize-turn-closure.cjs');

function prizes(remaining){
  return Array.from({length:6},(_,i)=>({
    cards:i<remaining?[{id:i}]:[]
  }));
}

class MockStore{
  constructor(){
    this.state={turn:1,players:[{prizes:prizes(6)},{prizes:prizes(6)}]};
  }
  dispatch(action){
    if(action.kind==='pass')this.state={
      turn:this.state.turn+1,
      players:[{prizes:prizes(action.source)},
        {prizes:prizes(action.recipient)}]
    };
    if(action.kind==='failure')throw Error('native-store-rejected');
    return this.state.turn;
  }
}

test('only public still-populated Prize cards count',()=>{
  assert.deepEqual(publicPrizes({players:[
    {prizes:prizes(1)},{prizes:prizes(5)}
  ]}),[1,5]);
  assert.equal(publicPrizes({players:[]}),null);
  assert.equal(publicPrizes(null),null);
});

test('pure Store wrapper records authentic turn closures and restores prototype',()=>{
  const original=Object.getOwnPropertyDescriptor(MockStore.prototype,'dispatch');
  const reply=withPublicPrizeTurnClosures(()=>{
    const store=new MockStore();
    assert.equal(store.dispatch({kind:'pass',source:5,recipient:6}),2);
    assert.equal(store.dispatch({kind:'pass',source:5,recipient:4}),3);
    assert.equal(store.dispatch({kind:'pass',source:2,recipient:4}),4);
    return 'native-unchanged';
  },{Store:MockStore});
  assert.equal(reply.result,'native-unchanged');
  assert.equal(reply.audit.version,VERSION);
  assert.equal(reply.audit.transitionCount,3);
  assert.equal(reply.audit.observedClosureCount,3);
  assert.deepEqual(reply.audit.closures.map(x=>x.turnClosed),[1,2,3]);
  assert.deepEqual(reply.audit.closures.map(x=>x.afterPrizes),
    [[5,6],[5,4],[2,4]]);
  assert.deepEqual(reply.audit.closures.map(x=>x.afterSecondStarterTurn),
    [false,true,false]);
  assert.ok(reply.audit.closures.every(x=>
    x.paperTimeCallObserved===false&&
    x.postFinalCheckupExcluded===false));
  assert.equal(reply.audit.paperClockCertified,false);
  assert.deepEqual(
    Object.getOwnPropertyDescriptor(MockStore.prototype,'dispatch'),
    original);
});

test('Store exception propagates and prototype is restored',()=>{
  const original=Object.getOwnPropertyDescriptor(MockStore.prototype,'dispatch');
  assert.throws(()=>withPublicPrizeTurnClosures(()=>{
    new MockStore().dispatch({kind:'failure'});
  },{Store:MockStore}),/native-store-rejected/);
  assert.deepEqual(
    Object.getOwnPropertyDescriptor(MockStore.prototype,'dispatch'),
    original);
});
