'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {probe}=require('../simulation/twinleaf/agent1-ghala-zero-search-native.cjs');
test('real G&H zero-search must have shuffle prompt in both physical seats',()=>{
 for(const seat of [0,1]){
  const empty=probe(seat,false);
  const full=probe(seat,true);
  console.log('AGENT1_GHALA_ZERO_SEARCH '+JSON.stringify({empty,full}));
  assert.equal(empty.valid,true);
  assert.equal(empty.inHand,false);
  assert.equal(empty.sameOrder,true);
  assert.equal(full.valid,true);
  assert.equal(full.inHand,true);
  assert.equal(full.shufflePrompt,true);
  assert.equal(empty.paperQualified,false);
 }
});
