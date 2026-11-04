'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  VERSION,openingBenchOccupancyTradeoff,
  originalAndCandidateOccupancy
}=require('../simulation/evaluation/agent50-setup-bench-occupancy-tradeoff.cjs');

test('toy 8-card deck: exact formula matches independent 3-card combination oracle',()=>{
  const N=8,B=4,S=2,H=3,M=2;
  const actual=openingBenchOccupancyTradeoff(B,S,{
    deckSize:N,handSize:H,maxSelected:M
  });
  const counters={
    valid:0,greedyAnyBench:0,protectedAnyBench:0,addedSolo:0,
    greedyBenchSlots:0,protectedBenchSlots:0,
    avoidableSolo:0,avoidableBench:0,allBasic:0
  };
  for(let a=0;a<N;a++)for(let b=a+1;b<N;b++)for(let c=b+1;c<N;c++){
    const cards=[a,b,c];
    const t=cards.filter(i=>i<S).length;
    const r=cards.filter(i=>i>=S&&i<B).length;
    const k=t+r;
    if(k===0)continue;
    counters.valid++;
    const gb=Math.min(k-1,M-1);
    const pb=Math.min(Math.max(r-1,0),M-1);
    counters.greedyAnyBench+=Number(gb>0);
    counters.protectedAnyBench+=Number(pb>0);
    counters.addedSolo+=Number(gb>0&&pb===0);
    counters.greedyBenchSlots+=gb;
    counters.protectedBenchSlots+=pb;
    counters.avoidableSolo+=Number(t>=1&&r>=1&&k<=M&&pb===0);
    counters.avoidableBench+=Number(t>=1&&r>=1&&k<=M&&pb>0);
    counters.allBasic+=Number(k===H);
  }
  assert.equal(VERSION,'agent50-setup-bench-occupancy-tradeoff-v1');
  assert.equal(BigInt(counters.valid),actual.validOpeningCount);
  for(const [key,expected] of [
    ['greedyAnyBench',counters.greedyAnyBench],
    ['protectedAnyBench',counters.protectedAnyBench],
    ['additionalSoloActiveUnderProtection',counters.addedSolo],
    ['greedyBenchSlots',counters.greedyBenchSlots],
    ['protectedBenchSlots',counters.protectedBenchSlots],
    ['avoidableTriggerAndProtectedSolo',counters.avoidableSolo],
    ['avoidableTriggerAndProtectedBench',counters.avoidableBench],
    ['sevenBasicOpenings',counters.allBasic]
  ])
    assert.equal(actual.numerators[key],BigInt(expected),key);
  assert.deepEqual(counters,{
    valid:52,greedyAnyBench:28,protectedAnyBench:6,
    addedSolo:22,greedyBenchSlots:28,protectedBenchSlots:6,
    avoidableSolo:16,avoidableBench:0,allBasic:4
  });
});

test('original 29 physical opening has measurable retention-versus-Bench tradeoff',()=>{
  const r=originalAndCandidateOccupancy();
  const m=r.originalEqualRankMeans;
  assert.equal(r.originalKnownRanks,29);
  assert.deepEqual(r.originalUnknownRanks,[23,25,28]);
  assert.equal(r.structuralCandidates,4);
  assert.equal(r.competitiveQualifiedGames,0);
  assert.equal(r.selectedPolicyChanged,false);
  const expected={
    greedyAnyBench:0.5298270254543347,
    protectedAnyBench:0.40891368247081317,
    extraSoloActiveSetupProbability:0.1209133429835215,
    greedyExpectedSetupBenchSlots:0.7631133185040354,
    protectedExpectedSetupBenchSlots:0.547104050494939,
    expectedBenchSlotsPreservedByGreedy:0.21600926800909636,
    avoidableTriggerProtectedSoloProbability:0.10937919847726689,
    avoidableTriggerProtectedBenchProbability:0.07500014030708434
  };
  for(const [key,value] of Object.entries(expected))
    assert.ok(Math.abs(m[key]-value)<1e-12,key+' '+m[key]);
  const fourth=r.originalRows.find(x=>x.rank===4);
  assert.ok(Math.abs(fourth.extraSoloActiveSetupProbability-
    0.3475413936411032)<1e-12);
  assert.ok(Math.abs(fourth.avoidableTriggerProtectedSoloProbability-
    0.2645693228471153)<1e-12);
  assert.ok(r.originalRows.every(x=>
    x.protectedAnyBench<=x.greedyAnyBench&&
    x.protectedExpectedSetupBenchSlots<=x.greedyExpectedSetupBenchSlots));
  console.log('AGENT50_BENCH_RETENTION_29_ORIGINALS',JSON.stringify({
    schema:VERSION,rankCount:r.originalKnownRanks,means:m,
    selectedRanks:r.originalRows.filter(x=>[1,4,11,18,19].includes(x.rank))
      .map(x=>({rank:x.rank,basics:x.basics,supports:x.entrySupportBasics,
        addedSolo:x.extraSoloActiveSetupProbability,
        avoidableSolo:x.avoidableTriggerProtectedSoloProbability}))
  }));
});

test('all four structural candidates have exact separate Bench occupancy costs',()=>{
  const r=originalAndCandidateOccupancy();
  const [apex,adp,sentinel,arven]=r.candidateRows;
  assert.deepEqual(r.candidateRows.map(x=>x.basics),[12,7,14,12]);
  assert.deepEqual(r.candidateRows.map(x=>x.entrySupportBasics),[1,2,0,2]);
  assert.ok(Math.abs(apex.extraSoloActiveSetupProbability-
    0.06025808969034811)<1e-12);
  assert.ok(Math.abs(adp.extraSoloActiveSetupProbability-
    0.1423343679911528)<1e-12);
  assert.equal(sentinel.extraSoloActiveSetupProbability,0);
  assert.ok(Math.abs(arven.extraSoloActiveSetupProbability-
    0.12126318049256005)<1e-12);
  console.log('AGENT50_BENCH_RETENTION_CANDIDATE4',JSON.stringify(
    r.candidateRows.map(x=>({
      name:x.name,greedyAnyBench:x.greedyAnyBench,
      protectedAnyBench:x.protectedAnyBench,
      extraSolo:x.extraSoloActiveSetupProbability,
      potentialTriggerPreservationWithSolo:
        x.avoidableTriggerProtectedSoloProbability
    }))));
});
