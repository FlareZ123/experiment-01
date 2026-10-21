'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {publicDispatchState}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {publicPlayer}=
  require('../simulation/twinleaf/actor-observation-contract.cjs');

/** @param {string} name @returns {object} Mock printed Basic Pokémon. */
const pokemon=name=>({
  fullName:name+' Test',name,hp:90,stage:0,
  cardType:[1],retreat:[],weakness:[],resistance:[],
  attacks:[],powers:[]
});

/** @param {object|null} p @returns {object} Mock public Pokémon zone. */
const zone=p=>({
  getPokemonCard:()=>p,cards:p?[p]:[],
  energies:{cards:p?[{fullName:'Psychic Energy Test'}]:[]},
  tools:[],damage:0,pokemonPlayedTurn:1,specialConditions:[]
});

/** @param {string} name @returns {object} Player-shaped public Store zone. */
const player=name=>({
  active:zone(pokemon(name)),bench:[zone(null)],
  stadium:{cards:[]},discard:{cards:[]},lostzone:{cards:[]},
  supporter:{cards:[]},hand:{cards:[]},deck:{cards:[]},
  prizes:[{cards:[]}],usedGX:false,usedVSTAR:false
});

/** @returns {object} Two genuinely face-up public players. */
const store=()=>({state:{
  players:[player('First'),player('Second')],
  turn:2,phase:2,activePlayer:0
}});

test('native public snapshot includes both physical players after setup',()=>{
  const actual=publicDispatchState(store());
  assert.deepEqual(actual.activePrintings,['First Test','Second Test']);
  assert.deepEqual(actual.attachedEnergyCounts,[1,1]);
  assert.deepEqual(actual.benchCounts,[0,0]);
  assert.equal(actual.publicZonesSha256.length,64);
});

test('second player public Energy mutation changes original Store snapshot',()=>{
  const game=store();
  const before=publicDispatchState(game);
  game.state.players[1].active.energies.cards.push(
    {fullName:'Double Colorless Energy Test'});
  const after=publicDispatchState(game);
  assert.deepEqual(after.attachedEnergyCounts,[1,2]);
  assert.notEqual(after.publicZonesSha256,before.publicZonesSha256);
  assert.deepEqual(after.activePrintings,['First Test','Second Test']);
});

test('face-down visibility still requires explicit hide flag',()=>{
  const second=player('Second');
  const hidden=publicPlayer(second,true);
  const publicView=publicPlayer(second);
  assert.deepEqual(hidden.active,{concealed:true});
  assert.equal(hidden.active.printing,undefined);
  assert.equal(publicView.active.printing,'Second Test');
});
