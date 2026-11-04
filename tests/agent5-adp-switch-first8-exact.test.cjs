'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {KEYS,categorizeFixedDeck,choose,countFirstTurnAccess,ratio}=
  require('../simulation/evaluation/agent5-adp-switch-first8-exact.cjs');
const registered=require('../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');

function physicalBruteForce(counts,openingHandSize,prizeCount){
  const cards=counts.flatMap((n,c)=>Array(n).fill(c));
  const result={denominator:0n,numerators:{startingAdp:0n,
    switchAdpDrawn:0n,switchTagOnly:0n,switchPlusQuick:0n,
    switchPlusUltra:0n}};
  const indices=cards.map((_,i)=>i);
  function subsets(array,count,start=0,prefix=[],out=[]){
    if(prefix.length===count){out.push([...prefix]);return out;}
    for(let i=start;i<=array.length-(count-prefix.length);i++){
      prefix.push(array[i]);subsets(array,count,i+1,prefix,out);prefix.pop();
    }
    return out;
  }
  for(const handIdx of subsets(indices,openingHandSize)){
    const hand=handIdx.map(i=>cards[i]);
    if(!hand.includes(0)&&!hand.includes(1))continue;
    const outside=indices.filter(i=>!handIdx.includes(i));
    for(const prizeIdx of subsets(outside,prizeCount)){
      const afterPrize=outside.filter(i=>!prizeIdx.includes(i));
      for(const drawIdx of afterPrize){
        const seen=[...hand,cards[drawIdx]];
        const deck=afterPrize.filter(i=>i!==drawIdx).map(i=>cards[i]);
        const has=k=>seen.includes(k);
        const energy=has(7)||(deck.includes(7)&&
          (has(6)||(has(3)&&deck.includes(6))));
        result.denominator++;
        if(!energy)continue;
        if(hand.includes(0)){result.numerators.startingAdp++;continue;}
        if(!has(2))continue;
        const drewAdp=has(0),couldSearch=deck.includes(0);
        if(drewAdp)result.numerators.switchAdpDrawn++;
        if(drewAdp||(couldSearch&&has(3)))
          result.numerators.switchTagOnly++;
        if(drewAdp||(couldSearch&&(has(3)||has(4))))
          result.numerators.switchPlusQuick++;
        if(drewAdp||(couldSearch&&(has(3)||has(4)||has(5))))
          result.numerators.switchPlusUltra++;
      }
    }
  }
  return result;
}

test('registered candidate category census and exact known Agent1 baseline',()=>{
  const counts=categorizeFixedDeck(registered);
  assert.deepEqual(counts,[2,5,2,4,3,4,3,4,33]);
  const result=countFirstTurnAccess(counts);
  assert.equal(result.denominator,250397245379590400n);
  assert.equal(result.numerators.startingAdp,72599308478295760n);
  assert.ok(Math.abs(ratio(result.numerators.startingAdp,result.denominator)-
    0.289936530125316)<1e-12);
  const pct=key=>100*ratio(result.numerators[key],result.denominator);
  assert.ok(Math.abs(pct('switchTagOnly')-5.855876541332041)<1e-9);
  assert.ok(Math.abs(pct('switchPlusQuick')-7.462447987156273)<1e-9);
  assert.ok(Math.abs(pct('switchPlusUltra')-8.987877506082592)<1e-9);
});

test('full physical toy enumeration exactly matches category/prize/draw method',()=>{
  const cases=[
    [1,2,1,1,1,1,1,1,2],
    [2,1,1,1,0,1,1,1,2],
    [1,2,2,0,1,0,1,1,2]
  ];
  for(const categories of cases){
    assert.equal(categories.length,KEYS.length);
    const exact=countFirstTurnAccess(categories,
      {openingHandSize:3,prizeCount:2});
    const physical=physicalBruteForce(categories,3,2);
    assert.equal(exact.denominator,physical.denominator);
    assert.deepEqual(exact.numerators,physical.numerators);
  }
});

test('monotone inclusion and no Switch control',()=>{
  const original=countFirstTurnAccess([2,5,2,4,3,4,3,4,33]);
  const n=original.numerators;
  assert.ok(n.switchAdpDrawn<=n.switchTagOnly);
  assert.ok(n.switchTagOnly<=n.switchPlusQuick);
  assert.ok(n.switchPlusQuick<=n.switchPlusUltra);
  const noSwitch=countFirstTurnAccess([2,5,0,4,3,4,3,4,35]);
  assert.equal(noSwitch.numerators.switchTagOnly,0n);
  assert.equal(noSwitch.numerators.switchPlusQuick,0n);
  assert.equal(noSwitch.numerators.switchPlusUltra,0n);
});
