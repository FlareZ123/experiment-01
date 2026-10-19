'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {historicalArm,HISTORICAL_ARM_ID}=require(
  '../simulation/evaluation/agent17-rank11-mewtwo-pass-owner-context.cjs');

test('rank11 candidate-only owner diagnostics cannot broaden archived trial selection',()=>{
  const x=historicalArm();
  assert.equal(HISTORICAL_ARM_ID,'11:2:B:new-moon-lockbreaker-v1');
  assert.equal(x.id,HISTORICAL_ARM_ID);
  assert.equal(x.rank,11);
  assert.equal(x.candidateSlot,'B');
  assert.equal(x.candidateId,'new-moon-lockbreaker-v1');
  assert.equal(x.seed,623585882);
});
