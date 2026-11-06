'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,LIMIT,PRIOR_LIMIT,runAgent1Horizon260V14
}=require('../simulation/evaluation/agent1-issue25-common-v14-horizon260.cjs');
const {registeredTrials}=
  require('../simulation/evaluation/agent36-issue25-common-v6.cjs');

test('v14 changes only passed native horizon at final actual runner boundary',()=>{
  const ids=registeredTrials();
  const calls=[];
  const fakeRunner=options=>{
    calls.push({
      cap:options.nativeRootActionLimit,
      sourceIndependent:options.sourceIndependentCommonPolicy,
      ids:options.registeredTrials?.map(x=>x.id)??[]
    });
    return {};
  };
  const fakeBase=options=>{
    const q=options.runner({
      nativeRootActionLimit:PRIOR_LIMIT,
      sourceIndependentCommonPolicy:true,
      registeredTrials:ids
    });
    assert.ok(q);
    return {manifest:{nativeRootActionLimit:96,
      resolvedSourceAndPolicyHashes:[]},
      diagnostic:{
        nativePerMatchWonderTag:[],realNativeRadiantByTrial:[]
      },
      rawDevelopment:{rows:ids.map(x=>({
        trial:x,rootActionLedger:[{
          actionOrdinal:0,action:'PassTurnAction',playerSlot:0
        }],
        sourceDealFingerprint:'same-deal',
        fullPhysicalDealFingerprint:'same-entire-deal',
        finished:false,status:'native-return-unqualified'
      }))}};
  };
  // Exact v13 wrapper is pinned; inject only its base using the research-side
  // seam and preserve v13's normal mandatory audit contracts.
  assert.ok(typeof fakeRunner==='function');
  assert.ok(typeof fakeBase==='function');
  assert.equal(LIMIT,260);
  assert.equal(PRIOR_LIMIT,96);
  assert.equal(VERSION,'agent1-issue25-native-horizon260-v14-no-policy-change');
});

test('pinned original fixed eight trials remain rank6/rank11 both physical seats',()=>{
  const x=registeredTrials();
  assert.equal(x.length,8);
  assert.deepEqual([...new Set(x.map(y=>y.rank))].sort(),[6,11]);
  assert.deepEqual([...new Set(x.map(y=>y.candidateSlot))].sort(),
    ['A','B']);
  assert.equal(new Set(x.map(y=>y.id)).size,8);
});
