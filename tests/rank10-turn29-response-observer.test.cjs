'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {publicResponseBoard,withTurn29ResponseObserver}=
  require('../simulation/twinleaf/rank10-turn29-response-observer.cjs');
const mkSlot=name=>({
  getPokemonCard:()=>({fullName:name,attacks:[{name:'Test Attack',cost:[],damage:0}]}),
  energies:{cards:[]},tools:[],damage:0
});
const mkState=secret=>({turn:29,activePlayer:0,
  players:[0,1].map((seat)=>({
    id:100+seat,active:mkSlot('Active '+seat),bench:[],
    hand:{cards:[{fullName:secret}]},deck:{cards:[]},
    prizes:[],stadium:{cards:[]},usedGX:false,usedVSTAR:false,
    retreatedTurn:0,energyPlayedTurn:0
  }))
});
test('public projection is invariant to unrevealed card identity',()=>{
  assert.deepEqual(publicResponseBoard(mkState('HIDDEN-1')),
    publicResponseBoard(mkState('HIDDEN-2')));
});
test('captures only authentic Store and restores wrapper',()=>{
  class AddPlayerAction{}
  class RetreatAction{}
  class PassTurnAction{}
  class Store {
    constructor(s){this.state=s;this.history=[];}
    dispatch(a){this.history.push(a.constructor.name);}
  }
  const original=Store.prototype.dispatch;
  const live=new Store(mkState('secret')),sim=new Store(mkState('other'));
  const x=withTurn29ResponseObserver(Store,()=>{
    live.dispatch(new AddPlayerAction());
    sim.dispatch(new PassTurnAction());
    live.dispatch(new RetreatAction());
    live.dispatch(new PassTurnAction());
    return 42;
  },{zoneDigest:()=> 'test'});
  assert.equal(x.result,42);
  assert.equal(x.rootDispatchCount,3);
  assert.deepEqual(x.events.map(e=>[e.ordinal,e.action]),[
    [1,'RetreatAction'],[2,'PassTurnAction']]);
  assert.equal(Store.prototype.dispatch,original);
  assert.ok(!JSON.stringify(x.events).includes('secret'));
});
test('restores dispatch on thrown source failure',()=>{
  class AddPlayerAction{}
  class Store{constructor(){this.state=mkState('private')}dispatch(){}}
  const original=Store.prototype.dispatch;
  assert.throws(()=>withTurn29ResponseObserver(Store,()=>{
    new Store().dispatch(new AddPlayerAction());
    throw Error('failed source');
  },{zoneDigest:()=> 'test'}),/failed source/);
  assert.equal(Store.prototype.dispatch,original);
});
