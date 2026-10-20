'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {maxZeroLossProbability,upperLossRateAfterZeroLosses}=
  require('../scripts/aichi-field-zero-loss-bound.cjs');

test('balanced equal-weight 128 seat/start/rank cells need five zero-loss games per cell',()=>{
  const each4=Array(128).fill(4);
  const each5=Array(128).fill(5);
  assert.ok(maxZeroLossProbability(each4,0.005)>0.05);
  assert.ok(maxZeroLossProbability(each5,0.005)<0.05);
  assert.ok(upperLossRateAfterZeroLosses(each5)<0.005);
  assert.ok(upperLossRateAfterZeroLosses(each4)>0.005);
});

test('608 undefeated games in four unequal cells per rank are insufficient',()=>{
  const counts=Array.from({length:32},()=>[5,5,5,4]).flat();
  assert.equal(counts.length,128);
  assert.equal(counts.reduce((a,b)=>a+b,0),608);
  const nullProb=maxZeroLossProbability(counts,0.005);
  assert.ok(Math.abs(nullProb-Math.pow(0.98,128))<1e-10);
  assert.ok(nullProb>0.05);
});
