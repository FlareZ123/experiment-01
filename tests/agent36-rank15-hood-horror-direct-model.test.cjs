'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {directOpeningModel}=require('../scripts/agent36-rank15-hood-horror-direct-model.cjs');
test('exact 2 Hood 2 Arven direct-start event',()=>{
  const r=directOpeningModel({hoodCopies:2,arvenCopies:2});
  assert.equal(r.denominator,'381947999887177360');
  assert.equal(r.favorable,'9921798248729500');
  assert.equal(r.directHood,'5471747408873200');
  assert.equal(r.arvenToHood,'4450050839856300');
  assert.ok(Math.abs(r.jointProbability-0.0259768299654934)<1e-12);
});
test('more Hood and Arven increases this restricted resource event',()=>{
  const a=directOpeningModel({hoodCopies:1,arvenCopies:1});
  const b=directOpeningModel({hoodCopies:2,arvenCopies:2});
  const c=directOpeningModel({hoodCopies:3,arvenCopies:2});
  assert.ok(a.jointProbability<b.jointProbability);
  assert.ok(b.jointProbability<c.jointProbability);
  assert.equal(directOpeningModel({hoodCopies:0,arvenCopies:0}).favorable,'0');
});
