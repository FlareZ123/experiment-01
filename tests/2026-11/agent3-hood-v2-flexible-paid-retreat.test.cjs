'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const registration=require('../../results/aichi-2026/registrations/2026-11/agent3-hood-v2-flexible-paid-retreat-20261109.json');
const deck=require('../../results/aichi-2026/candidate-hood-consistency-v2.json');
const frozen=require('../../simulation/evaluation/agent41-frozen-bilateral-development-v2.json');
const {SOURCE_POLICY}=require('../../simulation/evaluation/agent3/hood-consistency-v2-targeted-native.cjs');
const {preflight,PROFILE_FLAGS,compare,receipt}=
  require('../../simulation/evaluation/agent3/hood-v2-flexible-paid-retreat-native.cjs');

test('one identical printed sixty in both treatment arms',()=>{
  assert.equal(preflight().samePrinted60,true);
  assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(registration.registeredNativeAttempts,18);
  assert.equal(registration.registeredSourceGroups.length,9);
  assert.deepEqual(registration.sourceRanks,[5,6]);
  assert.equal(registration.registeredSourceGroups[0].sample,
    'ARCHIVED_POSTHOC_ANCHOR');
  assert.deepEqual(registration.controlAdditionalFlags,{});
  assert.deepEqual(registration.treatmentAdditionalFlags,
    {actorFlexiblePaidRetreatRoot:true});
  assert.equal(frozen.policyOptions.actorFlexiblePaidRetreatRoot??false,false);
  assert.equal(SOURCE_POLICY.actorFlexiblePaidRetreatRoot??false,false);
  assert.deepEqual(PROFILE_FLAGS,
    {celestialRoar:true,mewEnergyMix:true,attachEnergyTarget:true});
});

test('original posthoc anchor kept separate from eight fresh registrations',()=>{
  const seeds=registration.registeredSourceGroups.map(g=>g.seed);
  assert.equal(new Set(seeds).size,9);
  assert.deepEqual(registration.registeredSourceGroups
    .filter(g=>g.sample==='ARCHIVED_POSTHOC_ANCHOR')
    .map(g=>[g.rank,g.repeat,g.candidateSlot,g.seed]),
    [[5,8102,'B',2143005893]]);
  for(const g of registration.registeredSourceGroups){
    assert.deepEqual(registration.registeredTrials.filter(t=>
      t.rank===g.rank&&t.repeat===g.repeat&&
      t.candidateSlot===g.candidateSlot).map(t=>t.candidateId),
      registration.arms);
  }
});

function syntheticRows(){
  return registration.registeredTrials.map(t=>({
    id:t.id,candidateId:t.candidateId,sample:t.sample,
    rank:t.rank,repeat:t.repeat,
    seed:t.seed,seat:t.candidateSlot==='A'?0:1,
    terminal:true,candidateNativeWin:false,
    status:'ENGINE_TERMINAL',actualStarterSeat:0,
    fullPhysicalDealFingerprint:'physical:'+t.seed,
    sourceDealFingerprint:'source:'+t.seed,
    candidatePaidRetreats:0,candidateFilch:1,
    candidateMaxGeist:0,candidateNightWatch:0
  }));
}

test('paired bounds count the eight fresh groups independently of posthoc anchor',()=>{
  const rows=syntheticRows();
  rows[1].candidateNativeWin=true;
  let out=compare(rows);
  assert.equal(out.summary.registeredSourceGroups,9);
  assert.equal(out.summary.physicallyComparableGroups,9);
  assert.equal(out.summary.prospectivePhysicallyComparable,8);
  assert.equal(out.summary.matchedObservedTreatmentGains,1);
  assert.deepEqual(out.summary.allMatchedSharpCensorBounds,
    {lower:1,upper:1});
  assert.deepEqual(out.summary.prospectiveOnlySharpCensorBounds,
    {lower:0,upper:0});
  rows[3].terminal=false;
  out=compare(rows);
  assert.deepEqual(out.summary.prospectiveOnlySharpCensorBounds,
    {lower:0,upper:1});
  rows[3].fullPhysicalDealFingerprint='different-physical';
  out=compare(rows);
  assert.equal(out.summary.prospectivePhysicallyComparable,7);
  assert.deepEqual(out.summary.prospectiveOnlySharpCensorBounds,
    {lower:0,upper:0});
});

test('native receipt counts owned genuine retreat and attack roots only',()=>{
  const r=receipt({
    trial:registration.registeredTrials[0],finished:true,winner:0,
    fullPhysicalDealFingerprint:'physical',
    sourceDealFingerprint:'source',actualStarterSeat:0,
    rootActionLedger:[
      {playerSlot:1,action:'RetreatAction',turnBefore:7},
      {playerSlot:1,action:'AttackAction',attack:'Night Watch'},
      {playerSlot:0,action:'AttackAction',attack:'Filch'},
      {playerSlot:1,action:'AttackAction',attack:'Filch'}
    ]
  });
  assert.equal(r.seat,1);
  assert.equal(r.candidatePaidRetreats,1);
  assert.equal(r.candidateNightWatch,1);
  assert.equal(r.candidateFilch,1);
  assert.equal(r.candidateNativeWin,false);
  assert.equal(r.paperQualified,false);
});
