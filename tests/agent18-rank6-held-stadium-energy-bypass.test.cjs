'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  ORIGINAL_RANK6,choose,heldStadiumEnergyWithoutSupporterConnectors
}=require('../simulation/evaluation/agent18-rank6-held-stadium-energy-bypass.cjs');

test('authenticated rank6 printed grouping sums to 60',()=>{
  assert.equal(Object.entries(ORIGINAL_RANK6).filter(([key])=>key!=="total").reduce((a,[,b])=>a+b,0),60);
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(4,5),0n);
});

test('held pair without G&H / Tag / Mail has independently derived exact fraction',()=>{
  const x=heldStadiumEnergyWithoutSupporterConnectors();
  assert.equal(x.firstSevenBoth,37495566n);
  assert.equal(x.eighthCompletesPair,14543774n);
  assert.equal(x.numerator,113129n);
  assert.equal(x.denominator,17776836n);
  assert.ok(Math.abs(x.percentage-0.636384337460277)<1e-12);
});

test('physical second Basic for Bench is an explicit stricter subset',()=>{
  const any=heldStadiumEnergyWithoutSupporterConnectors();
  const bench=heldStadiumEnergyWithoutSupporterConnectors({requireSecondBasic:true});
  assert.equal(bench.firstSevenBoth,6816786n);
  assert.equal(bench.eighthCompletesPair,2272262n);
  assert.equal(bench.numerator,49397n);
  assert.equal(bench.denominator,44442090n);
  assert.ok(bench.percentage<any.percentage);
});
