'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {choose,loadSource}=
  require('../scripts/agent7-vileplume-artazon-capture-opening.cjs');
const {GROUPS,exactThreeChannel,sourceCounts,analyzeOriginal}=
  require('../scripts/agent7-vileplume-triple-opening-exact.cjs');

/**
 * Independent brute force over labelled, physically distinct cards.
 * This deliberately enumerates combinations of index positions rather
 * than recycling the dynamic program's category allocation formula.
 *
 * @param {Record<string,number>} categories
 * @param {number} h
 * @param {number} p
 * @returns {bigint}
 */
function enumeratePhysical(categories,h,p){
  const pool=GROUPS.flatMap(name=>Array(categories[name]).fill(name));
  const N=pool.length,indices=Array.from({length:N},(_,i)=>i);
  let favorable=0n;
  /** @param {number[]} remaining @param {number} k @returns {number[][]} */
  function combinations(remaining,k){
    if(k===0)return [[]];
    if(remaining.length<k)return [];
    const sets=[];
    for(let i=0;i<=remaining.length-k;i++)
      for(const rest of combinations(remaining.slice(i+1),k-1))
        sets.push([remaining[i],...rest]);
    return sets;
  }
  for(const hand of combinations(indices,h)){
    const hSet=new Set(hand);
    const afterHand=indices.filter(i=>!hSet.has(i));
    for(const prizes of combinations(afterHand,p)){
      const pSet=new Set(prizes);
      const afterPrizes=afterHand.filter(i=>!pSet.has(i));
      for(const drawn of afterPrizes){
        const deck=new Set(afterPrizes.filter(i=>i!==drawn));
        const handNames=[...hand,drawn].map(i=>pool[i]);
        const deckNames=[...deck].map(i=>pool[i]);
        if(!hand.some(i=>pool[i]==='B'))continue;
        if(!(handNames.includes('GH')||
          handNames.includes('TC')&&deckNames.includes('GH')))continue;
        if(['O','P','A','C','TM'].some(name=>
          prizes.every(i=>pool[i]===name)))continue;
        if(['Gloom','Pidgeotto','VileplumeAOR','Pidgeot'].some(name=>
          !deckNames.includes(name)))continue;
        favorable++;
      }
    }
  }
  return favorable;
}

test('tiny physical-zone exhaustive enumeration agrees exactly with DP',()=>{
  const tiny=Object.fromEntries(GROUPS.map(name=>[name,name==='OTHER'?0:1]));
  const result=exactThreeChannel(tiny,3,1);
  assert.equal(result.groupCount,12);
  assert.equal(result.denominator,choose(12,3)*choose(9,1)*8n);
  assert.equal(result.favorable,enumeratePhysical(tiny,3,1));
  assert.ok(result.favorable>0n,'Tiny independently enumerated model must be nonvacuous');
});

test('source original 60 exact fractions agree with independent 40m shuffle screen',()=>{
  const source=loadSource(path.resolve(__dirname,'..'));
  const expectations=new Map([
    [2,{estimate:0.13649086141640746,halfWidth:0.000115880965}],
    [15,{estimate:0.11342955413905774,halfWidth:0.00010682125}]
  ]);
  for(const rank of [2,15]){
    const result=analyzeOriginal(source.decks.find(x=>x.rank===rank));
    const a=expectations.get(rank);
    assert.equal(result.printedOriginalCards,60);
    assert.equal(result.groupCounts.B,2);
    assert.equal(result.groupCounts.TC,4);
    assert.equal(result.groupCounts.GH,rank===2?4:3);
    assert.equal(result.groupCounts.C,rank===2?2:1);
    assert.ok(Math.abs(result.conditionalProbability-a.estimate)<
      3*a.halfWidth,
    'Exact category probability must lie inside three Monte Carlo standard 95% half-widths');
    assert.ok(result.unconditionalProbability<result.conditionalProbability);
    assert.ok(result.conditionalProbability>0&&result.conditionalProbability<1);
  }
});
