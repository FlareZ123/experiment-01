'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {comb,run}=require('../simulation/evaluation/agent4-opening-basic-role-hypergeom.cjs');
/** @param {number} actual @param {number} expected */
function close(actual,expected){
  assert.ok(Math.abs(actual-expected)<1e-7,
    'expected '+expected+'; got '+actual);
}
test('exact combinatorial counts',()=>{
  assert.equal(comb(60,7),386206920);
  assert.equal(comb(60,0),1);
  assert.equal(comb(4,7),0);
  assert.equal(comb(14,1),14);
});
test('rank1 Shadow Rider exact source Basic opening coverage',()=>{
  const [r1]=run();
  assert.equal(r1.rank,1);
  assert.equal(r1.totalBasics,14);
  assert.equal(r1.mainCount,3);
  assert.equal(r1.triggerCopies,3);
  close(r1.pMulligan,0.1385906808712801);
  close(r1.pTwoOrMoreBasicsGivenValid,0.60582);
  close(r1.extraBasicsUnusedGivenValid,0.89612);
  close(r1.pMainSelectedFirstEligible,3/14);
  close(r1.pMainPresentGivenValid,0.36617850114);
  close(r1.pTriggerAndOtherBasicGivenValid,0.2688607002);
});
test('rank5 Mew Genesect exact source Basic opening coverage',()=>{
  const [,r5]=run();
  assert.equal(r5.rank,5);
  assert.equal(r5.totalBasics,11);
  assert.equal(r5.mainCount,4);
  assert.equal(r5.triggerCopies,2);
  close(r5.pMulligan,0.2224211414958592);
  close(r5.pTwoOrMoreBasicsGivenValid,0.48778);
  close(r5.extraBasicsUnusedGivenValid,0.65042);
  close(r5.pMainSelectedFirstEligible,4/11);
  close(r5.pMainPresentGivenValid,0.5137737753);
  close(r5.pTriggerAndOtherBasicGivenValid,0.18533846718);
});
