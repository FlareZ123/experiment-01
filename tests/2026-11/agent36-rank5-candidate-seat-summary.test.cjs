'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {seatsForTrial}=
  require('../../simulation/evaluation/2026-11/agent20-rank5-gengar-tempo-aba.cjs');

test('candidate slot A maps candidate to native seat 0 and source to 1',()=>{
  assert.deepEqual(seatsForTrial({candidateSlot:'A'}),{
    candidate:0,source:1
  });
});

test('candidate slot B maps candidate to native seat 1 and source to 0',()=>{
  assert.deepEqual(seatsForTrial({candidateSlot:'B'}),{
    candidate:1,source:0
  });
});

test('unregistered or impossible seat markers fail before source labels change',()=>{
  assert.throws(()=>seatsForTrial({candidateSlot:'C'}));
  assert.throws(()=>seatsForTrial({}));
  assert.throws(()=>seatsForTrial(null));
});
