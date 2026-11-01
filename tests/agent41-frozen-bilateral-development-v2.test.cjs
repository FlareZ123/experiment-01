'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const base=require('../simulation/evaluation/agent41-frozen-bilateral-development-v1.json');
const revised=require('../simulation/evaluation/agent41-frozen-bilateral-development-v2.json');
const {registeredTrials}=require(
  '../simulation/evaluation/agent41-frozen-bilateral-development-v1.cjs');

test('single v2 treatment changes only both-seat public-context Special selection',()=>{
  const delta=Object.keys({...base.policyOptions,...revised.policyOptions})
    .filter(k=>base.policyOptions[k]!==revised.policyOptions[k]);
  assert.deepEqual(delta,['bilateralPublicContextSpecialEnergy']);
  assert.equal(revised.policyOptions.bilateralPublicContextSpecialEnergy,true);
  assert.equal(revised.policyOptions.actorOnlyComposition,true);
  assert.equal(revised.policyOptions.physicalZoneGate,true);
  assert.equal(revised.policyOptions.sameRootChoiceApply,true);
  assert.equal(revised.policyOptions.nativeSetupCoinChoiceReceipt,true);
  assert.equal(revised.policyOptions.bilateralSpecialEnergyRoot,undefined);
  assert.equal(revised.parentCompletedNativeRun,41278620085);
  assert.equal(revised.competitiveGameQualified,false);
});

test('v1 and v2 both retain the same 32 original registered rank/seat/deal arms',()=>{
  assert.deepEqual(registeredTrials(base),registeredTrials(revised));
  assert.equal(revised.scheduledNativeArms,32);
  assert.equal(revised.seedGroups,16);
  assert.equal(revised.pinnedVendorRevision,base.pinnedVendorRevision);
  assert.equal(revised.sourceClosureSha256,base.sourceClosureSha256);
  assert.equal(revised.registrationGitBlobSha,base.registrationGitBlobSha);
  assert.equal(revised.originalRosterGitBlobSha,base.originalRosterGitBlobSha);
});
