'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {preflight,withSymmetricFloatStone}=
  require('../simulation/evaluation/agent14-native-floatstone-reply-falsification.cjs');

test('published preregistration, source seat, old profile and adapter are frozen',()=>{
  const {reg,profile}=preflight();
  assert.equal(reg.expectedAttempts,2);
  assert.equal(reg.sourceRank,11);
  assert.equal(reg.actualOriginalSourceStarterSeat,1);
  assert.equal(reg.sourcePhysicalDealFingerprint.length,64);
  assert.equal(profile.policyOptions.nativeRootActionLimit,260);
});
test('symmetric root option enters genuine actor wrapper for both seats and restores',()=>{
  const received=[];
  const root={withActorOnlyRootPolicy:(fn,opts)=>{
    received.push({...opts});return fn();}};
  const original=root.withActorOnlyRootPolicy;
  const value=withSymmetricFloatStone(()=>{
    const a=root.withActorOnlyRootPolicy(()=>1,
      {floatStoneMobility:false,floatStoneMobilityOwnerSeat:1,policyMode:'a'});
    const b=root.withActorOnlyRootPolicy(()=>2,
      {floatStoneMobility:false,floatStoneMobilityOwnerSeat:0,policyMode:'b'});
    return a+b;
  },{root});
  assert.equal(value,3);
  assert.equal(received.length,2);
  for(const x of received){
    assert.equal(x.floatStoneMobility,true);
    assert.equal(x.floatStoneMobilityOwnerSeat,null);
  }
  assert.equal(received[0].policyMode,'a');
  assert.equal(received[1].policyMode,'b');
  assert.strictEqual(root.withActorOnlyRootPolicy,original);
});
test('the original root wrapper is restored even when a native run throws',()=>{
  const root={withActorOnlyRootPolicy:run=>run()};
  const before=root.withActorOnlyRootPolicy;
  assert.throws(()=>withSymmetricFloatStone(()=>{
    root.withActorOnlyRootPolicy(()=>{throw Error('native rollback');},{});
  },{root}),/native rollback/);
  assert.strictEqual(root.withActorOnlyRootPolicy,before);
});
