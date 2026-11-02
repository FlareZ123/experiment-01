'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {choose,literalOpeningChance,countsFromSource,analyze}=
  require('../scripts/agent4-garbotoxin-literal-open.cjs');

test('exact BigInt combination boundaries and known values',()=>{
  assert.equal(choose(60,8),2558620845n);
  assert.equal(choose(52,6),20358520n);
  assert.equal(choose(60,-1),0n);
  assert.equal(choose(60,61),0n);
});

test('no Boost Shake gives zero literal first-turn evolution route',()=>{
  const a=literalOpeningChance({trubbish:2,floatStone:4,
    boostShake:0,garbodor:2,basic:12});
  assert.equal(a.conditionalProbability,0);
  assert.equal(a.numerator,'0');
});

test('rank 8, 11, 16 fractions independently checked by exact enumeration',()=>{
  for(const [p,n,d] of [
    [{trubbish:2,floatStone:4,boostShake:1,garbodor:2,basic:10},
      '2661125507','197276216280'],
    [{trubbish:2,floatStone:3,boostShake:2,garbodor:2,basic:11},
      '68180030335','3517488113568'],
    [{trubbish:2,floatStone:4,boostShake:2,garbodor:3,basic:11},
      '13570028727','532952744480']]){
    const r=literalOpeningChance(p);
    assert.equal(r.numerator,n);
    assert.equal(r.denominator,d);
  }
});

test('exact chance increases with an additional searchable Garbodor',()=>{
  const basic=11;
  const two=literalOpeningChance({trubbish:2,floatStone:4,
    boostShake:2,garbodor:2,basic});
  const three=literalOpeningChance({trubbish:2,floatStone:4,
    boostShake:2,garbodor:3,basic});
  assert.ok(three.conditionalProbability>two.conditionalProbability);
});

test('source counts must reject future unknown evolution printings',()=>{
  const cards=[
    {category:'Pokémon',name:'Trubbish',count:2},
    {category:'Pokémon',name:'Garbodor',count:2},
    {category:'Pokémon',name:'Pidgeot ex',count:1},
    {category:'Trainer',name:'Float Stone',count:4},
    {category:'Trainer',name:'Boost Shake',count:1},
    {category:'Energy',name:'Darkness Energy',count:50}
  ];
  assert.throws(()=>countsFromSource({rank:8,cards}));
});
