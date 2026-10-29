'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const plan=require('../results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json');
const {
  firstCoinSample,predictedPinnedStart,classifySeedGroups
}=require('../simulation/evaluation/agent30-pinned-starter-strata.cjs');

test('pinned xorshift first coin sample is repeatable and range safe',()=>{
  assert.equal(firstCoinSample(1460221882)<0.5,true);
  assert.equal(firstCoinSample(651983417)>=0.5,true);
  assert.equal(firstCoinSample(1460221882),firstCoinSample(1460221882));
  assert.ok(firstCoinSample(0)>=0&&firstCoinSample(0)<1);
  assert.ok(firstCoinSample(0xffffffff)>=0&&firstCoinSample(0xffffffff)<1);
  for(const invalid of [-1,2**32,1.5,NaN,'1',null]) {
    assert.throws(()=>firstCoinSample(invalid));
  }
});

test('pinned bot elected second after coin win, physical seat is independent',()=>{
  assert.deepEqual(
    {winner:predictedPinnedStart(1460221882,'A').coinWinner,
      first:predictedPinnedStart(1460221882,'A').predictedFirst,
      sourceFirst:predictedPinnedStart(1460221882,'A').sourceFirst},
    {winner:'A',first:'B',sourceFirst:true});
  assert.deepEqual(
    {winner:predictedPinnedStart(651983417,'B').coinWinner,
      first:predictedPinnedStart(651983417,'B').predictedFirst,
      sourceFirst:predictedPinnedStart(651983417,'B').sourceFirst},
    {winner:'B',first:'A',sourceFirst:true});
  assert.throws(()=>predictedPinnedStart(123,'C'));
});

test('fresh 16 independent seeds reproduce all observed source-first strata',()=>{
  const rows=classifySeedGroups(plan);
  assert.equal(rows.length,16);
  const count=(rank,seat)=>rows.filter(row=>
    row.rank===rank&&row.candidateSlot===seat&&row.sourceFirst).length;
  assert.equal(count(6,'A'),3);
  assert.equal(count(6,'B'),4);
  assert.equal(count(11,'A'),2);
  assert.equal(count(11,'B'),4);
  assert.equal(rows.filter(row=>row.sourceFirst).length,13);
  assert.equal(rows.filter(row=>row.rank===11&&row.sourceFirst).length,6);
  assert.equal(rows.filter(row=>row.candidateSlot==='B'&&row.sourceFirst).length,8);
});

test('seed classifier rejects overlapping independent groups',()=>{
  assert.throws(()=>classifySeedGroups({
    ranks:[6],candidateSlots:['A','B'],
    seeds:{'6':{A:[2],B:[2]}}
  }),/Seed reused/);
});
