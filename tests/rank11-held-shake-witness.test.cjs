'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {nextOpponentLockWitness} =
  require('../simulation/twinleaf/rank11-held-shake-witness.cjs');

/** @param {number} turn @param {number} activePlayer @param {number} phase @param {string} toolName */
function state(turn, activePlayer, phase, toolName = 'Float Stone') {
  return {turn, activePlayer, phase, players: [
    {id: 101, bench: [{getPokemonCard: () => ({name:'Garbodor'}),
      tools:[{name: toolName}]}]},
    {id: 202, bench:[]}
  ]};
}

test('first opposing normal turn certifies direct physical source Garbo', () => {
  assert.deepEqual(nextOpponentLockWitness(
    state(3, 1, 7), 0, 101, 2, 6, 'Float Stone', 7),
  {turn:3, opponentDecisionSeat:1, equippedGarbodor:true});
  assert.deepEqual(nextOpponentLockWitness(
    {turn:2,activePlayer:0,phase:7,players:[
      {id:101,bench:[]},
      {id:202,bench:[{getPokemonCard:()=>({name:'Garbodor'}),
        tools:[{name:'Muscle Band'}]}]}
    ]},1,202,1,6,'Muscle Band',7),
  {turn:2, opponentDecisionSeat:0,equippedGarbodor:true});
});

test('never substitute later same-owner prompt for immediate next response', () => {
  const accepted = state(3,1,7);
  assert.equal(nextOpponentLockWitness(
    accepted,0,101,2,5,'Float Stone',7),null);
  assert.equal(nextOpponentLockWitness(
    state(2,0,7),0,101,2,6,'Float Stone',7),null);
  assert.equal(nextOpponentLockWitness(
    state(3,0,7),0,101,2,6,'Float Stone',7),null);
  assert.equal(nextOpponentLockWitness(
    state(3,1,3),0,101,2,6,'Float Stone',7),null);
  assert.deepEqual(nextOpponentLockWitness(
    state(3,1,7,'Muscle Band'),0,101,2,6,'Float Stone',7),
  {turn:3,opponentDecisionSeat:1,equippedGarbodor:false});
  assert.equal(nextOpponentLockWitness(
    {turn:3,activePlayer:1,phase:7,players:[]},
    0,101,2,6,'Float Stone',7),null);
});
