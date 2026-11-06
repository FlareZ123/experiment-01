'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,PROTOCOLS,rank4Basics,sourceSeed,
  firstPhysicalShuffles,runCalibration}=
  require('../scripts/agent26-shuffle-protocol-opening-calibration.cjs');

test('rank4 source Basic indices are collector-verified and exactly 13 of 60',()=>{
  const expected=[0,1,5,8,9,10,11,12,13,14,15,16,17];
  assert.deepEqual(rank4Basics(),expected);
});

test('first shuffle uses real headless deterministic Fisher-Yates with distinct protocols',()=>{
  const seed=sourceSeed(0);
  const sets=Object.keys(PROTOCOLS).map(p=>firstPhysicalShuffles(seed,p));
  assert.equal(sets.length,3);
  for(const [a,b] of sets){
    for(const sequence of [a,b]){
      assert.equal(sequence.length,60);
      assert.deepEqual([...sequence].sort((x,y)=>x-y),
        Array.from({length:60},(_,i)=>i));
    }
    assert.notDeepEqual(a,b);
  }
  assert.notDeepEqual(sets[0],sets[1]);
  assert.notDeepEqual(sets[1],sets[2]);
  assert.deepEqual(firstPhysicalShuffles(seed,Object.keys(PROTOCOLS)[0]),sets[0]);
  assert.throws(()=>firstPhysicalShuffles(seed,'unregistered protocol'));
});

test('finite deterministic field-matched index-only sensitivity, no game claims',()=>{
  const a=runCalibration(2000);
  const b=runCalibration(2000);
  assert.deepEqual(a,b);
  assert.equal(a.version,VERSION);
  assert.equal(a.sourceRank,4);
  assert.equal(a.printedBasics,13);
  assert.equal(a.simulatorGames,0);
  assert.equal(a.competitiveQualifiedGames,0);
  assert.equal(Object.keys(a.protocols).length,3);
  for(const [name,row] of Object.entries(a.protocols)){
    assert.ok(PROTOCOLS.hasOwnProperty(name));
    assert.equal(row.noBasicCounts.length,2);
    assert.ok(row.noBasicCounts.every(x=>x>=0&&x<=2000));
    assert.ok(row.noBasicRates.every(x=>x>=0&&x<=1));
    assert.ok(Number.isFinite(row.jointZAgainstIndependentUniform));
    assert.ok(Number.isFinite(row.firstSevenIndexOverlapMean));
    assert.ok(row.firstSevenIndexOverlapMean>=0);
    console.log('AGENT26_CALIBRATION_SFT',JSON.stringify({
      name, noBasicRates:row.noBasicRates,
      jointNoBasicRate:row.jointNoBasicRate,
      avgSharedOriginalIndices:row.firstSevenIndexOverlapMean,
      marginalZ:row.marginalZAgainstIndependentUniform,
      jointZ:row.jointZAgainstIndependentUniform
    }));
  }
  assert.ok(a.expected.noBasicPerSeat>0.16&&
    a.expected.noBasicPerSeat<0.17);
});
