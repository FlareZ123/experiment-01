'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {allocations,ways,directEarlyCounterAndEnergy}=
  require('../scripts/agent42-newmoon-counter-energy-joint-direct.cjs');

test('disjoint physical window compositions retain exact 4-category census',()=>{
  assert.equal(allocations(0).length,1);
  assert.equal(allocations(1).length,4);
  assert.equal(allocations(2).length,10);
  assert.equal(allocations(7).length,120);
  assert.equal(allocations(7).every(a=>a.reduce((x,y)=>x+y,0)===7),true);
  assert.equal(ways([17,2,6,35],[1,1,2,3]),
    17n*2n*15n*6545n);
  assert.equal(ways([17,2,6,35],[1,3,1,2]),0n);
});

test('exact legal-seven first8 counter and first10 three Energy joint screen',()=>{
  const out=directEarlyCounterAndEnergy();
  assert.equal(out.categories.basics,17);
  assert.equal(out.categories.namedCounterItem,2);
  assert.equal(out.categories.energy,6);
  assert.deepEqual(
    {numerator:out.firstEightCounterItem.numerator,
      denominator:out.firstEightCounterItem.denominator},
    {numerator:'416435',denominator:'1708349'});
  assert.deepEqual(
    {numerator:out.firstEightCounterAndFirstTenThreeEnergy.numerator,
      denominator:out.firstEightCounterAndFirstTenThreeEnergy.denominator},
    {numerator:'1081043307',denominator:'121947076667'});
  assert.ok(out.firstEightCounterAndFirstTenThreeEnergy.probability>0);
  assert.ok(out.firstEightCounterAndFirstTenThreeEnergy.probability<
    out.firstEightCounterItem.probability);
  assert.equal(out.qualification.includes('game outcomes'),true);
});
