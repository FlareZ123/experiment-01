'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {preflight,compare,IDS}=require(
  '../../simulation/evaluation/2026-11/agent35-hood-switch-vs-teammates-32-native.cjs');
const reg=require(
  '../../results/aichi-2026/registrations/2026-11/agent35-hood-switch-vs-teammates-32-prospective-20261109.json');

test('sealed prospective source and single-switch exact sixty registration',()=>{
  assert.equal(preflight().nativeGames,32);
  assert.deepEqual(IDS,['hood-shield-v1','hood-switch-v2']);
  assert.equal(new Set(reg.registeredTrials.map(x=>x.id)).size,32);
  assert.equal(new Set(reg.sourceGroups.map(x=>x.seed)).size,16);
});
test('comparison cannot fabricate unobserved native victories',()=>{
  const rows=reg.registeredTrials.map(trial=>({
    trialId:trial.id,rank:trial.rank,seed:trial.seed,
    candidateSlot:trial.candidateSlot,candidateId:trial.candidateId,
    sourceDealFingerprint:'source:'+trial.rank+':'+trial.candidateSlot,
    actualStarterSeat:0,status:'ACTION_CAP',finished:false,
    nativeCandidateWin:false,switchPlayed:0,teammatesPlayed:0,
    hoodPlayed:0,arvenPlayed:0,maxGeist:0
  }));
  const result=compare(rows);
  assert.equal(result.groups.length,16);
  assert.equal(result.summary.sourceMatched.matchedGroups,16);
  assert.deepEqual(result.summary.sourceMatched.sharpNativeWinDifferenceRightMinusLeft,
    {lower:-16,upper:16});
  assert.equal(result.summary.competitivelyPaperQualifiedGames,0);
});
test('mismatched opponent actual source opening cannot enter paired bound',()=>{
  const rows=reg.registeredTrials.map(trial=>({
    trialId:trial.id,rank:trial.rank,seed:trial.seed,
    candidateSlot:trial.candidateSlot,candidateId:trial.candidateId,
    sourceDealFingerprint:trial.id,actualStarterSeat:0,
    status:'ENGINE_TERMINAL',finished:true,
    nativeCandidateWin:true,switchPlayed:0,teammatesPlayed:0,
    hoodPlayed:0,arvenPlayed:0,maxGeist:0
  }));
  assert.equal(compare(rows).summary.sourceMatched.matchedGroups,0);
});
