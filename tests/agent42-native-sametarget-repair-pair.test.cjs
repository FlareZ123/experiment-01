'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {compareSeed,HISTORICAL_SEEDS,PINNED_ENGINE,ORIGINAL_ENV_PROFILE,
  assertOriginalPolicyEnvironment}=require(
  '../simulation/evaluation/agent42-native-sametarget-repair-pair.cjs');

/** @param {number} seed @param {string|null} deal */
function fixture(seed,deal){
  const arm={sourceDealFingerprint:deal,actualStarterSeat:0,
    rootActionCount:135,abort:deal===null?'engine-error':null,
    error:deal===null?'INVALID_PROMPT_RESULT':null,
    finished:false,winner:null,finalPrizes:[6,6]};
  return {sourceSeed:seed,pinnedEngine:PINNED_ENGINE,
    attemptedArms:2,sourceDealEqual:deal!==null,
    unchangedNativeRootPrefixCount:134,
    firstDifference:null,control:{...arm},treatment:{...arm}};
}

test('same-deal fixed-seed pair retains both Energy staging arms',()=>{
  const seed=HISTORICAL_SEEDS[0];
  let runCount=0;
  const result=compareSeed(seed,{
    nativeRun:s=>{runCount++;return fixture(s,'public-deal-digest');},
    withRepair:execute=>({result:execute(),audit:{
      schema:'bot-same-target-energy-selection-v1',
      repairedPromptCount:2,events:[{promptId:135}]
    }})
  });
  assert.equal(runCount,2);
  assert.equal(result.seed,seed);
  assert.deepEqual(result.crossPolicySourceDealEquality,[true,true]);
  assert.equal(result.crossPolicyEqualityUnverifiedIfErrors,false);
  assert.equal(result.repairAudit.repairedPromptCount,2);
  assert.equal(result.baseline.noStaging.firstSeat,0);
  assert.equal(result.repair.staging.sourceDeal,'public-deal-digest');
});

test('baseline native abort cannot be mislabeled as matched physical deal',()=>{
  const seed=HISTORICAL_SEEDS[0];
  let attempt=0;
  const result=compareSeed(seed,{
    nativeRun:s=>{attempt++;return fixture(s,attempt===1?null:'digest');},
    withRepair:execute=>({result:execute(),audit:{repairedPromptCount:1}})
  });
  assert.deepEqual(result.crossPolicySourceDealEquality,[false,false]);
  assert.equal(result.crossPolicyEqualityUnverifiedIfErrors,true);
  assert.equal(result.baseline.noStaging.status,'engine-error');
  assert.equal(result.repair.noStaging.sourceDeal,'digest');
});

test('wrong vendor pin, incomplete pair or unregistered seed fail closed',()=>{
  const seed=HISTORICAL_SEEDS[0],f=fixture(seed,'digest');
  const invalid=[
    {...f,pinnedEngine:'different'},
    {...f,attemptedArms:1}
  ];
  for(const pair of invalid){
    assert.throws(()=>compareSeed(seed,{
      nativeRun:()=>pair,withRepair:execute=>({result:execute(),audit:{}})
    }));
  }
  assert.throws(()=>compareSeed(42,{nativeRun:()=>f,withRepair:()=>null}));
});


test('native replay requires all sixteen historical environment switches',()=>{
  assert.equal(Object.keys(ORIGINAL_ENV_PROFILE).length,16);
  assert.doesNotThrow(()=>assertOriginalPolicyEnvironment({...ORIGINAL_ENV_PROFILE}));
  for(const key of Object.keys(ORIGINAL_ENV_PROFILE)){
    const missing={...ORIGINAL_ENV_PROFILE};
    delete missing[key];
    assert.throws(()=>assertOriginalPolicyEnvironment(missing),new RegExp(key));
    const wrong={...ORIGINAL_ENV_PROFILE,[key]:'different'};
    assert.throws(()=>assertOriginalPolicyEnvironment(wrong),new RegExp(key));
  }
});
