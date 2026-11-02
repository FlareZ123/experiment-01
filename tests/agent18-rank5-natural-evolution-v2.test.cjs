'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {pairedPreflight,selected}=require(
  '../simulation/evaluation/agent18-rank5-natural-evolution-v2.cjs');
const {profile:baseline}=require(
  '../simulation/evaluation/agent18-rank5-selected-canary.cjs');

test('one changed public natural-evolution option, both seats and all same physical seeds',()=>{
  const x=pairedPreflight();
  assert.deepEqual(x.changed,['actorNaturalEvolutionRoot']);
  assert.equal(x.registered.length,4);
  assert.deepEqual(x.registered.map(row=>row.seed),[
    67151115,67151115,1865046151,1865046151
  ]);
  assert.equal(selected.verifiedClosureSha256,baseline.verifiedClosureSha256);
  assert.deepEqual(selected.expectedCandidateDeckFingerprints,
    baseline.expectedCandidateDeckFingerprints);
  assert.equal(selected.expectedSourceDeckFingerprint,
    baseline.expectedSourceDeckFingerprint);
  assert.equal(selected.contrastBaseProfile,
    'simulation/evaluation/agent18-rank5-selected-canary-v1.json');
  assert.equal(selected.seedsPreviouslyObserved,true);
  assert.equal(selected.competitiveQualified,false);
});
