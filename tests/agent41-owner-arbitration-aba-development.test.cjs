'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {FIXED,VERSION,executeHistoricalArbitrationABA}=
  require('../simulation/evaluation/agent41-owner-arbitration-aba-development.cjs');
const {COMMON_OPTIONS}=require('../simulation/evaluation/agent41-native-recipient-aba.cjs');

test('historical A/B/A fixes all non-arbitration root factors',()=>{
  assert.equal(FIXED.AGENT17_PUBLIC_CONTEXT_SPECIAL_DEV,'true');
  assert.equal(FIXED.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV,'false');
  assert.equal(FIXED.AGENT44_ACTOR_ENERGY_RECIPIENT_DEV,'false');
  assert.equal(FIXED.AGENT6_PAID_RETREAT_ROOT_DEV,'false');
  assert.equal(COMMON_OPTIONS.actorOnlyComposition,true);
  assert.equal(COMMON_OPTIONS.nativeAcceptedTargets,true);
  assert.equal(COMMON_OPTIONS.paperSupporterQuota,true);
  assert.match(VERSION,/originalstore-historical-aba-v1$/);
});

test('a failed source run restores every original environment switch',()=>{
  const original=new Map(Object.keys(FIXED).map(k=>[k,process.env[k]]));
  const seen=[];
  try{
    process.env.AGENT17_PUBLIC_CONTEXT_SPECIAL_DEV='changed';
    process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV='changed';
    assert.throws(()=>executeHistoricalArbitrationABA(options=>{
      seen.push({
        publicSpecial:process.env.AGENT17_PUBLIC_CONTEXT_SPECIAL_DEV,
        arbitrate:process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV,
        candidate:options.actorOnlyComposition
      });
      throw new Error('injected original Store failure');
    }),/injected original Store failure/);
    assert.deepEqual(seen,[{publicSpecial:'true',arbitrate:'false',candidate:true}]);
    assert.equal(process.env.AGENT17_PUBLIC_CONTEXT_SPECIAL_DEV,'changed');
    assert.equal(process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV,'changed');
  }finally{
    for(const [key,value] of original){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
});
