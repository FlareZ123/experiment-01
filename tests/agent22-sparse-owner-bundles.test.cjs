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

test('scored owner search recovers valued targets beyond first lexicographic bundle',()=>{
  const cards=['A','B','C','D','Z'];
  const score=printings=>printings.reduce((sum,n)=>sum+
    (n==='Z'?12:n==='D'?7:0),0);
  const a=firstNativeValidBundle(fixture(cards,n=>n.length===3),3,score);
  const b=firstNativeValidBundle(
    fixture([...cards].reverse(),n=>n.length===3),3,score);
  assert.deepEqual(a,[{printings:['A','D','Z']}]);
  assert.deepEqual(a,b);
  assert.deepEqual(firstNativeValidBundle(
    fixture(cards,n=>n.length===3),3),
  [{printings:['A','B','C']}]);
});

test('scored native search respects complete combination constraints',()=>{
  const p=fixture(['A','A','Energy','Tool','Z'],n=>
    n.length===2&&n.includes('Energy')&&n.includes('Tool'));
  const score=names=>names.includes('Z')?50:names.length;
  assert.deepEqual(firstNativeValidBundle(p,3,score),
    [{printings:['Energy','Tool']}]);
});

test('scored optional search can return zero when all choices are costly',()=>{
  const p=fixture(['A','B','C'],n=>n.length<=3);
  const score=names=>-names.length;
  assert.deepEqual(firstNativeValidBundle(p,3,score),
    [{printings:[]}]);
  assert.deepEqual(firstNativeValidBundle(p,3),
    [{printings:['A','B','C']}]);
});

test('scored mandatory choice still chooses best legal nonempty candidate',()=>{
  const p=fixture(['A','B','C'],n=>n.length>=1);
  assert.deepEqual(firstNativeValidBundle(p,3,n=>-n.length),
    [{printings:['A']}]);
});

test('scoring sees immutable printed strings and must return a finite score',()=>{
  const p=fixture(['A','B','C'],n=>n.length===2);
  let seen=0;
  const out=firstNativeValidBundle(p,3,n=>{
    assert.equal(Object.isFrozen(n),true);
    assert.ok(n.every(s=>typeof s==='string'));
    seen++;
    return n.includes('C')?10:0;
  });
  assert.ok(seen>=3);
  assert.deepEqual(out,[{printings:['A','C']}]);
  assert.throws(()=>firstNativeValidBundle(p,3,()=>NaN),
    /Bundle score must be finite/);
});
