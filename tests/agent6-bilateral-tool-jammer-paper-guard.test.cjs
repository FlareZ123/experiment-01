'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,PIN,withBilateralActiveToolJammerPaperGuard
}=require('../simulation/twinleaf/agent6-bilateral-tool-jammer-paper-guard.cjs');

class ToolEffect{
  constructor(player,card){this.player=player;this.card=card;}
}
class OtherEffect{}
class Store{
  constructor(){this.normalEffects=0;}
  reduceEffect(state){
    this.normalEffects++;
    return state;
  }
}

/** @returns {object} A two-seat, entirely public board. */
function fixture(ownerSeat=0){
  const stone={fullName:'Float Stone BKT'};
  const jammer={fullName:'Tool Jammer BST'};
  const owner={id:101,active:{
    tools:[stone],getPokemonCard:()=>({fullName:'Latias ex SSP'})}};
  const opponent={id:202,active:{
    tools:[jammer],getPokemonCard:()=>({fullName:'Iron Thorns ex TWM'})},
    bench:[{tools:[]}]};
  const players=ownerSeat===0?[owner,opponent]:[opponent,owner];
  return {stone,jammer,owner,opponent,players,
    state:{players,activePlayer:ownerSeat},store:new Store()};
}
const run=(action,deps={})=>
  withBilateralActiveToolJammerPaperGuard(action,{
    Store,isToolBlocked:()=>false,...deps});

test('exactly both physical seats are symmetrically intercepted and prototype restored',()=>{
  const prior=Object.getOwnPropertyDescriptor(Store.prototype,'reduceEffect');
  const both=run(()=>{
    const packets=[];
    for(const seat of [0,1]){
      const x=fixture(seat);
      assert.throws(()=>x.store.reduceEffect(x.state,
        new ToolEffect(x.owner,x.stone)),
      /AGENT6_PAPER_ACTIVE_TOOL_JAMMER_BLOCK/);
      assert.equal(x.store.normalEffects,0);
      packets.push(seat);
    }
    return packets;
  });
  assert.deepEqual(both.result,[0,1]);
  assert.equal(both.audit.blockedQueries,2);
  assert.deepEqual(both.audit.blockedByOwnerSeat,{'0':1,'1':1});
  assert.equal(both.audit.blockedExamples.length,2);
  assert.equal(both.audit.competitivelyQualifiedGames,0);
  assert.equal(both.audit.selectedInSharedBenchmark,false);
  assert.equal(VERSION,'agent6-bilateral-active-tool-jammer-paper-guard-v1');
  assert.equal(PIN.length,40);
  assert.deepEqual(Object.getOwnPropertyDescriptor(Store.prototype,
    'reduceEffect'),prior);
});

test('inactive, Benched or self Tool Jammer does not suppress an Active Tool',()=>{
  const x=fixture(0),benchTool={fullName:'Air Balloon SSH'};
  const receipt=run(()=>{
    x.opponent.active.tools=[];
    assert.strictEqual(x.store.reduceEffect(x.state,
      new ToolEffect(x.owner,x.stone)),x.state);
    x.opponent.bench[0].tools=[x.jammer];
    assert.strictEqual(x.store.reduceEffect(x.state,
      new ToolEffect(x.owner,x.stone)),x.state);
    x.opponent.active.tools=[x.jammer];
    assert.strictEqual(x.store.reduceEffect(x.state,
      new ToolEffect(x.owner,benchTool)),x.state);
    assert.strictEqual(x.store.reduceEffect(x.state,
      new ToolEffect(x.owner,x.jammer)),x.state);
    assert.strictEqual(x.store.reduceEffect(x.state,
      new OtherEffect()),x.state);
    return x.store.normalEffects;
  });
  assert.equal(receipt.result,5);
  assert.equal(receipt.audit.blockedQueries,0);
});

test('a separately blocked opponent Jammer leaves the original tool effect active',()=>{
  const x=fixture(1),original=Store.prototype.reduceEffect;
  const receipt=run(()=>x.store.reduceEffect(x.state,
    new ToolEffect(x.owner,x.stone)),{isToolBlocked:()=>true});
  assert.strictEqual(receipt.result,x.state);
  assert.equal(receipt.audit.blockedQueries,0);
  assert.strictEqual(Store.prototype.reduceEffect,original);
});

test('nested native ToolEffect inquiry about the opposing Jammer does not recurse',()=>{
  const x=fixture(0);
  const receipt=run(()=>{
    assert.throws(()=>x.store.reduceEffect(x.state,
      new ToolEffect(x.owner,x.stone)),/PAPER_ACTIVE_TOOL_JAMMER_BLOCK/);
    return x.store.normalEffects;
  },{isToolBlocked:(store,state,player,jammer)=>{
    assert.strictEqual(player,x.opponent);
    assert.strictEqual(jammer,x.jammer);
    store.reduceEffect(state,new ToolEffect(player,jammer));
    return false;
  }});
  assert.equal(receipt.result,1);
  assert.equal(receipt.audit.blockedQueries,1);
});

test('hidden opponent hand, deck and Prizes are not consulted',()=>{
  const x=fixture(0);
  const blocked=new Proxy({},{get(){throw new Error('hidden identity read');}});
  x.owner.deck=blocked;
  x.owner.prizes=blocked;
  x.opponent.hand=blocked;
  x.opponent.deck=blocked;
  x.opponent.prizes=blocked;
  const receipt=run(()=>{
    assert.throws(()=>x.store.reduceEffect(x.state,
      new ToolEffect(x.owner,x.stone)),/PAPER_ACTIVE_TOOL_JAMMER_BLOCK/);
    return 'public-only';
  });
  assert.equal(receipt.result,'public-only');
  assert.equal(receipt.audit.blockedQueries,1);
});

test('bounded public samples and exact original method restore on exception',()=>{
  const x=fixture(0),prior=Object.getOwnPropertyDescriptor(
    Store.prototype,'reduceEffect');
  assert.throws(()=>run(()=>{
    for(let i=0;i<3;i++){
      assert.throws(()=>x.store.reduceEffect(x.state,
        new ToolEffect(x.owner,x.stone)),/PAPER_ACTIVE_TOOL_JAMMER_BLOCK/);
    }
    throw Error('native dispatch failed');
  },{exampleLimit:1}),/native dispatch failed/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(Store.prototype,
    'reduceEffect'),prior);
  assert.strictEqual(x.store.reduceEffect(x.state,
    new ToolEffect(x.owner,x.stone)),x.state);
});
