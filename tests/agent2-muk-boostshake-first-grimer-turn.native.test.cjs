'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {run}=require('../simulation/twinleaf/agent2-muk-wobbuffet-boostshake.cjs');

test('real source-printed Boost Shake evolves newly-played Grimer and applies official Wobbuffet cascade on both seats',()=>{
  const report=run();
  assert.equal(report.status,'STAGED_NATIVE_SHAKE_PAPER_MATCH',
    'Native Shake/paper mismatch: '+JSON.stringify(report));
  assert.equal(report.attempts,4);
  assert.equal(report.passed,4);
  assert.equal(report.competitiveQualifiedGames,0);
  for(const row of report.rows){
    assert.equal(row.grimerPlayedTurn,row.turnAtStart);
    assert.equal(row.evolvedActualGrimer,true);
    assert.equal(row.mukLeftDeck,true);
    assert.equal(row.shakeInDiscard,true);
    assert.equal(row.ownerHandShakeDiscarded,true);
    assert.deepEqual(row.mismatches,[]);
    assert.deepEqual(row.actions,[
      'actual-Boost-Shake-PlayCardAction',
      'owner-deck-Muk-search-prompt',
      'real-Grimer-Boost-Shake-evolution-prompt'
    ]);
  }
});
