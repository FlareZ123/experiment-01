'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,COUNT,schedule,observedSourceK0,
  withRank8AuthenticK0Observer
}=require('../simulation/twinleaf/agent44-rank8-box-k0-source-census.cjs');

/** Minimal live owner zones without hidden opponent data. */
function sourceState(){
  const own={
    hand:{cards:[
      {name:'Secret Box',fullName:'Secret Box TWM'},
      {name:'Trubbish',fullName:'Trubbish GRI'},
      {name:'Iono',fullName:'Iono PAL'},
      {name:'VS Seeker',fullName:'VS Seeker PHF'},
      {name:'Dark Patch',fullName:'Dark Patch ASR'},
      {name:'Crispin',fullName:'Crispin SCR'},
      {name:'Darkness Energy',fullName:'Darkness Energy SVE'}
    ]},
    deck:{cards:Array.from({length:47},()=>({}))},
    prizes:Array.from({length:6},()=>({cards:[{}]})),
    active:{getPokemonCard:()=>({name:'Budew',fullName:'Budew PRE'})},
    bench:Array.from({length:5},()=>({
      getPokemonCard:()=>null,tools:[]
    })),
    cannotPlayItemCards:false,cannotPlayToolCards:false
  };
  const hidden=new Proxy({},{
    get(_target,key){
      if(key==='id')return 202;
      throw Error('Opponent hidden-zone data touched: '+String(key));
    }
  });
  return {players:[own,hidden],phase:3,activePlayer:0,
    turn:1,prompts:[]};
}

test('schedule seeds and seat alternation are frozen before results',()=>{
  const rows=schedule();
  assert.equal(rows.length,COUNT);
  assert.deepEqual(rows.map(x=>x.sourceSeat).slice(0,4),[0,1,0,1]);
  assert.equal(new Set(rows.map(x=>x.seed)).size,COUNT);
  assert.equal(rows[0].seed,schedule()[0].seed);
  assert.ok(rows.every(r=>r.seed>=0&&r.seed<=0xffffffff));
});

test('K0 source snapshot owns only its own hand and face-up board',()=>{
  const state=sourceState();
  const seen=observedSourceK0(state,0);
  assert.equal(seen.turn,1);
  assert.equal(seen.ownerHandPrintings[0],'Secret Box TWM');
  assert.equal(seen.ownPrizeCount,6);
  assert.equal(seen.ownDeckCount,47);
  assert.equal(seen.offeredWindow.boxFetchShake,true);
  assert.equal(seen.offeredWindow.version.includes('agent44'),true);
  assert.ok(!JSON.stringify(seen).includes('opponent'));
});

test('read-only pinned Store wrapper captures real first source owner root once',()=>{
  class Store{
    constructor(){this.state={players:[],phase:0,activePlayer:0,
      prompts:[],turn:0};this.calls=0;}
    dispatch(action){
      this.calls++;
      return action.constructor.name;
    }
  }
  class AddPlayerAction{}
  class DummyRootAction{}
  const before=Store.prototype.dispatch;
  const {sourceK0,result,liveRootObserved}=withRank8AuthenticK0Observer(
    Store,0,()=>{
      const real=new Store();
      assert.equal(real.dispatch(new AddPlayerAction()),'AddPlayerAction');
      real.state=sourceState();
      assert.equal(real.dispatch(new DummyRootAction()),'DummyRootAction');
      assert.equal(real.dispatch(new DummyRootAction()),'DummyRootAction');
      return real.calls;
    },{GamePhase:{PLAYER_TURN:3}});
  assert.equal(result,3);
  assert.equal(liveRootObserved,true);
  assert.equal(sourceK0.offeredWindow.boxFetchShake,true);
  assert.equal(Store.prototype.dispatch,before);
  assert.equal(VERSION.includes('agent44'),true);
});

test('observer exception restores the original Store descriptor',()=>{
  class Store{dispatch(){return true;}}
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.throws(()=>withRank8AuthenticK0Observer(Store,0,()=>{
    throw Error('synthetic test failure');
  },{GamePhase:{PLAYER_TURN:3}}),/synthetic test failure/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(Store.prototype,'dispatch'),
    original);
});
