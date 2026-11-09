'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const registration=require('../../results/aichi-2026/registrations/2026-11/agent3-skyliner-public-free-native-20261109.json');
const candidate=require('../../results/aichi-2026/candidate-hood-consistency-v2.json');
const {preflight,compare,VERSION,nativeReceipt}=
  require('../../simulation/evaluation/agent3/skyliner-public-free-native-prospective.cjs');

test('fresh four-rank A/B preregistration and exact fixed sixty are valid',()=>{
  assert.equal(VERSION,registration.schema);
  const receipt=preflight();
  assert.equal(receipt.registeredProspectiveGroups,16);
  assert.equal(receipt.registeredNativeAttempts,32);
  assert.equal(receipt.printedSixtyUnchanged,true);
  assert.equal(candidate.cards.reduce((sum,x)=>sum+x.count,0),60);
  assert.deepEqual(registration.originalRanks,[5,6,7,11]);
  assert.deepEqual(registration.treatmentOnlyFlags,
    {actorSkylinerFundedBenchRetreatRoot:true});
  assert.ok(registration.sourceGroups.every(g=>g.sample==='PROSPECTIVE'));
  assert.equal(new Set(registration.sourceGroups.map(g=>g.seed)).size,16);
});

function fakeRows(){
  return registration.registeredTrials.map(t=>({
    id:t.id,rank:t.rank,candidateId:t.candidateId,
    seat:t.candidateSlot==='A'?0:1,repeat:t.repeat,seed:t.seed,
    terminal:true,candidateNativeWin:false,status:'ENGINE_TERMINAL',
    actualStarterSeat:0,
    fullPhysicalDealFingerprint:'physical:'+t.seed,
    sourceDealFingerprint:'source:'+t.seed,
    candidatePaidRetreats:0,sourceRetreatRoots:0,
    candidateFilch:0,candidateMaxGeist:0,candidateNightWatch:0,
    skylinerRootSelected:0,roots:[]
  }));
}

test('sharp outcome comparisons retain all 16 pair outcomes and avoid cap imputation',()=>{
  const rows=fakeRows();
  rows[1].candidateNativeWin=true;
  let out=compare(rows);
  assert.equal(out.summary.registeredProspectiveGroups,16);
  assert.equal(out.summary.physicallyComparableGroups,16);
  assert.equal(out.summary.matchedBothTerminal,16);
  assert.equal(out.summary.treatmentWinGains,1);
  assert.equal(out.summary.treatmentWinLosses,0);
  assert.deepEqual(out.summary.prospectiveSharpNativeWinCountDifference,
    {lower:1,upper:1});
  rows[3].terminal=false;
  out=compare(rows);
  assert.deepEqual(out.summary.prospectiveSharpNativeWinCountDifference,
    {lower:1,upper:2});
  rows[3].fullPhysicalDealFingerprint='mismatch';
  out=compare(rows);
  assert.equal(out.summary.physicallyComparableGroups,15);
  assert.deepEqual(out.summary.prospectiveSharpNativeWinCountDifference,
    {lower:1,upper:1});
});

test('native receipts retain source and candidate root separation',()=>{
  const trial=registration.registeredTrials[1];
  const item={
    trial,finished:true,winner:1,
    fullPhysicalDealFingerprint:'f',sourceDealFingerprint:'s',
    actualStarterSeat:0,
    rootActionLedger:[
      {playerSlot:0,action:'RetreatAction'},
      {playerSlot:1,action:'RetreatAction'},
      {playerSlot:1,action:'AttackAction',attack:'Night Watch'}
    ],
    actorOnlyDecisionCoverage:{detailedComponentAudits:{
      root:{skylinerFundedBenchRetreatSelected:1,
        skylinerFundedBenchRetreatRootOptIn:true}
    }}
  };
  const r=nativeReceipt(item);
  assert.equal(r.sourceRetreatRoots,1);
  assert.equal(r.candidatePaidRetreats,1);
  assert.equal(r.skylinerRootSelected,1);
  assert.equal(r.skylinerPolicyOptIn,true);
  assert.equal(r.nativeTruePaperQualified,false);
});
