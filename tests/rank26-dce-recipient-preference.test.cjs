'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {heldDceFirstTurn,meloettaPosition,withRank26DceRecipientPreference} =
  require('../simulation/twinleaf/rank26-dce-recipient-preference.cjs');

/** @returns {{own:object,state:object}} */
function board() {
  const own = {
    energyPlayedTurn: 0,
    active: {getPokemonCard: () => ({name: 'Unown'})},
    bench: [],
    hand: {cards: [
      {name:'Double Colorless Energy'},
      {name:'Lightning Energy'}
    ]}
  };
  return {own,state:{
    turn:1,activePlayer:1,phase:12,players:[{},own],prompts:[]
  }};
}

test('held DCE protects the ordinary attachment without requiring Meloetta already in play',()=>{
  const {own,state}=board();
  assert.equal(heldDceFirstTurn(state,own,1,12),true);
  own.bench.push({getPokemonCard:()=>({name:'Meloetta ex'})});
  assert.equal(heldDceFirstTurn(state,own,1,12),true);
});

test('strictly limits first-turn source actor, phase, prompts, hand and attachment',()=>{
  const {own,state}=board();
  assert.equal(heldDceFirstTurn(state,own,0,12),false);
  assert.equal(heldDceFirstTurn(state,{...own},1,12),false);
  assert.equal(heldDceFirstTurn(state,own,1,13),false);
  state.turn=2;
  assert.equal(heldDceFirstTurn(state,own,1,12),false);
  state.turn=1;
  state.activePlayer=0;
  assert.equal(heldDceFirstTurn(state,own,1,12),false);
  state.activePlayer=1;
  state.prompts.push({result:undefined});
  assert.equal(heldDceFirstTurn(state,own,1,12),false);
  state.prompts=[];
  own.energyPlayedTurn=1;
  assert.equal(heldDceFirstTurn(state,own,1,12),false);
  own.energyPlayedTurn=0;
  own.hand.cards=[];
  assert.equal(heldDceFirstTurn(state,own,1,12),false);
});

test('locates the intended own Meloetta on Active or Bench',()=>{
  const {own}=board();
  const slots={ACTIVE:'ACTIVE',BENCH:'BENCH'};
  assert.equal(meloettaPosition(own,slots),null);
  own.bench.push({getPokemonCard:()=>({name:'Exeggcute'})});
  own.bench.push({getPokemonCard:()=>({name:'Meloetta ex'})});
  assert.deepEqual(meloettaPosition(own,slots),
    {slot:slots.BENCH,index:1});
  own.active.getPokemonCard=()=>({name:'Meloetta ex'});
  assert.deepEqual(meloettaPosition(own,slots),
    {slot:slots.ACTIVE,index:0});
});

test('rejects source-seat or executor errors before accessing compiled engine',()=>{
  assert.throws(()=>withRank26DceRecipientPreference(2,()=>{}),TypeError);
  assert.throws(()=>withRank26DceRecipientPreference(1,null),TypeError);
});
