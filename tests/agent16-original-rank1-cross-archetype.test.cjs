'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {scheduledArms,preflight,summarizeEight}=
  require('../simulation/evaluation/agent16-original-rank1-shadow-rider-development.cjs');

test('precommit validates exact original Shadow Rider 60, registration and policy options',()=>{
  const p=preflight();
  assert.equal(p.originalRank,1);
  assert.equal(p.originalArchetype,'Shadow Rider Calyrex');
  assert.equal(p.originalPrintedCardCount,60);
  assert.equal(p.trialCount,8);
  assert.equal(p.competitiveQualified,false);
});

test('all eight native attempts are two distinct physical-seat and candidate arms per repeat',()=>{
  const trials=scheduledArms();
  assert.equal(trials.length,8);
  for(const repeat of [0,1]){
    for(const candidateSlot of ['A','B']){
      const paired=trials.filter(x=>x.repeat===repeat&&
        x.candidateSlot===candidateSlot);
      assert.equal(paired.length,2);
      assert.equal(paired[0].seed,paired[1].seed);
      assert.deepEqual(paired.map(x=>x.candidateId),
        ['champion-reference','new-moon-lockbreaker-v1']);
    }
  }
  assert.equal(new Set(trials.map(x=>x.seed)).size,4);
  assert.ok(trials.every(x=>x.rank===1));
});

test('new rank1 admission is only in opt-in source set, legacy rank6/11 default remains',()=>{
  const script=fs.readFileSync(path.resolve(__dirname,
    '../simulation/evaluation/agent41-bilateral-v2-development.cjs'),'utf8');
  assert.match(script,
    /allowAdditionalOriginalSourceRanks\?\[1,3,4,6,7,10,11,15,21,24,29\]:\[6,11\]/);
});


test('readout honors actual success schema and retains native failures in the denominator',()=>{
  const summary=summarizeEight([
    {trial:{id:'1:0:A:champion-reference',rank:1,candidateId:'champion-reference'},
      sourceSeat:1,candidateSeat:0,sourceActuallyFirst:true,
      finished:true,winner:1,attackDeclarations:{source:5,candidate:2},
      physicalZoneQualification:{status:'SETTLED_PHYSICAL_INTEGRITY_PASSED'},
      nativeSetupCoinChoiceReceipt:{
        status:'consistent-accepted-native-setup-and-first-draw'},
      fullPhysicalDealFingerprint:'a'.repeat(64),rootActionCount:88},
    {trial:{id:'1:0:A:new-moon-lockbreaker-v1',rank:1,
      candidateId:'new-moon-lockbreaker-v1'},sourceSeat:1,candidateSeat:0,
      sourceActuallyFirst:false,finished:false,rootActionCount:260,
      physicalZoneQualification:{status:'SETTLED_PHYSICAL_INTEGRITY_PASSED'}},
    {trial:{id:'1:0:B:champion-reference',rank:1,candidateId:'champion-reference'},
      status:'engine-error',error:'CANNOT_PLAY_THIS_CARD',
      physicalZoneQualification:{status:'NATIVE_GAME_ABORT'}}
  ]);
  assert.deepEqual(summary.statuses,{
    'engine-terminal':1,'native-unfinished':1,'engine-error':1});
  assert.deepEqual(summary.nativeWinners,{candidate:0,source:1,tie:0,unknown:0});
  assert.deepEqual(summary.starts,{sourceFirst:1,candidateFirst:1,unknown:1});
  assert.equal(summary.physicalPass,2);
  assert.equal(summary.initialDealFingerprints,1);
  assert.equal(summary.nativeCoinReceipts,1);
  assert.equal(summary.independentlyQualifiedGameCount,0);
  assert.equal(summary.summaryTrials[2].error,'CANNOT_PLAY_THIS_CARD');
});
