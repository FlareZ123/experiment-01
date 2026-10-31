'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const SOURCE=path.join(__dirname,'../results/aichi-2026/full-decklists.json');
const RANK=1;
const BASIC_NAMES=new Set([
  'Shadow Rider Calyrex V',
  "Lillie's Clefairy ex",
  'Tapu Lele-GX',
  'Trevenant & Dusknoir-GX',
  'Latias ex',
  'Dialga-GX',
  'Mimikyu',
  'Girafarig',
  'Marshadow',
  'Radiant Eternatus'
]);

/**
 * Exact binomial coefficients in signed 64-bit-scale BigInt, without
 * floating accumulation or Monte Carlo seed dependence.
 * @param {number} n
 * @param {number} k
 * @returns {bigint}
 */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&Number.isSafeInteger(k));
  if(k<0||k>n)return 0n;
  let ans=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)
    ans=ans*BigInt(n-i+1)/BigInt(i);
  return ans;
}

/** @param {object[]} cards @returns {number[]} */
function originalSourceCategories(cards){
  const count=name=>cards.filter(c=>c.name===name)
    .reduce((n,c)=>n+c.count,0);
  const total=cards.reduce((n,c)=>n+c.count,0);
  assert.equal(total,60,'The original rank1 physical deck must be 60');
  const basicTotal=cards.filter(c=>BASIC_NAMES.has(c.name))
    .reduce((n,c)=>n+c.count,0);
  const marshadow=count('Marshadow');
  const heavyBall=count('Hisuian Heavy Ball');
  const stadium=count('Sky Field')+count('Dimension Valley');
  const fog=count('Fog Crystal');
  const discardSearch=count('Mysterious Treasure')+count('Quick Ball');
  const otherBasic=basicTotal-marshadow;
  const otherNonBasic=60-marshadow-heavyBall-stadium-fog-
    discardSearch-otherBasic;
  assert.deepEqual([marshadow,heavyBall,stadium,fog,discardSearch,
    otherBasic,otherNonBasic],[1,1,3,4,5,13,33],
    'Source rank1 list or identity assumptions changed');
  return [marshadow,heavyBall,stadium,fog,discardSearch,
    otherBasic,otherNonBasic];
}

/**
 * Enumerate all unordered seven-card starting hands with at least one Basic.
 * The six subsequently allocated Prize cards are uniform among 53 remaining
 * cards. If Marshadow is absent from the hand, it has probability 47/53 of
 * remaining in the deck and 6/53 of being Prized. Each winning hand/prize
 * condition is weighted as an exact 53-scaled combinatorial count.
 *
 * @param {number[]} totals [Marshadow, Heavy Ball, Stadium, Fog,
 *   discard-search Items, other Basics, other nonbasics].
 * @returns {object}
 */
function calculate(totals){
  assert.equal(totals.length,7);
  assert.equal(totals.reduce((a,b)=>a+b,0),60);
  const current=Array(7).fill(0);
  let valid=0n,direct=0n,noDiscard53=0n,optimistic53=0n;
  function visit(index,remaining,ways){
    if(index===totals.length){
      if(remaining!==0)return;
      const [tech,heavy,stadium,fog,discard,otherBasic]=current;
      if(tech+otherBasic===0)return;
      valid+=ways;
      const isDirect=tech+stadium>0;
      if(isDirect)direct+=ways;
      // Prize location probability applies only if the one Marshadow is
      // neither already held nor a Stadium alternative already in hand.
      const nonDiscardPoints=isDirect?53:
        fog>0?47+(heavy>0?6:0):(heavy>0?6:0);
      const optimisticPoints=isDirect?53:
        fog+discard>0?47+(heavy>0?6:0):(heavy>0?6:0);
      noDiscard53+=ways*BigInt(nonDiscardPoints);
      optimistic53+=ways*BigInt(optimisticPoints);
      return;
    }
    for(let k=0;k<=Math.min(totals[index],remaining);k++){
      current[index]=k;
      visit(index+1,remaining-k,ways*choose(totals[index],k));
    }
  }
  visit(0,7,1n);
  const full=choose(60,7);
  assert.equal(valid,full-choose(60-totals[0]-totals[5],7),
    'Mulligan conditioning count mismatch');
  /** @param {bigint} numerator @param {bigint} denominator */
  const out=(numerator,denominator)=>({
    numerator:numerator.toString(),denominator:denominator.toString(),
    probability:Number(numerator)/Number(denominator)
  });
  return {
    schema:'agent5-source-rank1-opening-counter-access-v1',
    source:SOURCE.replace(path.resolve(__dirname,'..')+path.sep,''),
    rank:RANK, handSize:7,prizeSize:6,
    categories:Object.fromEntries([
      'marshadow','heavyBall','stadium','fogCrystal','discardSearch',
      'otherBasic','otherNonBasic'].map((k,i)=>[k,totals[i]])),
    validNonMulliganHand:out(valid,full),
    conditionalOnLegalOpening:{
      directMarshadowOrStadium:out(direct,valid),
      zeroDiscardFogOrPrizedHeavyBall:out(noDiscard53,53n*valid),
      discardSearchFeasibleUpperBound:out(optimistic53,53n*valid)
    },
    caveat:'Exact initial-seven/prize combinatorics only. Searches are availability upper bounds ignoring Item lock, hand discard payment, Bench occupancy, timing, K0 access, player action policy and evolving game state. No match win or opponent behavior.'
  };
}
function run(){
  const data=JSON.parse(fs.readFileSync(SOURCE,'utf8'));
  const source=data.decks.find(d=>d.rank===RANK);
  assert.ok(source,'Missing exact rank1 source');
  return calculate(originalSourceCategories(source.cards));
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={choose,originalSourceCategories,calculate,run};
