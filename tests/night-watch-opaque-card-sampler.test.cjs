'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {sampleOpaque} = require('../simulation/twinleaf/night-watch-opaque-card-sampler.cjs');

/** Deterministic uniform midpoints for independent test replicability. */
function middle(){return 0.5;}

test('sampling without replacement returns exactly the requested distinct objects',()=>{
  const cards=Array.from({length:5},(_,i)=>Object.freeze({id:i}));
  const picked=sampleOpaque(cards,2,middle);
  assert.equal(picked.length,2);
  assert.equal(new Set(picked).size,2);
  assert.ok(picked.every(card=>cards.includes(card)));
});

test('card identities are never inspected and caller array remains intact',()=>{
  const cards=Array.from({length:5},()=>new Proxy({}, {get(){throw new Error('card face access');}}));
  const before=[...cards];
  const chosen=sampleOpaque(cards,3,()=>0);
  assert.deepEqual(chosen,cards.slice(0,3));
  assert.deepEqual(cards,before);
});

test('zero and full draws, invalid counts are handled consistently',()=>{
  const cards=['a','b','c'];
  assert.deepEqual(sampleOpaque(cards,0,()=>0),[]);
  assert.equal(new Set(sampleOpaque(cards,3,()=>0.99)).size,3);
  assert.throws(()=>sampleOpaque(cards,4,()=>0.2),/sample bounds/);
  assert.throws(()=>sampleOpaque(cards,-1,()=>0.2),/sample bounds/);
});
