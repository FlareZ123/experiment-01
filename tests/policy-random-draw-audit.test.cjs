'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {countPolicyRandomDraws,consumePolicyRandomDrawsWithDigest}=
  require('../simulation/twinleaf/policy-random-draw-audit.cjs');

/** @param {number[]} values */
function encodedDigest(values) {
  const hash=createHash('sha256');
  const bytes=Buffer.allocUnsafe(8);
  for(const value of values) {
    bytes.writeDoubleBE(value,0);
    hash.update(bytes);
  }
  return hash.digest('hex');
}

test('an aligned skip samples identical actual Float64 values',()=>{
  const source=Math.random;
  const values=[0,0.125,0.5,0.75,0.9999999999999999];
  let index=0;
  const deterministic=()=>values[index++];
  Math.random=deterministic;
  try {
    const observed=countPolicyRandomDraws(()=>values.map(()=>Math.random()));
    assert.deepEqual(observed.result,values);
    assert.equal(observed.draws,values.length);
    assert.equal(observed.drawDigest,encodedDigest(values));
    assert.equal(Math.random,deterministic);

    index=0;
    const aligned=consumePolicyRandomDrawsWithDigest(values.length);
    assert.deepEqual(aligned,{
      draws:values.length,drawDigest:observed.drawDigest
    });
    assert.equal(Math.random,deterministic);
    assert.equal(index,values.length);
  } finally {
    Math.random=source;
  }
});

test('the sampling wrapper restores Math.random on failure',()=>{
  const original=Math.random;
  assert.throws(()=>countPolicyRandomDraws(()=>{
    Math.random();
    throw new Error('deliberate failure');
  }),/deliberate failure/);
  assert.equal(Math.random,original);
  assert.throws(()=>consumePolicyRandomDrawsWithDigest(-1),RangeError);
  assert.equal(Math.random,original);
});
