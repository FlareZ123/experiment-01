'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {IDS,preflight,compareTwo,compare}=require(
  '../../simulation/evaluation/2026-11/agent35-three-architecture-eight-rank-native.cjs');
const registration=require(
  '../../results/aichi-2026/registrations/2026-11/agent35-three-architecture-eight-rank-prospective-20261109.json');

test('three distinct unchanged sixty-card contenders and 48 sealed source trials',()=>{
  const result=preflight();
  assert.equal(result.physicalGroups,16);
  assert.equal(result.nativeGames,48);
  assert.equal(new Set(registration.registeredTrials.map(x=>x.id)).size,48);
  assert.deepEqual(IDS,['champion-reference','hood-shield-v1',
    'thorns-safeguard-pivot-v1']);
});

test('censored source-paired native comparisons expose sharp bounds',()=>{
  const pair={rank:5,slot:'B',seed:2124883768,rows:{
    'champion-reference':{
      sourceDealFingerprint:'s',actualStarterSeat:1,finished:true,
      nativeCandidateWin:true,status:'ENGINE_TERMINAL'},
    'hood-shield-v1':{
      sourceDealFingerprint:'s',actualStarterSeat:1,finished:false,
      nativeCandidateWin:false,status:'ACTION_CAP'}
  }};
  const result=compareTwo([pair],IDS[0],IDS[1]);
  assert.equal(result.matchedGroups,1);
  assert.equal(result.doubleTerminal,0);
  assert.deepEqual(result.sharpNativeWinDifferenceRightMinusLeft,
    {lower:-1,upper:0});
  pair.rows['hood-shield-v1']={...pair.rows['hood-shield-v1'],
    sourceDealFingerprint:'other'};
  assert.equal(compareTwo([pair],IDS[0],IDS[1]).matchedGroups,0);
});

test('full 48-row comparator preserves every registered group and cancellation',()=>{
  const data=registration.registeredTrials.map(trial=>({
    trialId:trial.id,rank:trial.rank,seed:trial.seed,
    candidateId:trial.candidateId,candidateSlot:trial.candidateSlot,
    sourceDealFingerprint:'source:'+trial.rank+':'+trial.candidateSlot,
    actualStarterSeat:0,status:'ACTION_CAP',
    finished:false,nativeCandidateWin:false,
    ghostEye:0,maxGeist:0,voltCyclone:0,getLost:0,
    hoodPlayed:0,arvenPlayed:0
  }));
  const result=compare(data);
  assert.equal(result.groups.length,16);
  assert.equal(result.summary.allThreeMatchedSourceGroups,16);
  assert.equal(result.summary.pairwise.length,3);
  assert.ok(result.summary.pairwise.every(x=>
    x.matchedGroups===16&&x.doubleTerminal===0&&
    x.sharpNativeWinDifferenceRightMinusLeft.lower===-16&&
    x.sharpNativeWinDifferenceRightMinusLeft.upper===16));
  assert.equal(result.summary.competitivelyPaperQualifiedGames,0);
});

test('all source IDs are from the eight selected authenticated exact original ranks',()=>{
  const ranks=[...new Set(registration.registeredTrials.map(x=>x.rank))]
    .sort((a,b)=>a-b);
  assert.deepEqual(ranks,[1,2,5,6,7,11,24,29]);
  assert.deepEqual(registration.missingOriginalRanks,[23,25,28]);
  assert.equal(registration.candidatePhysicalDealMatchedNotAssumed,true);
});
