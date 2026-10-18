'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {firstTurnFarewellIndex, ownOpening} = require(
  '../simulation/twinleaf/newmoon-farewell-vip-bench-policy.cjs');

const TURN = 'player-turn';
/** @param {string|null} name @param {number} [energy] @param {number} [tools] */
function slot(name, energy = 0, tools = 0) {
  return {
    getPokemonCard: () => name ? {fullName:name} : undefined,
    energies:{cards:Array.from({length:energy},()=>({}))},
    tools:Array.from({length:tools},()=>({}))
  };
}
/** @param {object} [overrides] */
function fixture(overrides = {}) {
  return {
    state:{turn:1,activePlayer:1,phase:TURN,...overrides.state},
    player:{
      active:slot('Unown AOR'),
      hand:{cards:[{fullName:'Battle VIP Pass FST'},
        {fullName:'Psychic Energy MEE'}]},
      bench:[slot('Galarian Articuno V CRE'),slot('Unown AOR'),
        slot('Unown AOR'),slot(null),slot(null)],
      ...overrides.player
    }
  };
}

test('authentic first-candidate-turn board has two legal unspent Unown targets',()=>{
  const {state,player}=fixture();
  assert.equal(firstTurnFarewellIndex(state,player,1,TURN,0),1);
  assert.deepEqual(ownOpening(player),{
    active:'Unown AOR',
    hand:['Battle VIP Pass FST','Psychic Energy MEE'],
    bench:['Galarian Articuno V CRE','Unown AOR','Unown AOR',null,null],
    benchEnergyCounts:[0,0,0,0,0],
    benchToolCounts:[0,0,0,0,0],
    freeBenchSlots:2
  });
  player.bench[1]=slot(null);
  assert.equal(firstTurnFarewellIndex(state,player,1,TURN,1),2);
  player.bench[2]=slot(null);
  assert.equal(firstTurnFarewellIndex(state,player,1,TURN,2),-1);
  assert.equal(ownOpening(player).freeBenchSlots,4);
});

test('does not discard attached Energy or Tool, including one critical singleton',()=>{
  const {state,player}=fixture();
  player.bench[1]=slot('Unown AOR',1);
  player.bench[2]=slot('Unown AOR',0,1);
  assert.equal(firstTurnFarewellIndex(state,player,1,TURN,0),-1);
  player.bench[2]=slot('Unown AOR');
  assert.equal(firstTurnFarewellIndex(state,player,1,TURN,0),2);
});

test('first-own-turn scope and VIP presence are necessary',()=>{
  const {state,player}=fixture();
  assert.equal(firstTurnFarewellIndex({...state,turn:2,activePlayer:1},
    player,1,TURN,0),1,'Candidate can start globally second');
  assert.equal(firstTurnFarewellIndex({...state,turn:3},player,1,TURN,0),-1);
  assert.equal(firstTurnFarewellIndex({...state,activePlayer:0},
    player,1,TURN,0),-1);
  assert.equal(firstTurnFarewellIndex({...state,phase:'setup'},
    player,1,TURN,0),-1);
  player.hand.cards=[{fullName:'Psychic Energy MEE'}];
  assert.equal(firstTurnFarewellIndex(state,player,1,TURN,0),-1);
});

test('does not sacrifice Unown for additional slots when VIP already has room',()=>{
  const {state,player}=fixture();
  player.bench[1]=slot(null);
  assert.equal(firstTurnFarewellIndex(state,player,1,TURN,0),-1);
  assert.equal(firstTurnFarewellIndex(state,player,1,TURN,1),2,
    'Finish an already started clearing line when VIP is still in hand');
});

test('read-only pre-search K0 policy never accesses hidden deck or Prizes',()=>{
  const {state,player}=fixture();
  Object.defineProperty(state,'players',{get(){throw Error('Opponent accessed');}});
  Object.defineProperty(player,'deck',{get(){throw Error('Deck accessed');}});
  Object.defineProperty(player,'prizes',{get(){throw Error('Prizes accessed');}});
  assert.equal(firstTurnFarewellIndex(state,player,1,TURN,0),1);
  assert.equal(ownOpening(player).freeBenchSlots,2);
});
