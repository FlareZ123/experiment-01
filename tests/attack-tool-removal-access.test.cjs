'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {choose,firstReplyOpportunities}=require('../scripts/attack-tool-removal-access.cjs');

test('binomial controls',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(5,2),10n);
  assert.equal(choose(5,-1),0n);
  assert.equal(choose(5,6),0n);
});
test('conditional first-eight union, rational exactness',()=>{
  const actual=firstReplyOpportunities();
  const expected={
    rotomEnergy:'184677535/2379889422',
    blower:'5413169/41752446',
    intersection:'745573/89807148',
    either:'105215663/528864316',
    originalTwoBlower:'416435/1708349'
  };
  for(const [key,value] of Object.entries(actual)) {
    assert.equal(String(value.numerator)+'/'+String(value.denominator),
      expected[key],key);
  }
  const a=actual.either,b=actual.originalTwoBlower;
  assert.ok(a.numerator*b.denominator<b.numerator*a.denominator);
});
