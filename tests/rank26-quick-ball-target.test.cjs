'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {preferredMeloetta} = require('../simulation/twinleaf/rank26-quick-ball-target.cjs');

function fixture() {
  const m = {name: 'Meloetta ex', fullName: 'Meloetta ex BLK'};
  const b = {name: 'Bunnelby', fullName: 'Bunnelby PRC'};
  const deck = {cards: [b, m]};
  const own = {id:202, deck, hand:{cards:[]},
    active:{getPokemonCard:()=>({name:'Unown'})},
    bench:[{getPokemonCard:()=>null}]};
  const state = {turn:1,activePlayer:1,phase:12,
    players:[{id:101},own]};
  const prompt = {id:21,playerId:202,cards:deck,
    validate:(arr)=>arr.length===1&&arr[0]===m};
  Object.defineProperty(prompt,'constructor',{value:{name:'ChooseCardsPrompt'}});
  return {m,deck,own,state,prompt};
}
test('only real owner-deck search may select missing Meloetta',()=>{
  const {m,own,state,prompt}=fixture();
  assert.equal(preferredMeloetta(state,own,1,prompt,12),m);
});
test('no wrong seat, phase, turn, owner or non-deck search',()=>{
  const {own,state,prompt}=fixture();
  assert.equal(preferredMeloetta(state,own,0,prompt,12),null);
  state.turn=2;
  assert.equal(preferredMeloetta(state,own,1,prompt,12),null);
  state.turn=1; state.phase=13;
  assert.equal(preferredMeloetta(state,own,1,prompt,12),null);
  state.phase=12;
  assert.equal(preferredMeloetta(state,{...own},1,prompt,12),null);
  prompt.cards={cards:own.deck.cards};
  assert.equal(preferredMeloetta(state,own,1,prompt,12),null);
});
test('respects held, active and Benched Meloetta',()=>{
  const {m,own,state,prompt}=fixture();
  own.hand.cards.push(m);
  assert.equal(preferredMeloetta(state,own,1,prompt,12),null);
  own.hand.cards.pop();
  own.active.getPokemonCard=()=>m;
  assert.equal(preferredMeloetta(state,own,1,prompt,12),null);
  own.active.getPokemonCard=()=>({name:'Unown'});
  own.bench[0].getPokemonCard=()=>m;
  assert.equal(preferredMeloetta(state,own,1,prompt,12),null);
});
test('prized, missing or invalid target falls back to default bot',()=>{
  const {m,own,state,prompt}=fixture();
  own.deck.cards=[{name:'Bunnelby'}];
  assert.equal(preferredMeloetta(state,own,1,prompt,12),null);
  own.deck.cards.push(m);
  prompt.validate=()=>false;
  assert.equal(preferredMeloetta(state,own,1,prompt,12),null);
  prompt.playerId=101;
  assert.equal(preferredMeloetta(state,own,1,prompt,12),null);
});
