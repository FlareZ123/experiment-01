'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {assertNativeRootOptionPropagation}=require(
  '../../simulation/evaluation/2026-11/agent26-native-root-option-propagation.cjs');

function row(underworld,mimir,turn){
  return {actorOnlyDecisionCoverage:{detailedComponentAudits:{root:{
    underworldActiveFundingPriorityOptIn:underworld,
    underworldActiveFundingMirrorVetoOptIn:mimir,
    underworldActiveFundingMinTurn:turn
  }}}};
}
test('every real seat audit demonstrates the exact declared treatment options',()=>{
  const rows=[row(true,false,null),row(true,false,null)];
  const audit=assertNativeRootOptionPropagation(rows,{
    underworldActiveFundingPriorityOptIn:true,
    underworldActiveFundingMirrorVetoOptIn:false,
    underworldActiveFundingMinTurn:null
  });
  assert.equal(audit.rowsChecked,2);
  assert.equal(audit.fields.length,3);
});
test('silently omitted native experimental option is rejected',()=>{
  assert.throws(()=>assertNativeRootOptionPropagation([row(true,false,null)],{
    underworldActiveFundingPriorityOptIn:true,
    underworldActiveFundingMirrorVetoOptIn:true
  }),/dropped experimental actor option/);
});
test('unknown audit field is rejected even when some other flag matched',()=>{
  assert.throws(()=>assertNativeRootOptionPropagation([row(true,false,null)],{
    underworldActiveFundingPriorityOptIn:true,
    missingFutureTreatmentField:10
  }),/missing actual actor option/);
});
test('mixed two-seat assignment cannot pass a shared actor policy assertion',()=>{
  assert.throws(()=>assertNativeRootOptionPropagation([
    row(true,false,25),row(true,false,null)
  ],{underworldActiveFundingMinTurn:25}),/Game 1 dropped experimental/);
});
test('no records and no declared option cannot masquerade as a native trial',()=>{
  assert.throws(()=>assertNativeRootOptionPropagation([],{flag:true}),
    /at least one actual game row/);
  assert.throws(()=>assertNativeRootOptionPropagation([row(true,false,null)],{}),
    /Must specify a real owner-root actor option/);
});
