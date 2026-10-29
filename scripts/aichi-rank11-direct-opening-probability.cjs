'use strict';

const assert=require('node:assert/strict');

const OTHER_BASIC_NAMES=[
  'Mega Absol ex','Oranguru V','Latias ex','Tapu Lele-GX',
  'Crobat V','Squawkabilly ex'
];
const TOOL_NAMES=['Float Stone','Forest Seal Stone','Muscle Band'];

/**
 * Exact print-count partition of the published rank-11 60. Mega Absol ex
 * MEG 86 is Basic; Garbodor BKP 57 is Stage 1. Verify every partition
 * against the original list before counting, rather than assuming a model.
 * @param {{rank:number,cards:Array<{name:string,count:number}>}} deck
 * @returns {number[]} Trubbish, other Basic, VIP, Tool, Boost, Garbodor, other.
 */
function directOpeningCategories(deck){
  assert.equal(deck.rank,11);
  assert.ok(Array.isArray(deck.cards));
  const count=name=>deck.cards.filter(card=>card.name===name)
    .reduce((sum,card)=>sum+card.count,0);
  const total=deck.cards.reduce((sum,card)=>sum+card.count,0);
  assert.equal(total,60);
  const trubbish=count('Trubbish');
  const otherBasic=OTHER_BASIC_NAMES.reduce((sum,name)=>sum+count(name),0);
  const vip=count('Battle VIP Pass');
  const tools=TOOL_NAMES.reduce((sum,name)=>sum+count(name),0);
  const boost=count('Boost Shake');
  const garbodor=count('Garbodor');
  assert.deepEqual([trubbish,otherBasic,vip,tools,boost,garbodor],
    [2,9,4,6,2,2],
    'Published rank-11 opener inventory/print classification changed');
  return [trubbish,otherBasic,vip,tools,boost,garbodor,
    total-trubbish-otherBasic-vip-tools-boost-garbodor];
}

/** @param {number} n @param {number} k @returns {number} */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&Number.isSafeInteger(k)&&
    n>=0&&k>=0);
  if(k>n)return 0;
  const r=Math.min(k,n-k);
  let result=1;
  for(let j=1;j<=r;j++)result=result*(n-r+j)/j;
  assert.ok(Number.isSafeInteger(result));
  return result;
}

/** @param {number} a @param {number} b @returns {number} */
function gcd(a,b){
  while(b!==0)[a,b]=[b,a%b];
  return a;
}

/**
 * Exhaustive multivariate-hypergeometric initial seven, followed by one
 * ordinary first-turn draw (or zero for a diagnostic). Condition on at
 * least one Basic among the initial seven, as required by setup. This
 * excludes opponent mulligan bonus draws, all card plays and later search.
 *
 * The event is a syntactic directBoostShakeOpportunity hand prerequisite:
 * one Boost Shake, one Tool and either Trubbish or Battle VIP Pass.
 * The K0 guard rejects hands holding both Garbodor. This does not prove
 * legal native execution, a searchable evolution, a future lock or a win.
 *
 * @param {number[]} categories From directOpeningCategories.
 * @param {{ordinaryDraws?:0|1,k0AvoidAllGarbodorHeld?:boolean,
 *   optimisticQuickBallAccess?:boolean}} [options]
 */
function exactDirectOpeningEvent(categories,{
  ordinaryDraws=1,k0AvoidAllGarbodorHeld=true,
  optimisticQuickBallAccess=false
}={}){
  assert.equal(categories.length,7);
  assert.ok(ordinaryDraws===0||ordinaryDraws===1);
  assert.equal(categories.reduce((a,b)=>a+b,0),60);
  const counts=categories.slice();
  if(optimisticQuickBallAccess){
    // Original rank-11 list contains four Quick Ball. Counting each as
    // a free Trubbish route intentionally ignores its discard payment,
    // K1/search existence, locks and connector contention.
    assert.ok(counts[6]>=4);
    counts[2]+=4;
    counts[6]-=4;
  }
  const firstSeven=7;
  const basicCount=counts[0]+counts[1];
  const expectedDenominator=(choose(60,firstSeven)-
    choose(60-basicCount,firstSeven))*
    (ordinaryDraws===1?53:1);
  let denominator=0,numerator=0;
  const hand=Array(counts.length).fill(0);
  function satisfied(){
    return hand[4]>0&&hand[3]>0&&hand[0]+hand[2]>0&&
      (!k0AvoidAllGarbodorHeld||hand[5]<2);
  }
  function visit(index,remaining,ways){
    if(index===counts.length){
      if(remaining!==0||hand[0]+hand[1]===0)return;
      if(ordinaryDraws===0){
        denominator+=ways;
        if(satisfied())numerator+=ways;
        return;
      }
      denominator+=ways*53;
      for(let next=0;next<counts.length;next++){
        const available=counts[next]-hand[next];
        if(available===0)continue;
        hand[next]++;
        if(satisfied())numerator+=ways*available;
        hand[next]--;
      }
      return;
    }
    for(let held=0;held<=Math.min(counts[index],remaining);held++){
      hand[index]=held;
      visit(index+1,remaining-held,ways*choose(counts[index],held));
    }
    hand[index]=0;
  }
  visit(0,firstSeven,1);
  assert.equal(denominator,expectedDenominator);
  assert.ok(Number.isSafeInteger(numerator)&&
    Number.isSafeInteger(denominator)&&numerator<=denominator);
  const divisor=gcd(numerator,denominator);
  return {
    numerator,denominator,
    reducedFraction:[numerator/divisor,denominator/divisor],
    probability:numerator/denominator,
    firstSevenBasicConditioned:true,
    ordinaryDraws,k0AvoidAllGarbodorHeld,optimisticQuickBallAccess,
    firstRootOnly:true,qualifiedForCompetitiveInference:false
  };
}

if(require.main===module){
  const original=require('../results/aichi-2026/full-decklists.json')
    .decks.find(deck=>deck.rank===11);
  const categories=directOpeningCategories(original);
  const baseline=exactDirectOpeningEvent(categories);
  const quickBallOptimistic=exactDirectOpeningEvent(categories,{
    optimisticQuickBallAccess:true
  });
  process.stdout.write(JSON.stringify({categories,baseline,
    quickBallOptimistic,zeroFirstRootEventsAcrossSixDistinctDeals:
      (1-baseline.probability)**6},null,2)+'\n');
}

module.exports={OTHER_BASIC_NAMES,TOOL_NAMES,
  directOpeningCategories,choose,exactDirectOpeningEvent};
