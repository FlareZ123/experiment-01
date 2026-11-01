'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {prelockItemPolicyModel}=
  require('../scripts/agent36-rank15-hood-horror-prelock-model.cjs');

test('the exact ordered Fog/Bag model preserves every Prize assignment',()=>{
  const result=prelockItemPolicyModel({hoodCopies:2,arvenCopies:2});
  assert.equal(result.denominator,'790632359766457135200');
  assert.equal(result.favorable,'32225084547797251080');
  assert.equal(result.directOrBagHood,'20871386437991952870');
  assert.equal(result.arvenToHood,'11353698109805298210');
  assert.ok(Math.abs(result.jointProbability-0.04075862080489108)<1e-12);
  assert.ok(Math.abs(result.baselineProbability-0.09224421494056603)<1e-12);
});

test('prelock searchable Hood access exceeds no-search direct opening',()=>{
  const {directOpeningModel}=
    require('../scripts/agent36-rank15-hood-horror-direct-model.cjs');
  for(const [hoodCopies,arvenCopies] of [[1,1],[2,1],[2,2],[3,2]]){
    const direct=directOpeningModel({hoodCopies,arvenCopies});
    const prelock=prelockItemPolicyModel({hoodCopies,arvenCopies});
    assert.ok(prelock.jointProbability>direct.jointProbability);
  }
  assert.equal(prelockItemPolicyModel({hoodCopies:0,arvenCopies:0}).favorable,'0');
});

test('four-slot Hood Arven access frontier is nearly flat',()=>{
  const variants=[[4,0],[3,1],[2,2],[1,3]]
    .map(([hoodCopies,arvenCopies])=>
      prelockItemPolicyModel({hoodCopies,arvenCopies}).jointProbability);
  for(let i=1;i<variants.length;i++)assert.ok(variants[i]<variants[i-1]);
  assert.ok(Math.abs(variants[0]-0.04100106428030631)<1e-12);
  assert.ok(Math.abs(variants[1]-0.04099029044738527)<1e-12);
  assert.ok(variants[0]-variants[2]<0.00025);
});
