'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withIndependentSeatRng}=require('../simulation/twinleaf/agent19-independent-seat-rng.cjs');

test('both physical seats receive independent physical and policy RNG',()=>{
  const calls=[];
  const headless={runMatch:request=>{
    calls.push(request);return request.seed;
  }};
  const previous=headless.runMatch;
  const result=withIndependentSeatRng(()=>[
    headless.runMatch({seed:31,deckA:['A'],deckB:['B']}),
    headless.runMatch({seed:32,isolatePolicyRandomness:false})
  ],{headless});
  assert.deepEqual(result.result,[31,32]);
  assert.equal(result.audit.matches,2);
  assert.equal(result.audit.paperQualified,false);
  assert.equal(headless.runMatch,previous);
  for(const request of calls){
    assert.equal(request.isolatePhysicalShuffleRandomness,true);
    assert.equal(request.isolatePolicyRandomness,true);
  }
  assert.deepEqual(calls[0].deckA,['A']);
});

test('native failure always restores the module entry point',()=>{
  const previous=()=>1;
  const headless={runMatch:previous};
  assert.throws(()=>withIndependentSeatRng(()=>{
    headless.runMatch({seed:21});throw new Error('native abort');
  },{headless}),/native abort/);
  assert.equal(headless.runMatch,previous);
});

test('default-off historical invocation preserves caller settings',()=>{
  const calls=[];
  const headless={runMatch:request=>calls.push(request)};
  headless.runMatch({seed:4});
  assert.deepEqual(calls,[{seed:4}]);
});
