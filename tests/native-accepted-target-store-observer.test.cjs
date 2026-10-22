'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withAcceptedTargetWitness}=require(
  '../simulation/twinleaf/native-accepted-target-store-observer.cjs');

class AddPlayerAction{}
class PlayCardAction{
  constructor(id,handIndex,target){
    this.id=id;this.handIndex=handIndex;this.target=target;
  }
}
class FakeStore{
  constructor(){
    const slot=name=>({pokemon:name?{fullName:name}:null,
      energies:{cards:[]},tools:[],getPokemonCard(){return this.pokemon;}});
    const player=(id,name)=>({id,hand:{cards:[
      {fullName:'Darkness Energy SVE 7'}
    ]},active:slot(name),bench:[slot('Crobat V DAA 104')]});
    this.state={phase:3,turn:7,players:[
      player(100,'Garbodor BKP 57'),player(101,'Meloetta FST 124')
    ],prompts:[]};
  }
  dispatch(action){
    if(action.constructor.name==='PlayCardAction'){
      const player=this.state.players[0];
      const target=action.target.slot===1?player.active:player.bench[0];
      target.energies.cards.push(player.hand.cards[action.handIndex]);
      player.hand.cards.splice(action.handIndex,1);
    }
    if(action.constructor.name==='FailAction')throw new Error('native failure');
  }
}
class FailAction{}
function play(store,slot){
  const target={player:2,slot,index:0};
  store.dispatch(new PlayCardAction(100,0,target));
  return {rootActionLedger:[{
    actionOrdinal:49,turnBefore:7,playerSlot:0,
    action:'PlayCardAction',card:'Darkness Energy'
  }]};
}

test('real dispatch observer links accepted public Energy recipients to roots',()=>{
  const original=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  const run=()=>{const store=new FakeStore();
    store.dispatch(new AddPlayerAction());
    return play(store,2);
  };
  const wrapped=withAcceptedTargetWitness(run,{Store:FakeStore});
  assert.equal(wrapped.audit.rootOrdinalLinked,true);
  assert.equal(wrapped.audit.events.length,1);
  assert.equal(wrapped.audit.events[0].rootActionOrdinal,49);
  assert.equal(wrapped.audit.events[0].declared.target.slot,2);
  assert.deepEqual(wrapped.audit.events[0].publicBoardChanges.map(x=>x.position),
    ['bench']);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    FakeStore.prototype,'dispatch'),original);
  assert.deepEqual(run().rootActionLedger,wrapped.result.rootActionLedger);
});

test('same old accepted root labels but different targets produce distinct audit',()=>{
  const run=slot=>withAcceptedTargetWitness(()=>{
    const store=new FakeStore();
    store.dispatch(new AddPlayerAction());
    return play(store,slot);
  },{Store:FakeStore});
  const active=run(1),bench=run(2);
  assert.deepEqual(active.result.rootActionLedger,bench.result.rootActionLedger);
  assert.notEqual(active.audit.sha256,bench.audit.sha256);
  assert.equal(active.audit.events[0].rootActionOrdinal,49);
  assert.equal(bench.audit.events[0].rootActionOrdinal,49);
  assert.equal(active.audit.rootOrdinalLinked,true);
  assert.equal(bench.audit.rootOrdinalLinked,true);
});

test('native error propagates partial accepted target audit and restores prototype',()=>{
  const original=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  assert.throws(()=>withAcceptedTargetWitness(()=>{
    const store=new FakeStore();
    store.dispatch(new AddPlayerAction());
    play(store,2);
    store.dispatch(new FailAction());
  },{Store:FakeStore}),error=>{
    assert.match(error.message,/native failure/);
    const evidence=error.nativeAcceptedTargetEvidence;
    assert.equal(evidence.acceptedTargetDispatches,1);
    assert.equal(evidence.rootOrdinalLinked,false);
    assert.equal(evidence.events[0].storeAccepted,true);
    return true;
  });
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    FakeStore.prototype,'dispatch'),original);
});

test('unmatched root enumeration is explicitly unverified',()=>{
  const r=withAcceptedTargetWitness(()=>{
    const store=new FakeStore();
    store.dispatch(new AddPlayerAction());
    return {...play(store,1),rootActionLedger:[]};
  },{Store:FakeStore});
  assert.equal(r.audit.rootOrdinalLinked,false);
  assert.equal(r.audit.events[0].rootActionOrdinal,null);
});

test('same-turn accepted card roots with swapped names fail closed',()=>{
  const result=withAcceptedTargetWitness(()=>{
    const store=new FakeStore();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(100,0,{player:2,slot:1,index:0}));
    store.state.players[0].hand.cards.push({fullName:'Lightning Energy SVE 4'});
    store.dispatch(new PlayCardAction(100,0,{player:2,slot:2,index:0}));
    return {rootActionLedger:[
      {actionOrdinal:49,turnBefore:7,playerSlot:0,
        action:'PlayCardAction',card:'Lightning Energy'},
      {actionOrdinal:50,turnBefore:7,playerSlot:0,
        action:'PlayCardAction',card:'Darkness Energy'}
    ]};
  },{Store:FakeStore});
  assert.equal(result.audit.acceptedTargetDispatches,2);
  assert.equal(result.audit.rootOrdinalLinked,false);
  assert.deepEqual(result.audit.events.map(row=>row.rootActionOrdinal),
    [null,null]);
  assert.equal(result.audit.targetUnobserved,0,
    'Native target was captured even though root ordinal cannot be trusted');
});
