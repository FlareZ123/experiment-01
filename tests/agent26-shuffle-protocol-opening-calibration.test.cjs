'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {seededRandom}=require('../simulation/twinleaf/headless.cjs');
const {hashDerivedSetupSeatSeed}=
  require('../simulation/evaluation/agent26-per-seat-setup-shuffle-streams.cjs');
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
  assert.equal(sets.length,4);
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
  assert.notDeepEqual(sets[2],sets[3]);
  assert.notEqual(hashDerivedSetupSeatSeed(seed,0),
    hashDerivedSetupSeatSeed(seed,1));
  assert.deepEqual(firstPhysicalShuffles(seed,Object.keys(PROTOCOLS)[0]),sets[0]);
  assert.throws(()=>firstPhysicalShuffles(seed,'unregistered protocol'));
});

test('XOR-salted linear xorshift produces fixed cross-seat word masks and opposite halves',()=>{
  const cases=[
    {salts:PROTOCOLS['setup-intercept-perseat-v1'],mask:0x973582b0},
    {salts:PROTOCOLS['headless-builtin-perseat-v1'],mask:0x84e30d3c}
  ];
  for(const {salts,mask} of cases){
    for(const seed of [1,2,13,20261106,0xffffffff]){
      assert.notEqual(seed,salts[0]);
      assert.notEqual(seed,salts[1]);
      const left=seededRandom((seed^salts[0])>>>0);
      const right=seededRandom((seed^salts[1])>>>0);
      const maskStream=seededRandom((salts[0]^salts[1])>>>0);
      for(let i=0;i<59;i++){
        const a=Math.floor(left()*2**32);
        const b=Math.floor(right()*2**32);
        const expected=Math.floor(maskStream()*2**32);
        assert.equal((a^b)>>>0,expected);
        if(i===0)assert.equal(expected,mask);
      }
      const [a,b]=firstPhysicalShuffles(seed,
        cases[0].salts===salts?'setup-intercept-perseat-v1':
          'headless-builtin-perseat-v1');
      assert.notEqual(a[59]<30,b[59]<30);
      console.log('AGENT26_XOR_SHUFFLE_SFT',JSON.stringify({
        seed,salts,firstXorMask:mask,
        firstSelectedOriginalIndices:[a[59],b[59]],
        firstSwapSameHalf:false
      }));
    }
  }
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
  assert.equal(Object.keys(a.protocols).length,4);
  for(const [name,row] of Object.entries(a.protocols)){
    assert.ok(PROTOCOLS.hasOwnProperty(name));
    assert.equal(row.noBasicCounts.length,2);
    assert.ok(row.noBasicCounts.every(x=>x>=0&&x<=2000));
    assert.ok(row.noBasicRates.every(x=>x>=0&&x<=1));
    assert.ok(Number.isFinite(row.jointZAgainstIndependentUniform));
    assert.ok(Number.isFinite(row.firstSevenIndexOverlapMean));
    assert.ok(Number.isFinite(row.firstSwapHalfZAgainstIndependentUniform));
    assert.ok(row.firstSwapSameHalfRate>=0&&row.firstSwapSameHalfRate<=1);
    assert.ok(row.firstSevenIndexOverlapMean>=0);
    console.log('AGENT26_CALIBRATION_SFT',JSON.stringify({
      name, noBasicRates:row.noBasicRates,
      jointNoBasicRate:row.jointNoBasicRate,
      avgSharedOriginalIndices:row.firstSevenIndexOverlapMean,
      firstSwapSameHalfRate:row.firstSwapSameHalfRate,
      marginalZ:row.marginalZAgainstIndependentUniform,
      jointZ:row.jointZAgainstIndependentUniform
    }));
  }
  for(const name of ['setup-intercept-perseat-v1',
    'headless-builtin-perseat-v1']){
    assert.equal(a.protocols[name].firstSwapSameHalfCount,0);
  }
  const v2=a.protocols['setup-sha256-domain-separated-perseat-v2'];
  assert.ok(v2.firstSwapSameHalfRate>0.40&&
    v2.firstSwapSameHalfRate<0.60);
  assert.ok(a.expected.noBasicPerSeat>0.16&&
    a.expected.noBasicPerSeat<0.17);
});
