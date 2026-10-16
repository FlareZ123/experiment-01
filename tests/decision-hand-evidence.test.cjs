'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {decisionHandEvidence} = require('../simulation/twinleaf/decision-hand-evidence.cjs');

function gameState() {
  return {players: [
    {id:101,hand:{cards:[{fullName:'Guzma & Hala CEC 193'},
      {fullName:'Double Colorless Energy SUM 136'}]}},
    {id:202,hand:{cards:[{fullName:'OPPONENT HIDDEN ACE SPEC'}]}}
  ]};
}

test('observes only the acting player physical printings',()=>{
  const state=gameState();
  const before=JSON.stringify(state);
  const result=decisionHandEvidence(state,0);
  assert.deepEqual(result,{
    perspectiveSeat:0,
    ownHandPrintings:['Guzma & Hala CEC 193','Double Colorless Energy SUM 136'],
    opponentHandSize:1
  });
  assert.doesNotMatch(JSON.stringify(result),/OPPONENT HIDDEN ACE SPEC/);
  assert.equal(JSON.stringify(state),before);
});

test('perspective changes with acting player and snapshots are detached',()=>{
  const state=gameState();
  const observed=decisionHandEvidence(state,1);
  assert.deepEqual(observed.ownHandPrintings,['OPPONENT HIDDEN ACE SPEC']);
  assert.equal(observed.opponentHandSize,2);
  state.players[1].hand.cards[0].fullName='CHANGED';
  assert.deepEqual(observed.ownHandPrintings,['OPPONENT HIDDEN ACE SPEC']);
  assert.doesNotMatch(JSON.stringify(observed),/Guzma & Hala/);
});

test('unattributed engine actions provide no private card identities',()=>{
  const state=gameState();
  for (const seat of [-1,2,NaN,0.5]) assert.equal(decisionHandEvidence(state,seat),null);
});
