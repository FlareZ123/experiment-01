'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {mailOpportunity}=require('../simulation/twinleaf/rank26-mail-recovery.cjs');
function board(){
  const own={hand:{cards:[{name:"Trainers' Mail"},{name:'Damage Pump'}]},
    stadium:{cards:[]},active:{getPokemonCard:()=>({name:'Meloetta ex'})}};
  const other={active:{getPokemonCard:()=>({name:'Iron Thorns ex'})}};
  return {own,state:{turn:1,activePlayer:1,phase:12,players:[other,own],prompts:[]}};
}
test('source first-turn active Meloetta with held Mail after Cologne',()=>{
  const {own,state}=board();
  assert.equal(mailOpportunity(state,own,1,12),true);
});
test('held Cologne or an already drawn Stadium takes precedence',()=>{
  const {own,state}=board();
  own.hand.cards.push({name:'Canceling Cologne'});
  assert.equal(mailOpportunity(state,own,1,12),false);
  own.hand.cards.pop();
  own.hand.cards.push({name:'Risky Ruins'});
  assert.equal(mailOpportunity(state,own,1,12),false);
  own.hand.cards.pop();
  own.stadium.cards.push({name:'Risky Ruins'});
  assert.equal(mailOpportunity(state,own,1,12),false);
});
test('no cross-seat, opponent, prompt or later-turn interventions',()=>{
  const {own,state}=board();
  assert.equal(mailOpportunity(state,own,0,12),false);
  state.prompts.push({result:undefined});
  assert.equal(mailOpportunity(state,own,1,12),false);
  state.prompts=[];
  state.turn=2;
  assert.equal(mailOpportunity(state,own,1,12),false);
  state.turn=1;
  state.players[0].active.getPokemonCard=()=>({name:'Budew'});
  assert.equal(mailOpportunity(state,own,1,12),false);
});

test('starter-agnostic Mail may search before Meloetta is in play',()=>{
  const {own,state}=board();
  own.active.getPokemonCard=()=>({name:'Unown'});
  assert.equal(mailOpportunity(state,own,1,12),false,
    'The existing v1 rule still requires Active Meloetta');
  assert.equal(mailOpportunity(state,own,1,12,false),true,
    'V2 source-first Mail can use its owner hand before finding Meloetta');
  own.hand.cards.push({name:'Canceling Cologne'});
  assert.equal(mailOpportunity(state,own,1,12,false),false);
  own.hand.cards.pop();
  own.stadium.cards.push({name:'Risky Ruins'});
  assert.equal(mailOpportunity(state,own,1,12,false),false);
  own.stadium.cards=[];
  state.turn=2;
  assert.equal(mailOpportunity(state,own,1,12,false),false);
  state.turn=1;
  state.players[0].active.getPokemonCard=()=>({name:'Budew'});
  assert.equal(mailOpportunity(state,own,1,12,false),false);
});
