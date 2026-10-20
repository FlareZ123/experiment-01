'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {firstNativeCloneStructureDifference:firstDiff}=
  require('../simulation/twinleaf/native-clone-structure-diff.cjs');

test('equal object descriptor graphs have no reported difference',()=>{
  const original={turn:3,players:[{deck:['A','B'],hand:['C']}]};
  assert.equal(firstDiff(original,structuredClone(original)).matched,true);
});
test('redacted primitive mismatch returns a path without card names',()=>{
  const real={players:[{deck:{cards:['secret-card-A','B']}}]};
  const copy=structuredClone(real);
  copy.players[0].deck.cards[0]='secret-card-B';
  const result=firstDiff(real,copy);
  assert.equal(result.category,'primitive-value-mismatch');
  assert.deepEqual(result.path,
    ['State','players','0','deck','cards','0']);
  assert.ok(!JSON.stringify(result).includes('secret-card'));
});
test('object alias failure is reported rather than mistaken for a real clone',()=>{
  const shared={value:5};
  const real={left:shared,right:shared};
  const copy={left:{value:5},right:{value:5}};
  const result=firstDiff(real,copy);
  assert.equal(result.category,'object-alias-topology-mismatch');
  assert.deepEqual(result.path,['State','right']);
});
test('inherited or differing own data descriptor is detected safely',()=>{
  const real={x:1};
  const copy=Object.create(real);
  const result=firstDiff(real,copy);
  assert.equal(result.matched,false);
  assert.ok(/own-key|prototype-class/.test(result.category));
});
test('getter is not invoked during comparison',()=>{
  let calls=0;
  const getter=()=>{calls++;throw Error('must not access');};
  const a={},b={};
  Object.defineProperty(a,'danger',{get:getter,enumerable:true});
  Object.defineProperty(b,'danger',{get:getter,enumerable:true});
  assert.equal(firstDiff(a,b).matched,true);
  assert.equal(calls,0);
});
test('descriptor writable flag mutation is visible',()=>{
  const a={},b={};
  Object.defineProperty(a,'resource',{value:1,writable:false});
  Object.defineProperty(b,'resource',{value:1,writable:true});
  const result=firstDiff(a,b);
  assert.equal(result.category,'writable-descriptor-mismatch');
  assert.deepEqual(result.path,['State','resource']);
});
