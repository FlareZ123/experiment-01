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
