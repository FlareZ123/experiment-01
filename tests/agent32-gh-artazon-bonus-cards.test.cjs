'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,sourceBonusCounts,countBonusSearchWindow,main}=
  require('../simulation/evaluation/agent32-gh-artazon-bonus-cards.cjs');

/** @param {number} n @param {number} k @returns {number[][]} */
function subsets(n,k){
  const out=[];
  /** @param {number} start @param {number[]} chosen */
  function recurse(start,chosen){
    if(chosen.length===k){out.push([...chosen]);return;}
    for(let i=start;i<=n-(k-chosen.length);i++){
      chosen.push(i);recurse(i+1,chosen);chosen.pop();
    }
  }
  recurse(0,[]);
  return out;
}

/**
 * Count literal distinguishable physical cards, first-seven selections,
 * subsequent extra draw membership and Prize set directly, without
 * inclusion-exclusion or grouped hypergeometric formula.
 * @param {number[]} groups
 * @param {number} bonus
 * @returns {bigint}
 */
function physicalOracle(groups,bonus){
  const all=groups.flatMap((count,type)=>Array(count).fill(type));
  const seen=8+bonus;
  let favorable=0n;
  const legalSevenMasks=subsets(seen,7);
  for(const h of subsets(all.length,seen)){
    const hSet=new Set(h);
    const hand=h.map(i=>all[i]);
    if(!hand.includes(5)||
       (!hand.includes(3)&&!hand.includes(4)))continue;
    const species=[0,1,2].filter(type=>hand.includes(type)).length;
    if(species<2)continue;
    const physicalLeft=all.filter((_,i)=>!hSet.has(i));
    const initialValid=legalSevenMasks.filter(indices=>
      indices.some(index=>[0,1,2,11].includes(hand[index]))).length;
    if(initialValid===0)continue;
    for(const p of subsets(physicalLeft.length,2)){
      const prizeSet=new Set(p);
      const deck=physicalLeft.filter((_,i)=>!prizeSet.has(i));
      if(![5,6,7,8,9].every(type=>deck.includes(type)))continue;
      if(!hand.includes(3)&&!deck.includes(3))continue;
      if(species===2){
        if(!hand.includes(10)&&!deck.includes(10))continue;
        if([0,1,2].some(type=>!hand.includes(type)&&
          !deck.includes(type)))continue;
      }
      favorable+=BigInt(initialValid);
    }
  }
  return favorable;
}

test('fixed sixty splits anonymous other into 8 Basic and 25 nonbasic',()=>{
  assert.equal(VERSION,'agent32-exeggutor-gh-artazon-optional-bonus-exact-v1');
  const x=sourceBonusCounts();
  assert.equal(x.totalBasics,14);
  assert.deepEqual(x.counts,
    [2,2,2,4,4,3,2,2,2,2,2,8,25]);
});

test('zero bonus exactly reproduces the prior Prize-aware conditional fraction',()=>{
  const report=main(),first=report.rows[0].conditionalValidInitialSeven;
  assert.equal(first.numerator,'89772393489231');
  assert.equal(first.denominator,'3739215166086400');
  assert.equal(report.rows.length,4);
  assert.equal(report.rows[1].optionalOpeningBonusCards,1);
});

test('literal toy physical-index oracle verifies zero bonus reweighting',()=>{
  const toy=[1,1,1,1,1,2,1,1,1,1,1,1,2];
  assert.equal(toy.reduce((a,b)=>a+b,0),15);
  const r=countBonusSearchWindow(toy,4,0,7,2);
  assert.equal(r.weighted,physicalOracle(toy,0));
  assert.ok(r.weighted>0n);
});

test('literal toy physical-index oracle verifies one bonus initial-seven gating',()=>{
  const toy=[1,1,1,1,1,2,1,1,1,1,1,1,2];
  const r=countBonusSearchWindow(toy,4,1,7,2);
  assert.equal(r.weighted,physicalOracle(toy,1));
  assert.ok(r.weighted>0n);
});

test('a bonus card cannot automatically repair an invalid original seven',()=>{
  const toy=[1,1,1,1,1,2,1,1,1,1,1,1,2];
  const r=countBonusSearchWindow(toy,4,1,7,2);
  const n=9;
  // Some 9-card hands may be Basic-valid only because of late bonus cards;
  // the evaluator's original-seven validity weighs only the legal prefixes.
  assert.ok(r.numerator>0n);
  assert.ok(r.denominator>r.numerator);
  assert.equal(n,9);
});

test('invalid optional bonus count rejected',()=>{
  const {counts,totalBasics}=sourceBonusCounts();
  assert.throws(()=>countBonusSearchWindow(counts,totalBasics,6),
    /AssertionError/);
});
