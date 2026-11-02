'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {choose,maxUnits,analyze}=
  require('../scripts/agent43-raichu-prize-energy-envelope.cjs');

test('exact combinatorics handles impossible draws and exhaustive 60-card normalization',()=>{
  assert.equal(choose(60,6),50063860n);
  assert.equal(choose(4,0),1n);
  assert.equal(choose(4,5),0n);
  assert.equal(choose(4,-1),0n);
  assert.equal(maxUnits(4,4,4,5),14);
  assert.equal(maxUnits(4,4,4,10),22);
  assert.equal(maxUnits(4,4,4,12),24);
  assert.equal(maxUnits(4,0,0,5),null);
  const result=analyze();
  assert.equal(result.exactValidSevenPrizeWays,'7422507311299080');
  assert.equal(result.eligibleBasics,13);
  const expectations=[
    [5,14,420,0.6463454902230995,1],
    [10,22,660,0.4022747727708281,0.9104397316962688],
    [12,24,720,0.24220709628835133,0.24220709628835133]
  ];
  for(const [n,max,damage,probability,available] of expectations){
    const row=result.results[n];
    assert.equal(row.maxUnits,max);
    assert.equal(row.maxNominalDamage,damage);
    assert.ok(Math.abs(row.maxUnitProbability-probability)<1e-12);
    assert.ok(Math.abs(row.enoughEnergyProbability-available)<1e-12);
    const histogramSum=Object.values(row.frequencyByUnits)
      .reduce((total,entry)=>total+BigInt(entry.numerator),0n);
    assert.equal(histogramSum,7422507311299080n);
  }
});
