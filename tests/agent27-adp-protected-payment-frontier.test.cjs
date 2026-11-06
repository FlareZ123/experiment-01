'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {countPaidOpenings}=require('../simulation/evaluation/agent5-adp-paid-opening.cjs');
const {countProtectedPaymentFrontier}=require('../simulation/evaluation/agent27-adp-protected-payment-frontier.cjs');
test('exact ADP protected-payment buckets equal original mechanical total',()=>{
 const source=countPaidOpenings(), result=countProtectedPaymentFrontier();
 assert.equal(result.denominator,source.denominator);
 for(const name of Object.keys(result.histograms)){
  const rows=result.histograms[name];
  assert.equal(rows[0],source.numerators[name]);
  assert.equal(rows.reduce((x,y)=>x+y,0n),source.numerators.mechanical);
 }
});
