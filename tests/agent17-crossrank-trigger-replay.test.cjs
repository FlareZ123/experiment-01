'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {TRIGGER_IDS,selectedArchivedTrials}=
  require('../simulation/evaluation/agent17-crossrank-trigger-replay.cjs');

test('four and only four previously executed source-trigger arms are selected',()=>{
  assert.deepEqual(TRIGGER_IDS,[
    '6:0:A:champion-reference','6:0:A:new-moon-lockbreaker-v1',
    '6:2:A:new-moon-lockbreaker-v1','11:2:B:champion-reference'
  ]);
  const arms=selectedArchivedTrials();
  assert.equal(arms.length,4);
  assert.deepEqual(arms.map(x=>x.seed),
    [407516727,407516727,2394734225,623585882]);
  assert.equal(new Set(arms.map(x=>x.seed)).size,3);
  assert(arms.every(x=>x.repeat<=2));
  assert(arms.every(x=>x.candidateSlot==='A'||x.candidateSlot==='B'));
});

test('retrospective source-trigger selection does not constitute independent games',()=>{
  const arms=selectedArchivedTrials();
  const streams=arms.map(x=>[x.rank,x.repeat,x.candidateSlot,x.seed].join(':'));
  assert.equal(new Set(streams).size,3);
  assert.equal(arms.filter(x=>x.rank===6).length,3);
  assert.equal(arms.filter(x=>x.rank===11).length,1);
});
