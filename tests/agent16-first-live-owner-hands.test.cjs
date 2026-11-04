'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createFirstLiveOwnerHandsObserver}=require('../simulation/twinleaf/agent16-first-live-owner-hands.cjs');

/** @param {number} turn @param {number} activePlayer @param {string[]} a @param {string[]} b @param {string} phase */
function state(turn,activePlayer,a,b,phase='PLAYER_TURN'){
  return {turn,activePlayer,phase,players:[a,b].map(cards=>({hand:{cards:cards.map(fullName=>({fullName}))}}))};
}
test('setup and unresolved prompts cannot supply first-live-turn fingerprint',()=>{
  const o=createFirstLiveOwnerHandsObserver({playerTurnPhase:'PLAYER_TURN'});
  o.observe(state(0,0,['Setup Card'],['Opponent'],'SETUP'),0,null);
  o.observe(state(1,0,['Prompt Card'],['Opponent']),1,{id:10});
  assert.deepEqual(o.result().bySeat,[null,null]);
});
test('first player is recorded before bot can consume cards and is immutable',()=>{
  const o=createFirstLiveOwnerHandsObserver({playerTurnPhase:'PLAYER_TURN'});
  const root=state(1,0,['Boost Shake EVS 142','Muscle Band XY 121','Drawn Energy'],['Other']);
  o.observe(root,3,null);
  root.players[0].hand.cards.pop();
  o.observe(root,4,null);
  assert.deepEqual(o.result().bySeat[0].ownHandPrintings,
    ['Boost Shake EVS 142','Muscle Band XY 121','Drawn Energy']);
  assert.equal(o.result().bySeat[0].actionOrdinal,3);
});
test('second owner hand includes actual mulligan compensation at global turn 2',()=>{
  const o=createFirstLiveOwnerHandsObserver({playerTurnPhase:'PLAYER_TURN'});
  o.observe(state(1,0,['First owner'],['Precompensation']),1,null);
  o.observe(state(2,1,['First owner'],['Precompensation','Mulligan Bonus']),8,null);
  assert.deepEqual(o.result().bySeat[1].ownHandPrintings,
    ['Precompensation','Mulligan Bonus']);
  assert.equal(o.result().bySeat[1].turn,2);
});
test('later turns or reset cannot overwrite original prebot evidence',()=>{
  const o=createFirstLiveOwnerHandsObserver({playerTurnPhase:'PLAYER_TURN'});
  o.observe(state(1,1,['Other'],['Initial']),10,null);
  o.observe(state(2,0,['Opening second'],['Initial']),20,null);
  o.observe(state(1,1,['New other'],['Replay']),500,null);
  assert.equal(o.result().bySeat[1].actionOrdinal,10);
  assert.deepEqual(o.result().bySeat[1].ownHandPrintings,['Initial']);
});
test('no first own turn yields null, never a setup substitute',()=>{
  const o=createFirstLiveOwnerHandsObserver({playerTurnPhase:'PLAYER_TURN'});
  o.observe(state(1,0,['Winner'],['Unplayed']),9,null);
  assert.equal(o.result().bySeat[1],null);
});
