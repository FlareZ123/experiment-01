'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {firstTurnDceChoice}=require('../simulation/twinleaf/rank26-firstturn-dce-reserve.cjs');
function fixture(){
  const source={energyPlayedTurn:0,hand:{cards:[{name:'Lightning Energy'},{name:'Double Colorless Energy'}]},
    active:{getPokemonCard:()=>({name:'Meloetta ex'})},
    bench:[{getPokemonCard:()=>({name:'Unown'})}]};
  const state={turn:1,phase:7,activePlayer:1,players:[{},source]};
  return {source,state};
}
test('source active Meloetta prioritizes DCE',()=>{
  const {source,state}=fixture();
  assert.deepEqual(firstTurnDceChoice(state,source,1,7),{hand:1,active:true,bench:-1});
  source.hand.cards.pop();
  assert.equal(firstTurnDceChoice(state,source,1,7),undefined);
});
test('bench target and other seat guards',()=>{
  const {source,state}=fixture();
  source.active.getPokemonCard=()=>({name:'Unown'});
  source.bench[0].getPokemonCard=()=>({name:'Meloetta ex'});
  assert.deepEqual(firstTurnDceChoice(state,source,1,7),{hand:1,active:false,bench:0});
  assert.equal(firstTurnDceChoice(state,source,0,7),null);
  source.energyPlayedTurn=1;
  assert.equal(firstTurnDceChoice(state,source,1,7),null);
});
