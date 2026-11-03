'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {run}=require('../simulation/twinleaf/agent2-muk-thorns-boostshake.cjs');

test('real Boost Shake removes active Iron Thorns Initialization via Muk on either native player seat',()=>{
  const report=run();
  console.log('AGENT2_SHAKE_THORNS_PAPER_CUSTODY',
    JSON.stringify(report.rows?.map(row=>({
      seat:row.seat,thornsActive:row.thornsActive,
      prompts:row.pendingPromptTypes,shakeInDiscard:row.shakeInDiscard,
      evolved:row.evolvedActualGrimer,
      before:row.before,after:row.after,
      turnAfter:row.turnAfter,mismatches:row.mismatches
    }))));
  assert.equal(report.status,'STAGED_NATIVE_SHAKE_PAPER_MATCH',JSON.stringify(report));
  assert.equal(report.attempts,4);
  assert.equal(report.passed,4);
  assert.equal(report.competitiveQualifiedGames,0);
  for(const row of report.rows){
    assert.equal(row.grimerPlayedTurn,row.turnAtStart);
    assert.equal(row.evolvedActualGrimer,true);
    assert.equal(row.mukLeftDeck,true);
    assert.equal(row.shakeInDiscard,true);
    assert.equal(row.ownerHandShakeDiscarded,true);
    assert.deepEqual(row.pendingPromptTypes,[]);
    assert.equal(row.turnAfter,row.turnAtStart+1);
    assert.deepEqual(row.mismatches,[]);
    assert.deepEqual(row.actions.slice(0,4),[
      'actual-Boost-Shake-PlayCardAction',
      'owner-deck-Muk-search-prompt',
      'real-Grimer-Boost-Shake-evolution-prompt',
      'owner-shuffle-resolved'
    ]);
    assert.ok(row.actions.slice(4).every(x=>x==='phase-transition-wait-resolved'));
    assert.equal(row.before.legacy.blocked,row.thornsActive);
    assert.equal(row.before.latias.blocked,row.thornsActive);
    assert.equal(row.after.thorns.blocked,true);
    assert.equal(row.after.legacy.blocked,false);
    assert.equal(row.after.latias.blocked,true);
  }
});
