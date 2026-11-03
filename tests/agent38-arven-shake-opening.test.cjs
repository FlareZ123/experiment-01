'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {choose,exactResourceLineCounts,analyzeFixedSixty}=
  require('../scripts/agent38-arven-shake-opening.cjs');

function fixture(t,a,s,f,g){
  const counted=[['Trubbish','FST','168',t],['Arven','SVI','166',a],
    ['Boost Shake','EVS','142',s],['Float Stone','BKT','137',f],
    ['Garbodor','BKP','57',g]];
  const cards=counted.filter(x=>x[3]).map(([name,set,number,count])=>
    ({name,count,category:'Trainer',printing:{set,number,language:'en'}}));
  cards.push({name:'Other',count:60-t-a-s-f-g,category:'Trainer',
    printing:{set:'FST',number:'1',language:'en'}});
  return {cards};
}

test('binomial BigInt identities and zero-invalid conventions',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(7,0),1n);
  assert.equal(choose(3,4),0n);
  assert.equal(choose(3,-1),0n);
});

test('exact original rank11 restricted direct line, no Arven path',()=>{
  const v=analyzeFixedSixty(fixture(2,0,2,3,2),11);
  assert.ok(Math.abs(v.directProbability-0.01031585)<1e-7);
  assert.equal(v.arvenProbability,0);
  assert.equal(v.union,v.direct);
});

test('new 60: direct and Arven paths, union with overlap deducted',()=>{
  const v=analyzeFixedSixty(fixture(3,3,3,4,2),12);
  assert.ok(Math.abs(v.directProbability-0.02769320)<1e-7);
  assert.ok(Math.abs(v.arvenProbability-0.08580314)<1e-7);
  assert.ok(Math.abs(v.unionProbability-0.10773747)<1e-7);
  assert.ok(Math.abs(v.unionConditionalValid-0.13311551)<1e-7);
  assert.ok(v.unionProbability<v.arvenProbability+v.directProbability);
});

test('first player cannot play direct Arven route but direct Shake still exists',()=>{
  const v=analyzeFixedSixty(fixture(3,3,3,4,2),12);
  assert.ok(v.directProbability>0);
  assert.ok(v.unionProbability>v.directProbability);
});

test('independent physical-card enumeration agrees for 8-card toy',()=>{
  const categories=['t','t','a','s','f','g','o','o'];
  const expected=exactResourceLineCounts({t:2,a:1,s:1,f:1,g:1,other:2,
    handSize:3,prizes:1});
  const observed={direct:0,arven:0,union:0,denominator:0};
  for(let i=0;i<8;i++)for(let j=i+1;j<8;j++)for(let k=j+1;k<8;k++){
    const hand=new Set([i,j,k]);
    for(let p=0;p<8;p++){
      if(hand.has(p))continue;
      const cards=[...hand].map(x=>categories[x]);
      const deck=categories.filter((_,index)=>!hand.has(index)&&index!==p);
      const direct=cards.includes('t')&&cards.includes('s')&&
        cards.includes('f')&&deck.includes('g');
      const arven=cards.includes('t')&&cards.includes('a')&&
        deck.includes('s')&&deck.includes('f')&&deck.includes('g');
      observed.direct+=Number(direct);
      observed.arven+=Number(arven);
      observed.union+=Number(direct||arven);
      observed.denominator++;
    }
  }
  for(const key of ['direct','arven','union','denominator'])
    assert.equal(expected[key],String(observed[key]));
});

test('prize-depleted or absent evolution line cannot falsely score',()=>{
  for(const row of [fixture(0,3,3,4,2),fixture(3,3,3,4,0)]){
    const v=analyzeFixedSixty(row,12);
    assert.equal(v.directProbability,0);
    assert.equal(v.arvenProbability,0);
  }
});

test('invalid 60 and invalid counts fail closed',()=>{
  assert.throws(()=>analyzeFixedSixty({cards:[]},12));
  assert.throws(()=>analyzeFixedSixty(fixture(3,3,3,4,2),0));
  assert.throws(()=>exactResourceLineCounts({t:-1,a:1,s:1,f:1,g:1,other:7}));
});
