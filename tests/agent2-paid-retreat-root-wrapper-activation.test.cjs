'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  actorPaidRetreatRootOptions,paidRetreatRootWrapperActivationReceipt
}=require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');

const root=()=>{};

test('phase A without paid retreat records no paid selector',()=>{
  const result=paidRetreatRootWrapperActivationReceipt({
    actorOnlyComposition:true,scopedRoot:{},rootOptions:{}
  });
  assert.equal(result.twoUnitPaidRetreatRootOptIn,false);
  assert.equal(result.twoUnitPaidRetreatRootOptionPassed,false);
  assert.equal(result.twoUnitPaidRetreatRootWrapperSelected,false);
});

test('phase B v1 live-wrapper receipt requires both constructed root and exact selector',()=>{
  const options=actorPaidRetreatRootOptions({
    actorTwoUnitPaidRetreatRoot:true,
    actorTwoUnitPaidRetreatTargetTurn:null
  });
  const input={
    actorOnlyComposition:true,actorTwoUnitPaidRetreatRoot:true,
    actorTwoUnitPaidRetreatTargetTurn:null,
    rootOptions:options,scopedRoot:{root}
  };
  assert.equal(
    paidRetreatRootWrapperActivationReceipt(input)
      .twoUnitPaidRetreatRootWrapperSelected,true);
  assert.throws(()=>paidRetreatRootWrapperActivationReceipt({
    ...input,scopedRoot:{}
  }),/live scopedRoot wrapper/);
  assert.throws(()=>paidRetreatRootWrapperActivationReceipt({
    ...input,rootOptions:{}
  }),/live scopedRoot wrapper/);
  assert.throws(()=>paidRetreatRootWrapperActivationReceipt({
    ...input,actorOnlyComposition:false
  }),/bilateral actor-only composition/);
  assert.throws(()=>paidRetreatRootWrapperActivationReceipt({
    ...input,actorTwoUnitPaidRetreatTargetTurn:42
  }),/live scopedRoot wrapper/);
});

test('v2 receipt selects the v2 option and rejects a v1-only option',()=>{
  const options=actorPaidRetreatRootOptions({
    actorTwoUnitPaidRetreatRootV2:true,
    actorTwoUnitPaidRetreatTargetTurnV2:null
  });
  const input={
    actorOnlyComposition:true,actorTwoUnitPaidRetreatRootV2:true,
    actorTwoUnitPaidRetreatTargetTurnV2:null,
    rootOptions:options,scopedRoot:{root}
  };
  const result=paidRetreatRootWrapperActivationReceipt(input);
  assert.equal(result.twoUnitPaidRetreatRootV2OptIn,true);
  assert.equal(result.twoUnitPaidRetreatRootOptionPassed,true);
  assert.equal(result.twoUnitPaidRetreatRootWrapperSelected,true);
  assert.throws(()=>paidRetreatRootWrapperActivationReceipt({
    ...input,rootOptions:{twoUnitPaidRetreatRoot:true,
      twoUnitPaidRetreatTargetTurn:null}
  }),/live scopedRoot wrapper/);
});
