'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  experiment,REG
}=require('../simulation/evaluation/agent49-general-trainer-fallback-native-pilot.cjs');

function setup() {
  return {reg:{
    schema:'agent49-generic-native-trainer-after-unsupported-pass-original-r5-r11-v1',
    enginePin:'pinned-source',seeds:[3280147331,2186770930],
    primarySourceSeats:[0,1],maxActions:140
  },rank5:Array(60).fill('Original5'),
  rank11:Array(60).fill('Original11')};
}
/** Unchanged fake physical deal with treatment-only native root opportunity. */
function simulated(_setup,seed,seat,enabled) {
  const physical=seed+'-'+seat;
  return {
    seed,rank5Seat:seat,nativeTrainerFallbackEnabled:enabled,
    deckAHash:seat?'B':'A',deckBHash:seat?'A':'B',
    error:null,fullPhysicalDealDigest:physical,
    firstTurnSlot:seed%2,
    rootPlayCardCount:enabled?9:7,
    nativeTrainerBridge:enabled?{
      selectedNativeTrainerRoots:3,acceptedNativeTrainerRoots:2,
      declinedByReason:{
        'all-known-mandatory-hand-cost-modes-impossible':1
      }
    }:null
  };
}

test('all preregistered paired arms remain in the denominator',()=>{
  assert.match(REG,/agent49-general-trainer-after-pass-native-pilot/);
  const r=experiment(simulated,setup());
  assert.equal(r.attemptedArms,8);
  assert.equal(r.registeredPhysicalPairs,4);
  assert.equal(r.completePairs,4);
  assert.equal(r.physicallyMatchedPairs,4);
  assert.equal(r.controlNativeRootPlayCards,28);
  assert.equal(r.treatmentNativeRootPlayCards,36);
  assert.equal(r.treatmentNativeTrainerFallbackRoots,12);
  assert.equal(r.treatmentNativeTrainerAcceptedRoots,8);
  assert.equal(r.treatmentKnownPaymentVetoes,4);
  assert.equal(r.competitivelyQualifiedGames,0);
  assert.equal(r.estimatedWinRate,null);
  assert.equal(r.paperPlayerPolicyQualified,false);
});

test('source-seat pairing and seed ordering are fixed by registration',()=>{
  const seen=[];
  experiment((...args)=>{
    seen.push(args.slice(1));
    return simulated(...args);
  },setup());
  assert.deepEqual(seen,[
    [3280147331,0,false],[3280147331,0,true],
    [3280147331,1,false],[3280147331,1,true],
    [2186770930,0,false],[2186770930,0,true],
    [2186770930,1,false],[2186770930,1,true]
  ]);
});

test('registration retains censored failure arms and never inflates pairing',()=>{
  const failed=experiment((cfg,seed,seat,enabled)=>{
    const result=simulated(cfg,seed,seat,enabled);
    if(seed===2186770930&&seat===1&&enabled){
      result.error='real native Store rejected a hypothetical card';
      result.fullPhysicalDealDigest=null;
    }
    return result;
  },setup());
  assert.equal(failed.attemptedArms,8);
  assert.equal(failed.completePairs,3);
  assert.equal(failed.physicallyMatchedPairs,3);
  assert.equal(failed.aborts.length,1);
  assert.equal(failed.aborts[0].nativeTrainerFallbackEnabled,true);
  assert.equal(failed.competitivelyQualifiedGames,0);
});
