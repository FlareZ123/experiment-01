'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {developmentTrials}=require(
  '../simulation/evaluation/agent41-bilateral-v2-development.cjs');

test('only historical source streams enter the policy development packet',()=>{
  const rows=developmentTrials();
  assert.equal(rows.length,4);
  assert.deepEqual(rows.map(row=>row.id).sort(),[
    '11:2:B:champion-reference',
    '11:2:B:new-moon-lockbreaker-v1',
    '6:0:A:champion-reference',
    '6:0:A:new-moon-lockbreaker-v1'
  ].sort());
  const seeds=new Set(rows.map(row=>[row.rank,row.repeat,row.candidateSlot,
    row.seed].join(':')));
  assert.equal(seeds.size,2,'Each source stream has two dependent candidates');
  assert.ok(rows.every(row=>[6,11].includes(row.rank)));
});

test('no seed or candidate appears outside the immutable v1 manifest',()=>{
  const {scheduledArms}=require(
    '../simulation/evaluation/agent41-crossrank-actual-decisions.cjs');
  const idToSeed=new Map(scheduledArms().map(row=>[row.id,row.seed]));
  for(const row of developmentTrials()) {
    assert.equal(row.seed,idToSeed.get(row.id));
  }
});
