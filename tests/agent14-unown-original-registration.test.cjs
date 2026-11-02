'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {originalRank17Arms}=
  require('../simulation/evaluation/agent14-rank17-farewell-original-replay.cjs');
const {originalUnownArms,SOURCE_RANKS}=
  require('../simulation/evaluation/agent14-multirank-unown-original-replay.cjs');
const {originalRank9Arms,sourceDealStatus}=
  require('../simulation/evaluation/agent14-rank9-farewell-native-replay.cjs');

test('all original Unown development arms conserve their fixed two candidate names',()=>{
  const all=[...originalRank9Arms(),...originalRank17Arms(),
    ...originalUnownArms()];
  assert.equal(all.length,20);
  assert.equal(new Set(all.map(x=>x.id)).size,all.length);
  const expected=new Set(['champion-reference','new-moon-lockbreaker-v1']);
  for(const row of all)assert.ok(expected.has(row.candidateId));
  assert.deepEqual([...new Set(all.map(x=>x.rank))].sort((a,b)=>a-b),
    [9,17,26,30,31]);
});
test('rank17 preregistration has two independently sampled physical seats',()=>{
  const rows=originalRank17Arms();
  assert.equal(rows.length,4);
  assert.deepEqual(rows.map(x=>x.candidateSlot),['A','A','B','B']);
  assert.deepEqual(rows.map(x=>x.seed),
    [2494066265,2494066265,2674729000,2674729000]);
});
test('three older registered source ranks retain their two physical seats',()=>{
  assert.deepEqual(SOURCE_RANKS,[26,30,31]);
  const rows=originalUnownArms();
  assert.equal(rows.length,12);
  for(const rank of SOURCE_RANKS){
    const subset=rows.filter(x=>x.rank===rank);
    assert.equal(subset.length,4);
    assert.deepEqual(subset.map(x=>x.candidateSlot),['A','A','B','B']);
    assert.equal(subset[0].seed,subset[1].seed);
    assert.equal(subset[2].seed,subset[3].seed);
  }
});
test('source fingerprint mismatch is never silently accepted',()=>{
  assert.equal(sourceDealStatus({sourceDealFingerprint:'a'},
    {sourceDealFingerprint:'b'}),'SOURCE_DEAL_DIFFERENT');
  assert.equal(sourceDealStatus({sourceDealFingerprint:'a'},
    {sourceDealFingerprint:'a'}),'EXACT_SOURCE_DEAL_MATCH');
  assert.equal(sourceDealStatus({},{sourceDealFingerprint:'a'}),'UNVERIFIED');
});
