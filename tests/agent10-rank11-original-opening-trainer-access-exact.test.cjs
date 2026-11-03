'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {choose,exactOpeningTrainerAccess}=
  require('../simulation/evaluation/agent10-rank11-original-opening-trainer-access-exact.cjs');

test('BigInt binomial correctly handles impossible and boundary combinations',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(31,7),2629575n);
  assert.equal(choose(20,7),77520n);
  assert.equal(choose(49,7),85900584n);
  assert.equal(choose(60,0),1n);
  assert.equal(choose(7,8),0n);
  assert.equal(choose(7,7),1n);
  assert.throws(()=>choose(-1,1));
});

test('original printed 60 exactly validates seven-card opening Item/Supporter counts',()=>{
  const x=exactOpeningTrainerAccess();
  assert.equal(x.basicCardCopies,11);
  assert.equal(x.stageOneCardCopies,2);
  assert.equal(x.itemCopies,21);
  assert.equal(x.supporterCopies,8);
  assert.equal(x.exactLegalOpeningCombinations,'300306336');
  assert.equal(x.exactNoItemOrSupporterAndLegalCombinations,'2552055');
  assert.equal(x.exactItemOrSupporterAndLegalCombinations,'297754281');
  assert.ok(Math.abs(x.conditionalNoItemOrSupporterProbability -
    0.008498172346253793)<1e-14);
  assert.ok(Math.abs(x.conditionalAtLeastOneItemOrSupporterProbability -
    0.9915018276537462)<1e-14);
});
