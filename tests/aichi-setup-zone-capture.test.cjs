'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {openingSetupZones}=require('../simulation/twinleaf/opening-setup-zones.cjs');
const {captureSourceSetup}=require('../simulation/evaluation/aichi-setup-zone-capture.cjs');

/** @param {string[]} names */
const zone=names=>({cards:names.map(fullName=>({fullName}))});
const player=id=>({
  id,hand:zone(['Hand-'+id]),active:zone(['Active-'+id]),
  bench:[zone(['Bench-'+id])],
  prizes:Array.from({length:6},(_,i)=>zone(['Prize-'+id+'-'+i])),
  deck:zone(['Deck-'+id])
});

test('real-turn setup observer captures detached hidden zones without inferring initial seven',()=>{
  const state={turn:1,activePlayer:1,players:[player(101),player(202)]};
  const observation=openingSetupZones(state);
  assert.equal(observation.schema,'pinned-root-postsetup-zones-v1');
  assert.equal(observation.firstTurnSlot,1);
  assert.equal(observation.originalStartingSevenReconstructed,false);
  assert.equal(observation.containsUnrevealedPrizeIdentities,true);
  assert.deepEqual(observation.seats[0].prizes[3],['Prize-101-3']);
  state.players[0].hand.cards[0].fullName='Mutated';
  assert.deepEqual(observation.seats[0].hand,['Hand-101']);
  assert.equal(openingSetupZones({...state,turn:0}),null);
  assert.throws(()=>openingSetupZones({...state,activePlayer:2}),/Store layout/);
});

test('source Store wrapper captures first turn once and restores dispatch on success and exception',()=>{
  class MockStore {
    constructor(){this.state={turn:0,activePlayer:0,players:[player(101),player(202)]};}
    dispatch(action) {
      if(action==='start')this.state.turn=1;
      if(action==='later')this.state.players[0].hand.cards[0].fullName='Later';
      return action;
    }
  }
  const original=MockStore.prototype.dispatch;
  const {game,setupZones}=captureSourceSetup(MockStore,()=>{
    const store=new MockStore();
    store.dispatch('start');
    store.dispatch('later');
    return {finished:false};
  });
  assert.equal(game.finished,false);
  assert.deepEqual(setupZones.seats[0].hand,['Hand-101']);
  assert.equal(MockStore.prototype.dispatch,original);
  assert.throws(()=>captureSourceSetup(MockStore,()=>{throw new Error('Probe failed');}),
    /Probe failed/);
  assert.equal(MockStore.prototype.dispatch,original);
});
