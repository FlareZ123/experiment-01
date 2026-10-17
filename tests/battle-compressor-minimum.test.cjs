'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {probe}=require('../simulation/twinleaf/battle-compressor-zero-prompt.cjs');

test('pinned Battle Compressor erroneously permits choosing zero',()=>{
  const p=probe();
  assert.equal(p.min,0);
  assert.equal(p.acceptsZero,true);
  assert.equal(p.acceptsOne,true);
  assert.equal(p.inPlay,true);
});

test('opt-in correction requires one while preserving legal one-card selection',()=>{
  const p=probe(true);
  assert.equal(p.min,1);
  assert.equal(p.acceptsZero,false);
  assert.equal(p.acceptsOne,true);
});

test('the research correction is fully reversible',()=>{
  assert.equal(probe().acceptsZero,true);
  assert.equal(probe(true).acceptsZero,false);
  assert.equal(probe().acceptsZero,true);
});
