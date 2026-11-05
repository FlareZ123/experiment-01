'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {demonstrateSharedStreamCoupling,VERSION}=
  require('../simulation/evaluation/agent4-shared-physical-shuffle-coupling.cjs');
test('same original example seed, extra source deck shuffles shift later candidate global RNG window',()=>{
  const r=demonstrateSharedStreamCoupling(100);
  assert.equal(r.schema,VERSION);
  assert.equal(r.seed,100);
  assert.equal(r.syntheticOnly,true);
  assert.equal(r.candidatePermutationsDifferUnderSharedStream,true);
  assert.notEqual(r.candidatePermutationControlSHA256,
    r.candidatePermutationWithTwoExtraSourceShufflesSHA256);
});
test('independent candidate stream is invariant to additional source-only shuffle calls',()=>{
  const r=demonstrateSharedStreamCoupling(100);
  assert.equal(r.independentCandidatePermutationInvariant,true);
  assert.equal(r.independentCandidatePermutationControlSHA256,
    r.independentCandidatePermutationExtraSourceShuffleSHA256);
  assert.equal(r.competitiveGames,0);
  assert.equal(r.actualCausalAttributionOfAnyNativeCandidateAction,'unverified');
});
test('alternate seeds show the same coupling while per-seat stream stays invariant',()=>{
  for(const seed of [1,100,101,482443328]){
    const r=demonstrateSharedStreamCoupling(seed);
    assert.equal(r.candidatePermutationsDifferUnderSharedStream,true);
    assert.equal(r.independentCandidatePermutationInvariant,true);
  }
});
