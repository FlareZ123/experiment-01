'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {C,findPaidLine}=require('../simulation/evaluation/agent5-adp-paid-opening.cjs');
const {minimumProtectedPayments:pay}=
  require('../simulation/evaluation/agent27-adp-protected-payment-cost.cjs');
/** @param {Record<string,number>} entries @returns {number[]} */
function v(entries){const x=Array(12).fill(0);for(const [k,n] of Object.entries(entries))x[C[k]]=n;return x;}
test('one Tag Call fetches ADP and Guzma Hala, with one protected-card payment',()=>{
  const h=v({basic:1,switch:1,tag:1,dragon:1,other:3});
  const s=v({basic:1,switch:1,tag:1,dragon:1,other:4});
  const a={adp:true,gh:true,dde:true};
  assert.equal(pay(h,s,a,'dragons'),1);
  assert.deepEqual(findPaidLine(h,s,a,'mechanical'),
    {adpVia:'tag',ghVia:'tag',discards:2});
});
test('Ultra Ball plus Guzma Hala costs four hand cards, two protected',()=>{
  const h=v({basic:1,switch:1,ultra:1,gh:1,dragon:2,other:1});
  const s=v({basic:1,switch:1,ultra:1,gh:1,dragon:2,other:2});
  const a={adp:true,gh:true,dde:true};
  assert.equal(pay(h,s,a,'dragons'),2);
  assert.equal(pay(h,s,{...a,adp:false},'dragons'),null);
});
test('non-Basic opening, missing Switch, and unsearchable DDE reject',()=>{
  assert.equal(pay(v({tag:1,other:6}),v({tag:1,other:7}),
    {adp:true,gh:true,dde:true},'dragons'),null);
  assert.equal(pay(v({basic:1,tag:1,other:5}),v({basic:1,tag:1,other:6}),
    {adp:true,gh:true,dde:true},'dragons'),null);
  assert.equal(pay(v({adp:1,gh:1,dragon:2,other:3}),
    v({adp:1,gh:1,dragon:2,other:4}),{adp:true,gh:true,dde:false},
    'dragons'),null);
});
