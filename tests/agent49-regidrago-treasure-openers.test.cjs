'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {choose,intersectionProbability}=
  require('../simulation/evaluation/agent49-regidrago-treasure-openers.cjs');

test('exact 60-card initial-hand denominator',()=>{
  assert.equal(choose(60,7),386206920);
  assert.equal(choose(7,0),1);
  assert.equal(choose(7,8),0);
  assert.equal(choose(60,60),1);
});

test('three essential disjoint singleton cards in a 3-card pool',()=>{
  const result=intersectionProbability(3,3,[1,1,1]);
  assert.equal(result.totalWays,1);
  assert.equal(result.favorable,1);
  assert.equal(result.probability,1);
});

test('seven-card three-singleton line equals drawing all three',()=>{
  const result=intersectionProbability(60,7,[1,1,1]);
  assert.equal(result.favorable,choose(57,4));
  assert.equal(result.probability,choose(57,4)/choose(60,7));
});

test('absent category yields exact zero opportunity',()=>{
  assert.equal(intersectionProbability(60,7,[4,0,6]).favorable,0);
});

test('drawing one card cannot satisfy three disjoint positive categories',()=>{
  assert.equal(intersectionProbability(60,1,[4,4,6]).probability,0);
});
