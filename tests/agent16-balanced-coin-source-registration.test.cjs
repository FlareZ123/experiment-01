'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {sourceFirstFromSeed,firstCoinValue}=require(
  '../scripts/agent6-frozen-first-coin-census.cjs');
const plan=JSON.parse(fs.readFileSync(path.resolve(__dirname,
  '../results/aichi-2026/registrations/agent16-balanced-native-rank6-rank11-coins-20261101.json'),
'utf8'));

test('prospective 16 seed pairs cover both true coin outcomes in all four rank/seat cells',()=>{
  assert.deepEqual(plan.ranks,[6,11]);
  assert.deepEqual(plan.candidateSlots,['A','B']);
  assert.deepEqual(plan.candidateIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.equal(plan.independentPhysicalPairs,16);
  assert.equal(plan.attemptedNativeArms,32);
  const used=new Set();
  for(const rank of plan.ranks)for(const slot of plan.candidateSlots){
    const seeds=plan.seeds[String(rank)][slot];
    assert.equal(seeds.length,4);
    const flags=seeds.map(seed=>{
      assert.ok(Number.isSafeInteger(seed)&&seed>=0&&seed<=0xffffffff);
      assert.ok(!used.has(seed),'duplicate prospective seed across cells');
      used.add(seed);
      return sourceFirstFromSeed(slot,seed).sourceFirst;
    });
    assert.equal(flags.filter(Boolean).length,2);
    assert.equal(flags.filter(x=>!x).length,2);
    assert.deepEqual(seeds.map(seed=>firstCoinValue(seed)<0.5),
      [true,false,true,false]);
  }
  assert.equal(used.size,16);
  assert.equal(plan.qualifications.hasRunNativeGames,false);
  assert.equal(plan.qualifications.competitiveQualifiedGames,0);
});

test('every acceptance and rejection follows only first coin stratum, before gameplay',()=>{
  assert.equal(plan.seedAttempts.length,18);
  assert.equal(plan.seedRejections,2);
  const accepted=new Map(),unused=new Set();
  let rejections=0;
  for(const row of plan.seedAttempts){
    const key=row.rank+':'+row.candidateSlot;
    const seen=accepted.get(key)??{true:0,false:0};
    const predicted=firstCoinValue(row.seed)<0.5;
    assert.equal(row.coinHeads,predicted);
    assert.ok(!unused.has(row.seed));
    unused.add(row.seed);
    const shouldAccept=seen[String(predicted)]<2;
    assert.equal(row.selected,shouldAccept,
      'coin-only acceptance violated at '+key);
    if(shouldAccept)seen[String(predicted)]++;
    else rejections++;
    accepted.set(key,seen);
  }
  for(const row of accepted.values()){
    assert.equal(row.true,2);
    assert.equal(row.false,2);
  }
  assert.equal(accepted.size,4);
  assert.equal(rejections,2);
  for(const rank of plan.ranks)for(const slot of plan.candidateSlots){
    const key=rank+':'+slot;
    const selected=plan.seedAttempts
      .filter(row=>row.rank===rank&&row.candidateSlot===slot&&row.selected)
      .map(row=>row.seed).sort((a,b)=>a-b);
    assert.deepEqual([...plan.seeds[String(rank)][slot]].sort((a,b)=>a-b),
      selected);
  }
});

test('all recorded native start predictions follow pinned coin-winner choice',()=>{
  assert.equal(plan.flatPredictions.length,16);
  for(const row of plan.flatPredictions){
    assert.equal(plan.seeds[String(row.rank)][row.candidateSlot][row.repeat],
      row.seed);
    const predicted=sourceFirstFromSeed(row.candidateSlot,row.seed);
    assert.equal(row.predictedCoinWinnerSeat,predicted.coinWinner);
    assert.equal(row.predictedFirstSeat,predicted.firstSeat);
    assert.equal(row.predictedSourceFirst,predicted.sourceFirst);
  }
  assert.equal(plan.enginePin,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(plan.status,
    'unexecuted-preregistered-development-seeds-not-a-selected-competitive-policy');
  assert.match(plan.runProfile,/No run options/);
});
