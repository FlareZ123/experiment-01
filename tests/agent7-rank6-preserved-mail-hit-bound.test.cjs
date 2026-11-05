'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {combinations,hitProbability,rank6}=
  require('../simulation/evaluation/agent7-rank6-preserved-mail-hit-bound.cjs');

test('combinations exact small integer checks',()=>{
  assert.equal(combinations(42,4),111930n);
  assert.equal(combinations(15,4),1365n);
  assert.equal(combinations(11,4),330n);
  assert.equal(combinations(4,4),1n);
  assert.equal(combinations(4,0),1n);
});

test('original rank6 Trainer category and conditional Mail bounds',()=>{
  const x=rank6();
  assert.equal(x.eligible,45);
  assert.equal(x.nonhits,15);
  assert.equal(x.deck,42);
  assert.ok(Math.abs(x.noOutsideEvidence-81/82)<1e-12);
  assert.ok(Math.abs(x.conditionalFourOutside-3720/3731)<1e-12);
  assert.ok(x.conditionalFourOutside>x.noOutsideEvidence);
  assert.equal(x.nativeSettlementProven,false);
  assert.equal(x.competitiveGamesQualified,0);
  console.log('AGENT7_RANK6_MAIL_BOUND '+JSON.stringify(x));
});

test('a sure hit and sure miss obey the same hypergeometric rule',()=>{
  assert.equal(hitProbability(5,1),1);
  assert.equal(hitProbability(5,5),0);
  assert.equal(hitProbability(2,0),1);
});
