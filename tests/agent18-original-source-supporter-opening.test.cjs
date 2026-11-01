'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {choose,exactConditionalHeld}=
  require('../scripts/agent18-original-source-supporter-opening.cjs');

/** @param {number} n @param {number} k @returns {number[][]} */
function subsets(n,k){
  const rows=[];
  function walk(start,selected){
    if(selected.length===k){rows.push(selected);return;}
    for(let i=start;i<n;i++)walk(i+1,[...selected,i]);
  }
  walk(0,[]);
  return rows;
}

test('known exact probabilities and boundary counts',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(6,8),0n);
  assert.equal(exactConditionalHeld(60,4,0).probability,0);
  assert.equal(exactConditionalHeld(9,2,7,3).probability,1);
  assert.deepEqual(exactConditionalHeld(60,11,8),{
    numerator:'82633469',denominator:'120577544',
    probability:82633469/120577544});
  assert.deepEqual(exactConditionalHeld(60,4,12),{
    numerator:'10924831',denominator:'13274910',
    probability:10924831/13274910});
  assert.throws(()=>exactConditionalHeld(9,0,1,3));
  assert.throws(()=>exactConditionalHeld(9,2,8,3));
});

test('full toy hidden-Prize enumeration reproduces formula',()=>{
  const N=9,h=3,b=2,s=2,prizeCount=2;
  let all=0,hit=0;
  for(const hand of subsets(N,h)){
    if(!hand.some(i=>i<b))continue;
    const remainder=Array.from({length:N},(_,i)=>i)
      .filter(i=>!hand.includes(i));
    for(const indices of subsets(N-h,prizeCount)){
      const prizes=new Set(indices.map(i=>remainder[i]));
      for(const next of remainder.filter(i=>!prizes.has(i))){
        all++;
        if([...hand,next].some(i=>i>=b&&i<b+s))hit++;
      }
    }
  }
  const exact=exactConditionalHeld(N,b,s,h);
  assert.equal(BigInt(hit)*BigInt(exact.denominator),
    BigInt(all)*BigInt(exact.numerator));
});
