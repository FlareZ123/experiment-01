'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {allGroupsDirect,rank6DirectGuzmaAndEnergy}=
  require('../scripts/aichi-rank6-guzma-energy-direct.cjs');

/** @param {string[]} cards @param {number} n */
function* combinations(cards,n){
  if(n===0){yield [];return;}
  for(let i=0;i<=cards.length-n;i++)
    for(const tail of combinations(cards.slice(i+1),n-1))
      yield [cards[i],...tail];
}
/** Exhaust distinct physical opening, Prize subsets, ordered normal draws. */
function brute(cards,h,p,needed){
  let total=0n,win=0n;
  for(const open of combinations(cards,h)){
    if(!open.some(x=>x[0]==='B'))continue;
    const rest=cards.filter(x=>!open.includes(x));
    for(const prize of combinations(rest,p)){
      const draw=rest.filter(x=>!prize.includes(x));
      for(const a of draw)for(const b of draw){
        if(a===b)continue;
        total++;
        const found=new Set([...open,a,b].map(x=>x[0]));
        if(needed.every(x=>found.has(x)))win++;
      }
    }
  }
  return {total,win};
}
test('all physical eight-card Prize deals match exact inclusion-exclusion',()=>{
  const cards=['B1','S1','D1','G1','O1','O2','O3','O4'];
  const x={size:8,basics:1,hand:3,prizes:2,later:2};
  for(const [groups,needed] of [
    [[1,1,1],['S','D','G']],[[1,1],['S','D']],[[1],['G']]
  ]){
    const expected=allGroupsDirect({...x,groups});
    const observed=brute(cards,3,2,needed);
    assert.equal(BigInt(expected.numerator)*observed.total,
      BigInt(expected.denominator)*observed.win);
  }
  assert.equal(allGroupsDirect({...x,groups:[1,0,1]}).percent,0);
});
test('rank6 source printed 60 and exact direct-resource conjunction',()=>{
  const r=rank6DirectGuzmaAndEnergy();
  assert.deepEqual(r.printedSource,{
    basics:4,speedLightning:4,doubleColorless:1,guzma:3});
  assert.ok(Math.abs(r.fundedAndGuzma.percent-
    1.7246484747705095)<1e-11);
  assert.ok(Math.abs(r.speedAndDce.percent-
    5.753653413188393)<1e-11);
  assert.ok(Math.abs(r.guzma.percent-
    36.48146030916423)<1e-11);
  assert.equal(r.competitiveGamesQualified,0);
});
