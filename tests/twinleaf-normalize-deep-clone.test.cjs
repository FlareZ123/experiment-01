'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {normalizeDeepClonePrototypes,assertVendorCloneCompatibleSource}=
  require('../simulation/twinleaf/normalize-deep-clone.cjs');
// Exact pinned source mechanism, extracted as a pure smoke test.
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
      if(Object.prototype.hasOwnProperty.call(source,key))dest[key]=pinnedDeepClone(source[key],ignores,refMap);
    }
    return dest;
  }
  return source;
}
class Card{constructor(){this.fullName='Test Pokemon';this.damageTakenLastTurn=0}attack(n){this.damageTakenLastTurn+=n}}
test('vendor deepClone inherits a live Card as immediate prototype, repair restores class prototype',()=>{
  const card=new Card();const input={hand:[card],board:{card},self:null};input.self=input;
  const copy=pinnedDeepClone(input);
  assert.strictEqual(Object.getPrototypeOf(copy.board.card),card);
  assert.strictEqual(copy.hand[0],copy.board.card);
  normalizeDeepClonePrototypes(input,copy);
  assert.notStrictEqual(copy.board.card,card);
  assert.strictEqual(Object.getPrototypeOf(copy.board.card),Card.prototype);
  assert.strictEqual(copy.board.card.attack,Card.prototype.attack);
  assert.strictEqual(copy.hand[0],copy.board.card);
  copy.board.card.attack(280);
  assert.equal(card.damageTakenLastTurn,0);
  assert.equal(copy.board.card.damageTakenLastTurn,280);
  assert.strictEqual(copy.self,copy);
});
test('repair fails closed if a supposedly cloned object still aliases a live object',()=>{
  const live={v:3};const fake={nested:live};
  assert.throws(()=>normalizeDeepClonePrototypes({nested:live},fake),/live object identity/);
});

test('pinned deepClone duplicates aliased array references; normalizer reunites them',()=>{
  const shared=[{fullName:'A'}];
  const source={zone:shared,alias:shared};
  const detached=pinnedDeepClone(source);
  assert.notStrictEqual(detached.zone,detached.alias);
  normalizeDeepClonePrototypes(source,detached);
  assert.strictEqual(detached.zone,detached.alias);
  assert.notStrictEqual(detached.zone,shared);
  assert.notStrictEqual(detached.zone[0],shared[0]);
  detached.zone[0].fullName='B';
  assert.equal(source.zone[0].fullName,'A');
});

test('reject source shapes omitted or miscloned by pinned helper',()=>{
  const symbol=Symbol('private');
  assert.throws(()=>assertVendorCloneCompatibleSource({[symbol]:{fullName:'Secret'}}),
    /symbol, accessor or non-enumerable/);
  const accessor={};
  Object.defineProperty(accessor,'card',{enumerable:true,get(){throw Error('getter must not run')}});
  assert.throws(()=>assertVendorCloneCompatibleSource(accessor),
    /symbol, accessor or non-enumerable/);
  assert.throws(()=>assertVendorCloneCompatibleSource({at:new Date()}),/internal object slots/);
  const derived=Object.create({hidden:new Card()});derived.visible=3;
  assert.throws(()=>assertVendorCloneCompatibleSource({derived}),/non-class dynamic prototype/);
  const array=[];array.push(array);
  assert.throws(()=>assertVendorCloneCompatibleSource({array}),/cyclic arrays/);
});
test('allow repeated noncyclic arrays and ordinary Card class instances',()=>{
  const shared=[new Card()];const source={primary:shared,alias:shared};
  assert.doesNotThrow(()=>assertVendorCloneCompatibleSource(source));
  const clone=normalizeDeepClonePrototypes(source,pinnedDeepClone(source));
  assert.strictEqual(clone.primary,clone.alias);
});

test('object cycles through shared arrays are vendor-safe and stay detached',()=>{
  const root={card:new Card()};root.self=root;root.zone=[root];
  assert.doesNotThrow(()=>assertVendorCloneCompatibleSource(root));
  const copy=normalizeDeepClonePrototypes(root,pinnedDeepClone(root));
  assert.strictEqual(copy.self,copy);
  assert.strictEqual(copy.zone[0],copy);
  assert.notStrictEqual(copy.card,root.card);
});


test('pinned CardManager template-clone prototype layers are safely flattened',()=>{
  class RetrievedCard{
    constructor(){
      this.fullName='Synthetic Card';
      this.damage=0;
      this.attacks=[{name:'Synthetic Attack',cost:['P']}];
    }
    strike(value){this.damage+=value}
  }
  const master=new RetrievedCard();
  const retrieved=pinnedDeepClone(master);
  assert.strictEqual(Object.getPrototypeOf(retrieved),master);
  assert.strictEqual(Object.getPrototypeOf(retrieved.attacks[0]),master.attacks[0]);
  const live={board:[retrieved],hand:[retrieved]};
  assert.doesNotThrow(()=>assertVendorCloneCompatibleSource(live));
  const clone=normalizeDeepClonePrototypes(live,pinnedDeepClone(live));
  const sample=clone.board[0];
  assert.strictEqual(sample,clone.hand[0]);
  assert.strictEqual(Object.getPrototypeOf(sample),RetrievedCard.prototype);
  assert.strictEqual(Object.getPrototypeOf(sample.attacks[0]),Object.prototype);
  sample.strike(100);
  sample.attacks[0].name='Independent Attack';
  assert.equal(retrieved.damage,0);
  assert.equal(master.damage,0);
  assert.equal(retrieved.attacks[0].name,'Synthetic Attack');
  assert.equal(master.attacks[0].name,'Synthetic Attack');
});

test('shadowed and unshadowed inherited properties have distinct clone safety',()=>{
  const inherited={hidden:{fullName:'inaccessible reference'}};
  const unsafe=Object.create(inherited);
  unsafe.visible=3;
  assert.throws(()=>assertVendorCloneCompatibleSource({unsafe}),
    /non-class dynamic prototype/);
  const shadowed=Object.create(inherited);
  shadowed.hidden={fullName:'owned'};
  assert.doesNotThrow(()=>assertVendorCloneCompatibleSource({shadowed}));
  const detached=normalizeDeepClonePrototypes({shadowed},
    pinnedDeepClone({shadowed}));
  assert.strictEqual(Object.getPrototypeOf(detached.shadowed),Object.prototype);
  detached.shadowed.hidden.fullName='changed';
  assert.equal(shadowed.hidden.fullName,'owned');
});
