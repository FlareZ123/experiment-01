'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const { run }=require('../simulation/twinleaf/agent2-muk-wobbuffet-native-order.cjs');

test('official Japanese Muk-after-Active-Wobbuffet ruling matches pinned native Store after real hand evolution',()=>{
  const data=run();
  assert.equal(data.attempted,4,'Missing native cards or incomplete two-seat matrix: '+JSON.stringify(data));
  assert.equal(data.matches,4,'Pinned card precedence mismatch: '+JSON.stringify(data.rows?.filter(x=>!x.nativePaperAgreement)));
  assert.equal(data.status,'PINNED_STAGED_PAPER_MATCH');
  assert.equal(data.staged,true);
  assert.equal(data.realHandEvolution,true);
  assert.equal(data.qualifiedCompetitiveGames,0);
  for(const row of data.rows){
    assert.equal(row.actualHandPlayAccepted,true);
    assert.equal(row.actualGrimerEvolved,true);
    assert.equal(row.mukRemovedFromOwnerHand,true);
    assert.deepEqual(row.discrepancies,[]);
  }
});
