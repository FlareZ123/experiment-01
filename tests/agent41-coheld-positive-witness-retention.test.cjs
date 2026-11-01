'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {SAMPLE_LIMIT,retainNativeCoheldWitness}=
  require('../simulation/twinleaf/agent33-coheld-positive-witness-retention.cjs');

/** Create the exact per-game native audit counters initialized in the actor. */
function audit(){
  return {
    nativeCoheldDenialCanPlayRoots:0,
    nativeCoheldDenialBothPlayableRoots:0,
    nativeCoheldDenialNativeCanPlayErrorRoots:0,
    nativeCoheldDenialCanPlayWitnesses:[],
    nativeCoheldDenialFirstPositiveWitness:null,
    nativeCoheldDenialFirstNegativeWitness:null,
    nativeCoheldDenialFirstErrorWitness:null,
    nativeCoheldDenialExamplesTruncated:false,
    nativeCoheldDenialPositiveExamplesTruncated:false,
    nativeCoheldDenialErrorExamplesTruncated:false,
    nativeCoheldDenialPositiveWitnessMissing:false
  };
}

/** @param {number} root @param {boolean} playable @param {boolean} error */
function witness(root,playable=false,error=false){
  return {
    sourceDealFingerprint:'original-source-deal',
    seat:1,globalTurn:root,rootOrdinal:root,
    bothHaveNativePlayablePhysicalCopy:playable,
    plumeria:[{handIndex:2,canPlay:playable,error:error?'native-error':null}],
    teamFlare:[{handIndex:5,canPlay:playable,error:null}]
  };
}

test('first late genuine positive survives a fully exhausted general sample',()=>{
  const a=audit();
  for(let i=1;i<=SAMPLE_LIMIT;i++)
    retainNativeCoheldWitness(a,witness(i));
  assert.equal(a.nativeCoheldDenialCanPlayWitnesses.length,SAMPLE_LIMIT);
  assert.equal(a.nativeCoheldDenialBothPlayableRoots,0);
  const late=witness(SAMPLE_LIMIT+1,true);
  retainNativeCoheldWitness(a,late);
  assert.equal(a.nativeCoheldDenialCanPlayRoots,SAMPLE_LIMIT+1);
  assert.equal(a.nativeCoheldDenialBothPlayableRoots,1);
  assert.equal(a.nativeCoheldDenialCanPlayWitnesses.length,SAMPLE_LIMIT);
  assert.equal(a.nativeCoheldDenialCanPlayWitnesses.includes(late),false);
  assert.equal(a.nativeCoheldDenialFirstPositiveWitness,late);
  assert.equal(a.nativeCoheldDenialFirstPositiveWitness.rootOrdinal,49);
  assert.equal(a.nativeCoheldDenialFirstNegativeWitness.rootOrdinal,1);
  assert.equal(a.nativeCoheldDenialExamplesTruncated,true);
  assert.equal(a.nativeCoheldDenialPositiveExamplesTruncated,true);
  assert.equal(a.nativeCoheldDenialPositiveWitnessMissing,false);
});

test('late native canPlay exception retains first error outside sample',()=>{
  const a=audit();
  for(let i=1;i<=SAMPLE_LIMIT;i++)
    retainNativeCoheldWitness(a,witness(i));
  const thrown=witness(SAMPLE_LIMIT+1,false,true);
  retainNativeCoheldWitness(a,thrown);
  assert.equal(a.nativeCoheldDenialCanPlayRoots,SAMPLE_LIMIT+1);
  assert.equal(a.nativeCoheldDenialBothPlayableRoots,0);
  assert.equal(a.nativeCoheldDenialNativeCanPlayErrorRoots,1);
  assert.equal(a.nativeCoheldDenialFirstErrorWitness,thrown);
  assert.equal(a.nativeCoheldDenialErrorExamplesTruncated,true);
  assert.equal(a.nativeCoheldDenialFirstPositiveWitness,null);
  assert.equal(a.nativeCoheldDenialPositiveWitnessMissing,false);
});

test('earliest positive retained with independent count through repeated later roots',()=>{
  const a=audit();
  const first=witness(1,true);
  retainNativeCoheldWitness(a,first);
  for(let i=2;i<=SAMPLE_LIMIT+3;i++)
    retainNativeCoheldWitness(a,witness(i,true));
  assert.equal(a.nativeCoheldDenialBothPlayableRoots,SAMPLE_LIMIT+3);
  assert.equal(a.nativeCoheldDenialFirstPositiveWitness,first);
  assert.equal(a.nativeCoheldDenialPositiveExamplesTruncated,true);
  assert.equal(a.nativeCoheldDenialPositiveWitnessMissing,false);
});
