'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {normalizeDeepClonePrototypes,assertVendorCloneCompatibleSource}=
  require('../simulation/twinleaf/normalize-deep-clone.cjs');
function pinnedDeepClone(source,ignores=[],refMap=[]){
  if(source===null)return null;
  if(typeof source==='function')return source;
  if(source instanceof Array)return source.map(item=>pinnedDeepClone(item,ignores,refMap));
  if(source instanceof Object){
    if(ignores.some(ignore=>source instanceof ignore))return source;
    const ref=refMap.find(item=>item.s===source);
    if(ref!==undefined)return ref.d;
    const dest=Object.create(source);
    refMap.push({s:source,d:dest});
    for(const key in source){
      if(Object.prototype.hasOwnProperty.call(source,key))
        dest[key]=pinnedDeepClone(source[key],ignores,refMap);
    }
    return dest;
  }
  return source;
}
class SampleCard {
  constructor(id){this.id=id;this.fullName='Card'+id;this.damageTakenLastTurn=0;}
  attach(){this.damageTakenLastTurn+=10;}
}
function checkTopology(source,copy,aliases=new WeakMap()){
  if(source===null||typeof source!=='object'){
    assert.strictEqual(copy,source);return;
  }
  assert.notStrictEqual(copy,source);
  assert.strictEqual(Object.getPrototypeOf(copy),Object.getPrototypeOf(source));
  if(aliases.has(source)){
    assert.strictEqual(copy,aliases.get(source),'Graph alias was not preserved');
    return;
  }
  aliases.set(source,copy);
  if(Array.isArray(source))assert.equal(copy.length,source.length);
  for(const key of Object.keys(source))checkTopology(source[key],copy[key],aliases);
}
/** Create reproducible dense graphs with objects, cards, arrays and aliases. */
function graph(seed){
  let x=seed>>>0;
  const pick=n=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x%n;};
  const nodes=Array.from({length:5},(_,i)=>i%2?{slot:i}:new SampleCard(i));
  const arrays=Array.from({length:3},()=>[]);
  const root={nodes,arrays,hero:nodes[pick(nodes.length)]};
  for(const node of nodes){
    node.extra=nodes[pick(nodes.length)];
    node.slot=arrays[pick(arrays.length)];
  }
  for(let i=0;i<arrays.length;i++){
    const a=arrays[i];
    a.push(nodes[pick(nodes.length)],nodes[pick(nodes.length)]);
    if(pick(3)===0)a.push(root);
    if(pick(3)===0)a.push(arrays[pick(arrays.length)]);
  }
  root.heroAlias=root.hero;
  root.sameFirst=arrays[0];
  return root;
}
test('seeded clone-safe whole-graph topology remains identical and detached',()=>{
  let valid=0,unsupported=0;
  for(let seed=1;seed<=800;seed++){
    const src=graph(seed);
    try{assertVendorCloneCompatibleSource(src);}
    catch(error){
      assert.match(error.message,/cyclic arrays/);
      unsupported++;continue;
    }
    const copy=normalizeDeepClonePrototypes(src,pinnedDeepClone(src));
    checkTopology(src,copy);
    valid++;
  }
  assert.ok(valid>=100,`Expected enough legal graph fixtures, got ${valid}`);
  assert.ok(unsupported>0);
  console.log(JSON.stringify({valid,unsupported,seedCount:800}));
});
