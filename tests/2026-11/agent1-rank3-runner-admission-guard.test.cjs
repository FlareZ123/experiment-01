'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const roster=require('../../results/aichi-2026/full-decklists.json');
const registration=require('../../results/aichi-2026/registrations/agent41-rank3-owner-colored-opening-v1-20261109.json');
const {authenticatedSourceRanks}=
  require('../../simulation/evaluation/agent25-authenticated-source-admission.cjs');
const {makeTrials,oneArm}=
  require('../../simulation/evaluation/2026-11/agent41-rank3-owner-colored-opening-native.cjs');

test('rank3 remains admitted only through explicit all-authenticated-original expansion',()=>{
  const ranks=authenticatedSourceRanks(roster,true);
  assert.ok(ranks.includes(3));
  assert.deepEqual(authenticatedSourceRanks(roster,false),[6,11]);
});

test('both rank3 arms pass explicit source-rank admission into the canonical runner',()=>{
  const trials=makeTrials([registration.groups[0]]);
  assert.equal(trials.length,2);
  for(const bias of [false,true]){
    let captured=null;
    assert.throws(()=>oneArm(bias,trials,options=>{
      captured=options;
      throw new Error('stop after capturing runner contract');
    }),/stop after capturing runner contract/);
    assert.ok(captured);
    assert.equal(captured.allowAdditionalOriginalSourceRanks,true,
      'rank3 is authenticated but is outside the historical [6,11] default');
    assert.equal(captured.allowExtendedRegisteredNativeRootCap,true);
    assert.equal(captured.actorOnlyComposition,true);
    assert.equal(captured.sourceIndependentCommonPolicy,true);
    assert.equal(captured.nativeRootActionLimit,registration.rootLimit);
    assert.equal(captured.actorColoredStarterBias,bias);
    assert.equal(captured.registeredTrials,trials);
    assert.equal(captured.registeredFrameName,
      'agent41-rank3-one-energy-setup-alternative-native-v1'+
      (bias?'-treatment':'-control')+'-rank3-same-original-sixties');
  }
});
