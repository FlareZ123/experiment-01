'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {registration,schedule,decks,summarize}=
  require('../simulation/evaluation/agent19-dual-mew-original-opportunity.cjs');

test('preregistered rank3/7 physical seeds are independent and complete',()=>{
  const rows=schedule();
  assert.equal(rows.length,16);
  assert.equal(new Set(rows.map(r=>r.seed)).size,16);
  assert.deepEqual(rows.map(x=>x.rank),Array(8).fill(3).concat(Array(8).fill(7)));
  assert.deepEqual(rows.filter(x=>x.seat===0).map(x=>x.repeat),
    [0,1,2,3,0,1,2,3]);
  assert.equal(registration.maxNativeRootActionsPerDeal,200);
});

test('same shared original full-60 resolver accepts rank5 against both Snorlax 60s',()=>{
  const original=decks();
  assert.equal(original.mew.length,60);
  assert.equal(original.others[3].length,60);
  assert.equal(original.others[7].length,60);
  assert.equal(original.mew.filter(x=>x==='Mew VMAX FST').length,3);
  assert.equal(original.others[3].filter(x=>x==='Mimikyu PAL').length,1);
  assert.equal(original.others[7].filter(x=>x==='Mimikyu PAL').length,3);
});

test('summary retains native errors and action caps in opportunity denominator',()=>{
  const rows=[{status:'native-error'},{status:'action-cap-or-incomplete',
    monitor:{dualBoard:1,dualWithDce:0,dualVsPal:0,
      fullPublicBoard:0,actualOfferedMirror:0}},
    {status:'engine-terminal',monitor:{dualBoard:1,dualWithDce:1,dualVsPal:1,
      fullPublicBoard:1,actualOfferedMirror:1}}];
  const summary=summarize(rows);
  assert.equal(summary.attempts,3);
  assert.equal(summary.nativeErrors,1);
  assert.equal(summary.actionCaps,1);
  assert.equal(summary.twoMewBoards,2);
  assert.equal(summary.offeredCopyMenus,1);
  assert.equal(summary.qualifiedCompetitiveGames,0);
});
