'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {rank6Groups,exactExpandedOpening}=
  require('../simulation/twinleaf/rank6-expanded-opening-coverage.cjs');
const source=require('../results/aichi-2026/full-decklists.json');

const sourceCounts=rank6Groups(source);

test('source rank6 has exactly two Tag Calls and two Guzma and Hala',()=>{
  assert.equal(sourceCounts.thorns,4);
  assert.equal(sourceCounts.thunder,1);
  assert.equal(sourceCounts.dce,1);
  assert.equal(sourceCounts.guzmaHala,2);
  assert.equal(sourceCounts.tagCall,2);
  assert.equal(Object.values(sourceCounts).reduce((a,b)=>a+b,0),60);
});

test('opt-in conditional Tag Call payments preserve all frozen old baselines',()=>{
  const exact=[
    [0,5650287322n,112949571735n],
    [7,1082209951n,9540235320n],
    [19,1315429890311n,5031390013650n],
    [30,6539216066627n,20125560054600n],
    [38,74464380071287n,221381160600600n]
  ];
  for(const [discards,numerator,denominator] of exact) {
    const groups={...sourceCounts,discards,other:50-discards};
    const old=exactExpandedOpening(groups);
    const explicitlyDisabled=exactExpandedOpening(groups,
      {conditionalTagCallPayment:false});
    assert.deepEqual(explicitlyDisabled,old);
    const revised=exactExpandedOpening(groups,
      {conditionalTagCallPayment:true});
    assert.equal(revised.total.numerator,numerator);
    assert.equal(revised.total.denominator,denominator);
    assert.ok(revised.total.decimal>old.total.decimal);
    assert.equal(revised.byRoute.direct.decimal,old.byRoute.direct.decimal);
  }
});

test('conditional Tag Call does not reclassify original legacy narrow event',()=>{
  const original=exactExpandedOpening(sourceCounts);
  const revised=exactExpandedOpening(sourceCounts,
    {conditionalTagCallPayment:true});
  assert.deepEqual(revised.legacyNarrow,original.legacyNarrow);
  assert.equal(original.total.numerator,1349n*0n+original.total.numerator);
});
