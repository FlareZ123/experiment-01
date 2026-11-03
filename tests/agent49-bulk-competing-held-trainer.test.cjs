'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {summarizeOwnerBulkHandTransitions}=
  require('../simulation/twinleaf/agent49-owner-bulk-hand-transitions.cjs');

test('bulk effects displace each other as competing held Trainer options',()=>{
  const hand=['Carmine TWM',"Lillie's Determination MEG",'Energy SVE'];
  const view={
    decisionKind:'owner-root',actorSeat:0,globalTurn:2,ownHand:hand,
    ownPublic:{prizeCount:6},opponentPublic:{handCount:1}
  };
  const rows=[0,1].map(handIndex=>({
    handIndex,printing:hand[handIndex],type:'Supporter'
  }));
  const result=summarizeOwnerBulkHandTransitions(view,rows,new Set([2]));
  assert.deepEqual(result.rows.map(x=>x.displacedHeldTrainerIndices),
    [[1],[0]]);
  assert.equal(result.summedCompetingTrainerCopiesDisplacedAcrossAlternatives,2);
  assert.equal(result.summedProtectedCopiesExposedAcrossAlternatives,2);
  assert.deepEqual(result.rows.map(x=>x.destination),['discard','deck']);
  assert.equal(result.countsAreCompetingHypotheticalAlternatives,true);
  assert.deepEqual(hand,['Carmine TWM',"Lillie's Determination MEG",'Energy SVE']);
});
