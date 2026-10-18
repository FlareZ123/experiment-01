'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  rank26DceReservationOpportunity,
  withRank26DceReservation
} = require('../simulation/twinleaf/rank26-dce-reservation.cjs');

/** @returns {{own:object,state:object}} */
function firstTurnBoard() {
  const own = {
    energyPlayedTurn: 0,
    active: {getPokemonCard: () => ({name:'Meloetta ex'})},
    hand: {cards: [{name:'Lightning Energy'}, {name:'Double Colorless Energy'}]}
  };
  const defender = {active:{getPokemonCard:()=>({name:'Iron Thorns ex'})}};
  return {
    own,
    state: {
      turn:1, activePlayer:1, phase:12,
      players:[defender,own],prompts:[]
    }
  };
}

test('eligible before the first own-turn ordinary Energy attachment', () => {
  const {own,state}=firstTurnBoard();
  assert.equal(rank26DceReservationOpportunity(state,own,1,12),true);
  own.hand.cards=[];
  assert.equal(rank26DceReservationOpportunity(state,own,1,12),true,
    'reservation does not infer hidden Energy or demand a held DCE');
});

test('rejects exhausted turn, wrong turn, seat and active Pokémon', () => {
  const {own,state}=firstTurnBoard();
  own.energyPlayedTurn=1;
  assert.equal(rank26DceReservationOpportunity(state,own,1,12),false);
  own.energyPlayedTurn=0;
  state.turn=2;
  assert.equal(rank26DceReservationOpportunity(state,own,1,12),false);
  state.turn=1;
  state.activePlayer=0;
  assert.equal(rank26DceReservationOpportunity(state,own,1,12),false);
  state.activePlayer=1;
  assert.equal(rank26DceReservationOpportunity(state,own,0,12),false);
  own.active.getPokemonCard=()=>({name:'Regidrago VSTAR'});
  assert.equal(rank26DceReservationOpportunity(state,own,1,12),false);
});

test('rejects pending prompt, mismatched seat-player object and phase', () => {
  const {own,state}=firstTurnBoard();
  state.prompts.push({result:undefined});
  assert.equal(rank26DceReservationOpportunity(state,own,1,12),false);
  state.prompts=[];
  assert.equal(rank26DceReservationOpportunity(state,{...own},1,12),false);
  assert.equal(rank26DceReservationOpportunity(state,own,1,999),false);
  assert.equal(rank26DceReservationOpportunity(state,undefined,1,12),false);
});

test('rejects missing engine setup arguments before patching bot',()=>{
  assert.throws(()=>withRank26DceReservation(2,()=>{}),TypeError);
  assert.throws(()=>withRank26DceReservation(1,null),TypeError);
});
