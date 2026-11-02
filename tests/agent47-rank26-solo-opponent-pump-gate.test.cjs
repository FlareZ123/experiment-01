'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {
  opponentHasLiveBench
}=require('../simulation/twinleaf/rank26-exeggcute-pump-policy.cjs');

/** @param {string|null} name */
function slot(name){
  return {getPokemonCard(){return name?{name}:null;}};
}

/** @param {0|1} sourceSeat */
function stateWithOpponent(sourceSeat){
  const make=()=>({
    bench:[slot(null),slot(null)],
    get deck(){throw new Error('Hidden deck must never be read');},
    get hand(){throw new Error('Hidden hand must never be read');},
    get prizes(){throw new Error('Hidden Prize identities must never be read');}
  });
  const state={players:[make(),make()]};
  const enemy=state.players[1-sourceSeat];
  return {state,enemy};
}

test('both physical seats recognize one public opposing Benched Pokémon',()=>{
  for(const seat of [0,1]){
    const {state,enemy}=stateWithOpponent(seat);
    assert.equal(opponentHasLiveBench(state,seat),false);
    enemy.bench[1]=slot('Iron Thorns ex');
    assert.equal(opponentHasLiveBench(state,seat),true);
  }
});

test('an empty or cleared opposing Bench does not veto source donk',()=>{
  const {state,enemy}=stateWithOpponent(0);
  enemy.bench.push(slot('Regidrago V'));
  assert.equal(opponentHasLiveBench(state,0),true);
  enemy.bench.pop();
  assert.equal(opponentHasLiveBench(state,0),false);
});

test('own Bench presence alone does not affect the opponent-side veto',()=>{
  const {state}=stateWithOpponent(1);
  state.players[1].bench.push(slot('Exeggcute'));
  assert.equal(opponentHasLiveBench(state,1),false);
});
