'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {
  combinations, auditBasicOpeningAsymmetry,
  auditRepeatedBasicOpeningAsymmetry, benchmarkMasks
} = require('../scripts/agent44-mulligan-position-coupling.cjs');

/** @param {number} n @param {number} k @returns {number[][]} */
function selections(n,k) {
  const result = [];
  /** @param {number[]} prior @param {number} next */
  function visit(prior,next) {
    if (prior.length === k) {result.push(prior);return;}
    for (let i=next;i<n;i+=1) visit([...prior,i],i+1);
  }
  visit([],0);
  return result;
}

test('exact combinatorics match exhaustive short-deck samples',()=>{
  const a=[true,false,true,false,false,true,false,false];
  const b=[false,true,true,false,true,false,false,false];
  const expected=selections(8,3).filter(indices=>
    indices.some(i=>a[i]) !== indices.some(i=>b[i])).length;
  const observed=auditBasicOpeningAsymmetry(a,b,3);
  assert.equal(Number(observed.discordantMulliganNumerator),expected);
  assert.equal(observed.denominator,'56');
  assert.equal(combinations(60,7),386206920n);
  const mirrored=auditBasicOpeningAsymmetry(b,a,3);
  assert.equal(observed.discordantMulliganNumerator,
    mirrored.discordantMulliganNumerator);
});

test('actual reference and New Moon source-order first-seven disagreement',()=>{
  const masks=benchmarkMasks(path.resolve(__dirname,'..'));
  const outcome=auditBasicOpeningAsymmetry(masks.reference,masks.newMoon);
  assert.deepEqual([outcome.bothBasic,outcome.leftOnlyBasic,
    outcome.rightOnlyBasic,outcome.neitherBasic],[12,2,5,41]);
  assert.equal(outcome.leftBasics,14);
  assert.equal(outcome.rightBasics,17);
  assert.equal(outcome.denominator,'386206920');
  assert.equal(outcome.leftMulliganNumerator,'53524680');
  assert.equal(outcome.rightMulliganNumerator,'32224114');
  assert.equal(outcome.simultaneousMulliganNumerator,'22481940');
  assert.equal(outcome.discordantMulliganNumerator,'40784914');
  assert.ok(Math.abs(outcome.discordantMulliganProbability -
    0.10560378876691283)<1e-14);
});

test('same source counts with changed ordering change coupling risk',()=>{
  const masks=benchmarkMasks(path.resolve(__dirname,'..'));
  const original=auditBasicOpeningAsymmetry(masks.reference,masks.newMoon);
  const swapped=[...masks.newMoon];
  assert.deepEqual([swapped[3],swapped[12]],[true,false]);
  [swapped[3],swapped[12]]=[swapped[12],swapped[3]];
  const changed=auditBasicOpeningAsymmetry(masks.reference,swapped);
  assert.equal(changed.leftBasics,original.leftBasics);
  assert.equal(changed.rightBasics,original.rightBasics);
  assert.equal(changed.bothBasic,original.bothBasic+1);
  assert.ok(changed.discordantMulliganProbability<
    original.discordantMulliganProbability);
});

test('fully nested Basic masks give attainable minimum for 14 versus 17',()=>{
  const a=Array.from({length:60},(_,i)=>i<14);
  const b=Array.from({length:60},(_,i)=>i<17);
  const result=auditBasicOpeningAsymmetry(a,b);
  assert.deepEqual([result.bothBasic,result.leftOnlyBasic,
    result.rightOnlyBasic,result.neitherBasic],[14,0,3,43]);
  assert.equal(result.discordantMulliganNumerator,
    String(combinations(46,7)-combinations(43,7)));
  assert.ok(Math.abs(result.discordantMulliganProbability -
    0.05515324790140995)<1e-14);
});

test('independent repeated common rounds have exact count-disagreement rate',()=>{
  const masks=benchmarkMasks(path.resolve(__dirname,'..'));
  const original=auditRepeatedBasicOpeningAsymmetry(
    masks.reference,masks.newMoon);
  assert.equal(original.countDisagreementNumerator,'40784914');
  assert.equal(original.countDisagreementDenominator,'363724980');
  assert.ok(Math.abs(original.countDisagreementProbability-
    0.11213118769021584)<1e-14);
  const nested=auditRepeatedBasicOpeningAsymmetry(
    Array.from({length:60},(_,i)=>i<14),
    Array.from({length:60},(_,i)=>i<17));
  assert.equal(nested.countDisagreementNumerator,'21300566');
  assert.equal(nested.countDisagreementDenominator,'353982806');
  assert.ok(Math.abs(nested.countDisagreementProbability-
    0.06017401308469203)<1e-14);
  assert.equal(original.nativeSetupCertified,false);
});
