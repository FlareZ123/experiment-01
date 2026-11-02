'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {probe}=require('../simulation/twinleaf/agent1-ghala-zero-search-native.cjs');
const {withZeroShuffle}=require('../simulation/twinleaf/agent1-ghala-zero-shuffle-hook.cjs');
test('G&H repaired zero search schedules real shuffle, both seats',()=>{
 for(const seat of [0,1])for(const take of [false,true]){
  const {result:r,audit:a}=withZeroShuffle(()=>probe(seat,take));
  console.log('GHALA_ZERO_SHUFFLE_REPAIR '+JSON.stringify({seat,take,shuffle:r.shufflePrompt,audit:a}));
  assert.equal(r.valid,true);
  assert.equal(r.shufflePrompt,true);
  assert.equal(a.scheduled,take?0:1);
  assert.equal(a.competitiveQualifiedGames,0);
 }
});
