'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const reg=require('../../results/aichi-2026/registrations/2026-11/agent35-connected-switch-same60-32-prospective-20261109.json');
const {VERSION,IDS,preflight,compare}=
  require('../../simulation/evaluation/2026-11/agent35-connected-switch-same60-32-native.cjs');

test('registration frozen before first connected-policy game, hashes intact',()=>{
  assert.equal(reg.schema,VERSION);
  assert.deepEqual(preflight(),{
    sameExactSixty:true,registeredGroups:16,registeredGames:32,paperQualifiedGames:0
  });
  assert.equal(reg.correctionOf.includes('swallowed'),true);
});
test('only intervention is generic tactical Switch, both seats frozen',()=>{
  assert.equal(reg.registeredTrials.length,32);
  assert.deepEqual(reg.comparisonArms,IDS);
  assert.equal(reg.sharedPolicyFlags.actorOpponentBlockSwitchRoot,true);
  assert.equal(reg.sharedPolicyFlags.actorGenericTacticalSwitchRoot,undefined);
  assert.deepEqual(reg.treatmentOnlyFlags,{actorGenericTacticalSwitchRoot:true});
  assert.equal(new Set(reg.sourceGroups.map(x=>x.seed)).size,16);
  assert.equal(new Set(reg.registeredTrials.map(x=>x.id)).size,32);
});
test('unsettled native outcomes cannot turn into wins in matched reporting',()=>{
  const r=reg.registeredTrials.map(t=>({
    trialId:t.id,rank:t.rank,seed:t.seed,
    candidateSlot:t.candidateSlot,candidateId:t.candidateId,
    status:'ACTION_CAP',finished:false,nativeCandidateWin:false,
    sourceDealFingerprint:'src:'+t.seed,actualStarterSeat:0,
    physicalDeal:'all:'+t.seed,switchPlayed:0,maxGeist:0
  }));
  const x=compare(r);
  assert.equal(x.summary.attemptedNativeGames,32);
  assert.equal(x.summary.perArm[IDS[0]].actionCaps,16);
  assert.equal(x.summary.perArm[IDS[1]].actionCaps,16);
  assert.equal(x.summary.independentlyPaperQualifiedGames,0);
});
