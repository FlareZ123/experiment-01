'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  rank26FarewellBenchIndex,publicAndOwnSnapshot,
  withRank26FarewellDraw
}=require('../simulation/twinleaf/rank26-farewell-source-draw.cjs');

/** @returns {{own:object,other:object,state:object}} */
function deal(){
  const unown=()=>({
    getPokemonCard:()=>({name:'Unown',fullName:'Unown AOR'}),
    tools:[],energies:{cards:[]}
  });
  const own={
    active:{getPokemonCard:()=>({name:'Meloetta ex'})},
    bench:[unown(),unown()],
    hand:{cards:[{name:"Trainers' Mail",fullName:"Trainers' Mail ROS"}]},
    deck:{cards:[{fullName:'Double Colorless Energy SUM'}]},
    discard:{cards:[]},
    getPrizeLeft:()=>6
  };
  const other={
    active:{getPokemonCard:()=>({name:'Iron Thorns ex'})},
    getPrizeLeft:()=>6
  };
  return {own,other,state:{
    turn:1,activePlayer:1,phase:12,players:[other,own],prompts:[]
  }};
}

test('one eligible exposed Unown Bench action without inspecting deck contents',()=>{
  const {own,state}=deal();
  assert.equal(rank26FarewellBenchIndex(state,own,1,12,0),0);
  own.deck.cards[0]={fullName:'secret without public access'};
  assert.equal(rank26FarewellBenchIndex(state,own,1,12,0),0);
  assert.equal(rank26FarewellBenchIndex(state,own,1,12,1),-1);
});
test('honors held Cologne, attached resources and empty deck',()=>{
  const {own,state}=deal();
  own.hand.cards.push({name:'Canceling Cologne'});
  assert.equal(rank26FarewellBenchIndex(state,own,1,12,0),-1);
  own.hand.cards.pop();
  own.bench[0].tools.push({name:'Float Stone'});
  assert.equal(rank26FarewellBenchIndex(state,own,1,12,0),1);
  own.bench[1].energies.cards.push({name:'Lightning Energy'});
  assert.equal(rank26FarewellBenchIndex(state,own,1,12,0),-1);
  own.bench[1].energies.cards=[];
  own.deck.cards=[];
  assert.equal(rank26FarewellBenchIndex(state,own,1,12,0),-1);
});
test('never acts for other turn, seat, phase, pending prompt or active',()=>{
  const {own,state}=deal();
  state.turn=2;
  assert.equal(rank26FarewellBenchIndex(state,own,1,12,0),-1);
  state.turn=1;
  state.activePlayer=0;
  assert.equal(rank26FarewellBenchIndex(state,own,1,12,0),-1);
  state.activePlayer=1;
  assert.equal(rank26FarewellBenchIndex(state,own,0,12,0),-1);
  assert.equal(rank26FarewellBenchIndex(state,own,1,99,0),-1);
  state.prompts.push({result:undefined});
  assert.equal(rank26FarewellBenchIndex(state,own,1,12,0),-1);
  state.prompts=[];
  own.active.getPokemonCard=()=>({name:'Regidrago V'});
  assert.equal(rank26FarewellBenchIndex(state,own,1,12,0),-1);
});
test('snapshots expose owner-visible inventory and public Prize counts',()=>{
  const {own,other}=deal();
  assert.deepEqual(publicAndOwnSnapshot(own,other),{
    ownHand:["Trainers' Mail ROS"],ownDeckCount:1,
    ownBenchedUnown:2,ownDiscardUnown:0,ownPrizes:6,opponentPrizes:6
  });
});
test('invalid wrapper arguments fail before compiled-engine import',()=>{
  assert.throws(()=>withRank26FarewellDraw(4,()=>{}),TypeError);
  assert.throws(()=>withRank26FarewellDraw(1,undefined),TypeError);
});
