'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {candidateTurn19Snapshot} =
  require('../simulation/twinleaf/rank15-candidate-t19-readonly.cjs');

const slot = (name, energy=[], damage=0) => ({
  getPokemonCard: () => name ? {fullName:name,stage:0,attacks:[
    {name:'Night Watch',cost:['Psychic','Psychic'],damage:'150'}]} : null,
  energies:{cards:energy.map(fullName=>({fullName}))},damage
});
function fixture(){
  const candidate={
    active:slot('Mewtwo & Mew-GX UNM',['Psychic Energy SVE']),
    bench:[slot('Dusclops SFA')],
    hand:{cards:[{fullName:'Psychic Energy SVE'}]},
    energyPlayedTurn:18,supporterTurn:0
  };
  const source={
    active:slot('Vileplume BUS'),bench:[slot('Vileplume AOR')],
    stadium:{cards:[]}
  };
  for(const player of [candidate,source]) {
    Object.defineProperties(player,{
      deck:{get(){throw Error('private deck accessed');}},
      prizes:{get(){throw Error('private Prizes accessed');}}
    });
  }
  Object.defineProperties(source,{
    hand:{get(){throw Error('opponent hand accessed');}},
    discard:{get(){throw Error('opponent discard accessed');}}
  });
  return {state:{turn:19,activePlayer:0,phase:2,prompts:[],players:[candidate,source]}};
}
test('only actor hand and public cards recorded at actual t19 root',()=>{
  const {state}=fixture();
  const x=candidateTurn19Snapshot(state,0,2);
  assert.equal(x.candidateActive.pokemon,'Mewtwo & Mew-GX UNM');
  assert.deepEqual(x.candidateActive.energy,['Psychic Energy SVE']);
  assert.deepEqual(x.candidatePrintedAttacks[0].cost,['Psychic','Psychic']);
  assert.equal(x.sourceActive.pokemon,'Vileplume BUS');
  assert.equal(x.sourceBench[0].pokemon,'Vileplume AOR');
  assert.deepEqual(x.candidateHand,['Psychic Energy SVE']);
});
test('never observes non-actor turn, unresolved prompt, or other phase',()=>{
  const {state}=fixture();
  state.activePlayer=1;
  assert.equal(candidateTurn19Snapshot(state,0,2),null);
  state.activePlayer=0;state.prompts=[{result:undefined}];
  assert.equal(candidateTurn19Snapshot(state,0,2),null);
  state.prompts=[];state.phase=1;
  assert.equal(candidateTurn19Snapshot(state,0,2),null);
  state.phase=2;state.turn=18;
  assert.equal(candidateTurn19Snapshot(state,0,2),null);
});
