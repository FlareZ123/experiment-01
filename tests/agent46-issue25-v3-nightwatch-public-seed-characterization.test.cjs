'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {test}=require('node:test');
const {sampleUniformPositions}=
  require('../simulation/twinleaf/agent12-nightwatch-paper-random-chooser.cjs');

const v3=fs.readFileSync(path.resolve(__dirname,
  '../simulation/evaluation/agent36-issue25-nightwatch-futuresight-v3.cjs'),
'utf8');
const match=v3.match(/const PUBLIC_PRECOMMITTED_SEED=\s*'([^']+)';/);
assert.ok(match,'historical selected v3 must have a literal reproducible seed');
const seed=match[1];
const nonce=JSON.stringify([5,'101','1']);

test('v3 historical fixed public seed yields the same two-of-five each replay',()=>{
  const first=sampleUniformPositions(5,2,seed,nonce);
  assert.deepEqual(first,[3,4]);
  for(let repeat=0;repeat<100;repeat++){
    assert.deepEqual(sampleUniformPositions(5,2,seed,nonce),first);
  }
  // This proves deterministic replay, not fresh paper randomness.
  assert.equal(new Set(Array.from({length:100},()=>
    sampleUniformPositions(5,2,seed,nonce).slice().sort().join(','))).size,1);
});

test('v3 fixed seed does not depend on names at physical indices',()=>{
  const handA=['A','B','C','D','E'];
  const handB=['E','D','C','B','A'];
  const indices=sampleUniformPositions(handA.length,2,seed,nonce);
  assert.deepEqual(indices,[3,4]);
  assert.deepEqual(indices.map(i=>handA[i]),['D','E']);
  assert.deepEqual(indices.map(i=>handB[i]),['B','A']);
  // An adversary who knows the deterministic indices could permute a hand.
});

test('sampler can reach all ten pairs when independent seed inputs vary',()=>{
  const pairs=new Set();
  for(let attempt=0;attempt<500;attempt++){
    const candidateSeed='independent-example-'+attempt;
    const chosen=sampleUniformPositions(5,2,candidateSeed,nonce);
    assert.equal(new Set(chosen).size,2);
    assert.ok(chosen.every(i=>i>=0&&i<5));
    pairs.add(chosen.slice().sort((a,b)=>a-b).join(','));
  }
  assert.equal(pairs.size,10);
});
