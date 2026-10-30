'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {VERSION,evaluateTemporalDenial}=
  require('../simulation/evaluation/agent25-denial-temporal-resource-model.cjs');

const base={
  reattachmentProbability:0,
  secondDenialValue:10,
  plumeriaFutureValue:6,
  enhancedFutureValue:4,
  extraDiscardCost:3
};

/** @param {object} opts @returns {object} */
const evaluate=opts=>evaluateTemporalDenial({...base,...opts});

test('the immediate-only horizon reduces to half the saved reserve minus X',()=>{
  const x=evaluate({reattachmentProbability:0});
  assert.equal(x.version,VERSION);
  assert.equal(x.baselineCardConsumption,3);
  assert.equal(x.alternativeExpectedCardConsumption,2.5);
  assert.equal(x.alternativeExpectedEnergyDenials,1);
  assert.equal(x.probabilityPlumeriaPreservedAfterSecondOwnerTurn,0.5);
  assert.equal(x.baselineRelativeExpectedNetValue,3.5);
  assert.equal(x.maximumExtraDiscardCostForNonnegativeValue,10);
});

test('certain reattachment uses four physical cards for 1.5 expected denies',()=>{
  const x=evaluate({reattachmentProbability:1,
    secondDenialValue:10,extraDiscardCost:3});
  assert.equal(x.alternativeExpectedCardConsumption,4);
  assert.equal(x.alternativeExpectedEnergyDenials,1.5);
  assert.equal(x.probabilityPlumeriaEventuallySpent,1);
  assert.equal(x.baselineRelativeExpectedNetValue,2);
  assert.equal(x.maximumExtraDiscardCostForNonnegativeValue,5);
});

test('intermediate reattachment probability follows the same algebra',()=>{
  const r=0.2,p=6,e=4,x=3,d=10;
  const z=evaluate({reattachmentProbability:r});
  const expected=((1-r)*(p+e)-(1+r)*x+r*d)/2;
  assert.ok(Math.abs(z.baselineRelativeExpectedNetValue-expected)<1e-12);
  assert.equal(z.alternativeExpectedCardConsumption,2.8);
  assert.equal(z.alternativeExpectedEnergyDenials,1.1);
});

test('expensive extra discard reverses the recommendation despite denial',()=>{
  const x=evaluate({reattachmentProbability:1,extraDiscardCost:7});
  assert.equal(x.baselineRelativeExpectedNetValue,-2);
  assert.equal(x.scenarioFavorsHammerFirst,false);
  assert.equal(x.competitiveGameQualified,false);
});

test('negative, nonfinite, missing and impossible probabilities rejected',()=>{
  for(const change of [{reattachmentProbability:-1},
    {reattachmentProbability:1.01},{extraDiscardCost:-1},
    {secondDenialValue:Infinity},
    {plumeriaFutureValue:NaN},{enhancedFutureValue:undefined}]){
    assert.throws(()=>evaluate(change),{name:'AssertionError'});
  }
});
