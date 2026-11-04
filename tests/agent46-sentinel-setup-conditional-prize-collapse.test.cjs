'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {choose,conditionalEvent,collapseUnion,sentinelReport}=
  require('../simulation/evaluation/agent46-sentinel-setup-conditional-prize-collapse.cjs');

/** @param {string[]} list @param {number} k @returns {string[][]} */
function combinations(list,k){
  if(k===0)return [[]];
  if(k>list.length)return [];
  const out=[];
  for(let i=0;i<=list.length-k;i++)
    for(const rest of combinations(list.slice(i+1),k-1))
      out.push([list[i],...rest]);
  return out;
}

/**
 * Independent exhaustive physical opener-first enumeration for toy decks.
 * @param {string[]} names
 * @param {Set<string>} basics
 * @param {number} opener
 * @param {number} prizes
 * @param {(prize:string[])=>boolean} accept
 * @returns {{numerator:bigint,denominator:bigint}}
 */
function brute(names,basics,opener,prizes,accept){
  let numerator=0n,denominator=0n;
  for(const hand of combinations(names,opener)){
    if(!hand.some(x=>basics.has(x)))continue;
    const remaining=names.filter(x=>!hand.includes(x));
    for(const prize of combinations(remaining,prizes)){
      denominator++;
      if(accept(prize))numerator++;
    }
  }
  return {numerator,denominator};
}

test('binomial recurrence returns exact integers outside and inside domain',()=>{
  assert.equal(choose(60,6),50063860n);
  assert.equal(choose(7,3),35n);
  assert.equal(choose(7,-1),0n);
  assert.equal(choose(7,8),0n);
});

test('joint physical basic+other Prize event matches independent toy brute force',()=>{
  const names=['B0','B1','X0','X1','X2','X3','X4'];
  const basics=new Set(['B0','B1']);
  const exact=conditionalEvent({total:7,basic:2,opening:2,prizes:2,
    forcedBasic:1,forcedOther:1});
  const enumerated=brute(names,basics,2,2,prize=>
    prize.includes('B0')&&prize.includes('X0'));
  assert.deepEqual(exact,enumerated);
});

test('overlapping two path collapses with common prized Gladion use union',()=>{
  const names=['B0','B1','Gladion','A','B','F0','F1','F2'];
  const basics=new Set(['B0','B1']);
  const e=collapseUnion({total:8,basic:2,opening:3,prizes:2,
    cards:names.map(name=>({name,count:1})),
    basicNames:[...basics],recoveryName:'Gladion',
    stageNames:['A','B']});
  const bruteEvent=brute(names,basics,3,2,prize=>
    prize.includes('Gladion')&&
      (prize.includes('A')||prize.includes('B')));
  assert.deepEqual(e,bruteEvent);
});

test('actual frozen Sentinel 60 conditional collapse and overlap bounds',()=>{
  const r=sentinelReport();
  assert.equal(r.totalCards,60);
  assert.equal(r.basic,14);
  assert.equal(r.competitivelyQualifiedGames,0);
  const singles=new Map(r.singleStageCollapseWithGladionPrized.map(x=>
    [x.name,x.percent]));
  assert.equal(singles.get('Grand Tree'),'0.858419%');
  assert.equal(singles.get('Stoutland'),'0.858419%');
  assert.equal(singles.get('Vileplume'),'0.059579%');
  assert.equal(singles.get('Oddish'),'0.056203%');
  const unions=new Map(r.unionStageCollapseWithGladionPrized.map(x=>
    [x.name,x.percent]));
  assert.equal(unions.get('eitherLock'),'1.864100%');
  assert.equal(unions.get('eitherLockOrGrandTree'),'2.595130%');
  assert.equal(unions.get('allNamedSupportPaths'),'2.838587%');
  assert.ok(r.unionStageCollapseWithGladionPrized.every(x=>
    BigInt(x.numerator)>0n&&BigInt(x.denominator)>BigInt(x.numerator)));
});
