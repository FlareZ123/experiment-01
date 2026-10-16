'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {normalizeDeepClonePrototypes}=require('../simulation/twinleaf/normalize-deep-clone.cjs');
test('cloning rejects altered primitive value',()=>{
  const source={damage:20};
  assert.throws(()=>normalizeDeepClonePrototypes(source,{damage:30}),/changed a primitive source value/);
});
test('cloning rejects mismatched own property sets',()=>{
  assert.throws(()=>normalizeDeepClonePrototypes({damage:20},{damage:20,extra:1}),/lost or gained enumerable own properties/);
  assert.throws(()=>normalizeDeepClonePrototypes({damage:20},{}),/lost or gained enumerable own properties/);
});
test('cloning rejects a collapsed pair of objects',()=>{
  const original={first:{hp:20},second:{hp:20}};
  const same={hp:20};
  assert.throws(()=>normalizeDeepClonePrototypes(original,{first:same,second:same}),/collapsed distinct source objects/);
});
test('cloning preserves sparse array positions',()=>{
  const original={cards:[{hp:80},,{hp:120}]};
  const copy={cards:[{hp:80},,{hp:120}]};
  normalizeDeepClonePrototypes(original,copy);
  assert.deepEqual(Object.keys(copy.cards),['0','2']);
  assert.equal(1 in copy.cards,false);
});
