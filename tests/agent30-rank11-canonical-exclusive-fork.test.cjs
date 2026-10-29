'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {selectedTrials}=require(
  '../simulation/evaluation/agent30-rank11-canonical-exclusive-fork.cjs');
const registration=require(
  '../results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json');

test('retrospective line fork retains both registered source-opponent 60s',()=>{
  const rows=selectedTrials();
  assert.equal(rows.length,2);
  assert.deepEqual(rows.map(row=>row.id),[
    '11:3:A:champion-reference',
    '11:3:A:new-moon-lockbreaker-v1'
  ]);
  assert.ok(rows.every(row=>row.seed===2307728896&&
    row.rank===11&&row.repeat===3&&row.candidateSlot==='A'));
  assert.equal(registration.maxRootActions,260);
  assert.equal(registration.frozenRunOptions.paperSupporterQuota,true);
});
