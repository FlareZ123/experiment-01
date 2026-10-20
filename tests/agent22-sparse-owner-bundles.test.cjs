'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {firstNativeValidBundle}=
  require('../simulation/twinleaf/agent22-sparse-owner-bundles.cjs');

/** @param {string[]} names @param {(names:string[])=>boolean} accept */
function fixture(names,accept){
  const cards=names.map(fullName=>({fullName}));
  return {cards:{cards},validate:selection=>
    Array.isArray(selection)&&selection.every(c=>cards.includes(c))&&
    accept(selection.map(c=>c.fullName))};
}

test('valid multi-axis pair survives individually invalid singletons',()=>{
  const p=fixture(['Tool','Stadium','Energy','Blocked'],n=>
    n.length===2&&n.includes('Tool')&&n.includes('Energy'));
  assert.deepEqual(firstNativeValidBundle(p,3),
    [{printings:['Energy','Tool']}]);
});

test('50-card owner deck beyond complete menu bound yields a valid bundle',()=>{
  const names=Array.from({length:50},
    (_,i)=>'Printable-'+String(i).padStart(2,'0'));
  const p=fixture(names,n=>n.length===3);
  const result=firstNativeValidBundle(p,3);
  assert.deepEqual(result,[{printings:names.slice(0,3)}]);
  assert.equal(Object.isFrozen(result),true);
  assert.equal(Object.isFrozen(result[0].printings),true);
});

test('hidden physical deck order does not affect returned printed choice',()=>{
  const names=['Supporter','Tool','Stadium','Energy','Blocked'];
  const accept=n=>n.length===3&&
    ['Energy','Stadium','Tool'].every(x=>n.includes(x));
  const a=firstNativeValidBundle(fixture(names,accept),3);
  const b=firstNativeValidBundle(fixture([...names].reverse(),accept),3);
  assert.deepEqual(a,b);
  assert.deepEqual(a,[{printings:['Energy','Stadium','Tool']}]);
});

test('invalid complete bundles fail closed',()=>{
  const p=fixture(['A','B','C'],()=>false);
  assert.equal(firstNativeValidBundle(p,3),null);
  assert.throws(()=>firstNativeValidBundle(p,4));
});

test('duplicate printed cards can satisfy two-copy native search',()=>{
  const p=fixture(['B','A','A','C'],
    n=>n.length===2&&n[0]==='A'&&n[1]==='A');
  assert.deepEqual(firstNativeValidBundle(p,2),
    [{printings:['A','A']}]);
});
