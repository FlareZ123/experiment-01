'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  choose,originalSource,source13DonorVstarCounts
}=require('../simulation/evaluation/agent8-rank13-vstar-opening-dp.cjs');

test('rank13 exact immutable source sixty reproduces donor exclusion event',()=>{
  const x=source13DonorVstarCounts(originalSource());
  assert.equal(x.basicValid,300306336n);
  assert.equal(x.entireEvent,10392235n);
  assert.equal(x.withoutHeldVstar,7927045n);
  assert.equal(x.withHeldVstar,2465190n);
  assert.equal(x.withoutHeldVstar+x.withHeldVstar,x.entireEvent);
});

test('conditional VSTAR-hand and three extra natural draws remain sub-40%',()=>{
  const x=source13DonorVstarCounts(originalSource());
  const before=Number(x.withHeldVstar)/Number(x.entireEvent);
  const after=before+(1-before)*(1-Number(choose(50,3))/
    Number(choose(53,3)));
  assert.ok(before>0.23721&&before<0.23722);
  assert.ok(after>0.36179&&after<0.36180);
  assert.ok(Number(choose(49,2))/Number(choose(53,6))<0.000052);
});

test('small exact binomial coefficients have integral recursion',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(49,7),85900584n);
  assert.equal(choose(53,6),22957480n);
  assert.equal(choose(3,2),3n);
  assert.equal(choose(3,4),0n);
});
