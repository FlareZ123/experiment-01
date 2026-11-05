'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  seededRandom,deckPermutation,physicalShuffleRandomStreams
}=require('../simulation/twinleaf/headless.cjs');

test('default legacy shared physical RNG is shifted by an added source-owned shuffle',()=>{
  const first=deckPermutation(43,seededRandom(100));
  const mixed=seededRandom(100);
  deckPermutation(44,mixed);deckPermutation(43,mixed);
  const second=deckPermutation(43,mixed);
  assert.notDeepEqual(second,first);
});
test('opt-in owner-local physical shuffle stream gives candidate stable permutations',()=>{
  const baseline=physicalShuffleRandomStreams(100);
  const candidateControl=deckPermutation(43,baseline[0]);
  const treatment=physicalShuffleRandomStreams(100);
  deckPermutation(44,treatment[1]);deckPermutation(43,treatment[1]);
  const candidateAfterSourceShuffles=deckPermutation(43,treatment[0]);
  assert.deepEqual(candidateAfterSourceShuffles,candidateControl);
});
test('each physical seat has independent reproducible stream for multiple shuffles',()=>{
  for(const seed of [1,100,101,482443328]){
    const before=physicalShuffleRandomStreams(seed);
    const after=physicalShuffleRandomStreams(seed);
    assert.deepEqual(deckPermutation(50,before[0]),deckPermutation(50,after[0]));
    assert.deepEqual(deckPermutation(49,before[1]),deckPermutation(49,after[1]));
    assert.notDeepEqual(deckPermutation(47,before[0]),deckPermutation(47,before[1]));
  }
});
test('creating per-seat stream does not advance legacy seeded generator',()=>{
  const a=seededRandom(100),b=seededRandom(100);
  physicalShuffleRandomStreams(100);
  assert.deepEqual(deckPermutation(40,a),deckPermutation(40,b));
});
