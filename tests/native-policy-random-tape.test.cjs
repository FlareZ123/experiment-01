'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {recordPolicyRandomTape,replayPolicyRandomTape,digest}=
  require('../simulation/twinleaf/native-policy-random-tape.cjs');
test('recorded policy RNG preserves the same physical values and original source',()=>{
  const source=()=>0.375,previous=Math.random;
  Math.random=source;
  try {
    const read=recordPolicyRandomTape(()=>[Math.random(),Math.random()]);
    assert.deepEqual(read.tape,[0.375,0.375]);
    assert.deepEqual(read.result,read.tape);
    assert.equal(read.sha256,digest(read.tape));
    assert.strictEqual(Math.random,source);
    const replay=replayPolicyRandomTape(read.tape,
      ()=>[Math.random(),Math.random()]);
    assert.deepEqual(replay.result,read.tape);
    assert.equal(replay.consumed,2);
  }finally{Math.random=previous;}
});
test('replay fails closed on surplus and missing draws and restores global RNG',()=>{
  const previous=Math.random;
  assert.throws(()=>replayPolicyRandomTape([0.25],()=>{
    Math.random();Math.random();}),/exhausted/);
  assert.throws(()=>replayPolicyRandomTape([0.25,0.75],()=>{
    Math.random();}),/consumption mismatch/);
  assert.strictEqual(Math.random,previous);
});
test('original exceptions and excessive capture restore underlying RNG',()=>{
  const previous=Math.random;
  const marker=new Error('original');
  assert.throws(()=>recordPolicyRandomTape(()=>{throw marker;}),e=>e===marker);
  assert.throws(()=>recordPolicyRandomTape(()=>Math.random(),{limit:0}),
    /tape limit/);
  assert.strictEqual(Math.random,previous);
});
