'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {runWithBilateralPerfection}=require(
  '../simulation/evaluation/agent24-v8-bilateral-perfection-root-native.cjs');

test('registered native runner receives bilateral Perfection as an opt-in only',()=>{
  const registered={actorOnlyComposition:true,
    registeredTrialIds:['11:211:A:new-moon-lockbreaker-v1'],
    sourceIndependentCommonPolicy:true,bilateralSpecialEnergyRoot:true,
    nativeRootActionLimit:128,policyToken:'original policy'};
  const original=structuredClone(registered);
  const payload=runWithBilateralPerfection(registered,opts=>opts);
  assert.deepEqual(registered,original,'Native registration is immutable');
  assert.deepEqual(payload,{...original,bilateralPerfectionRoot:true});
  assert.equal(payload.sourceIndependentCommonPolicy,true);
  assert.equal(payload.actorOnlyComposition,true);
  assert.equal(payload.nativeRootActionLimit,128);
});

test('both physical seat orientations receive exactly the same root option',()=>{
  for(const originalCandidateSeat of [0,1]) {
    const captured=runWithBilateralPerfection({
      trial:{candidateSeat:originalCandidateSeat},actorOnlyComposition:true
    },options=>options);
    assert.equal(captured.bilateralPerfectionRoot,true);
    assert.equal(captured.trial.candidateSeat,originalCandidateSeat);
    assert.equal(Object.hasOwn(captured,'perfectionRootOwnerSeat'),false);
  }
});

test('opt-in does not hide a disabled actor-only policy in the supplied options',()=>{
  const captured=runWithBilateralPerfection(
    {actorOnlyComposition:false},options=>options);
  assert.equal(captured.actorOnlyComposition,true);
  assert.equal(captured.bilateralPerfectionRoot,true);
});
