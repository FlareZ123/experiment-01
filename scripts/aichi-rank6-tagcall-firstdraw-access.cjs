'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const VERSION='agent6-rank6-tagcall-first-draw-exact-v1';
const CATEGORY=Object.freeze({BASIC:0,TAG:1,HALA:2,MOUNTAIN:3,OTHER:4});

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(!Number.isSafeInteger(n)||!Number.isSafeInteger(k)||n<0)
    throw new TypeError('Expected nonnegative integer population and integer selection');
  if(k<0||k>n)return 0n;
  let result=1n;
  for(let j=1;j<=Math.min(k,n-k);j++)
    result=result*BigInt(n-j+1)/BigInt(j);
  return result;
}

/** @param {number[]} populations @param {number} count @returns {number[][]} */
function combinationsOfCategories(populations,count){
  const out=[];
  /** @param {number} index @param {number} left @param {number[]} selected */
  function visit(index,left,selected){
    if(index===populations.length){
      if(left===0)out.push(selected);
      return;
    }
    for(let k=0;k<=Math.min(left,populations[index]);k++)
      visit(index+1,left-k,[...selected,k]);
  }
  visit(0,count,[]);
  return out;
}

/** @param {number[]} populations @param {number[]} counts @returns {bigint} */
function ways(populations,counts){
  return populations.reduce((product,n,index)=>product*choose(n,counts[index]),1n);
}

/**
 * Exact uniformly shuffled physical deal count. The opening seven must
 * include a Basic. Six Prizes are set; one card is then drawn before T1.
 * No bonus draws, Trainer effects, or attack completion are modeled.
 * @param {{counts:number[],openingHand:number,prizes:number}} inputs
 * @returns {Record<string,bigint>}
 */
function exactFirstDrawDeals({counts,openingHand,prizes}){
  assert.equal(counts.length,5);
  assert.ok(counts.every(n=>Number.isSafeInteger(n)&&n>=0));
  assert.ok(Number.isSafeInteger(openingHand)&&openingHand>=1);
  assert.ok(Number.isSafeInteger(prizes)&&prizes>=0);
  const total=counts.reduce((a,b)=>a+b,0);
  assert.ok(openingHand+prizes<total);
  const counters={valid:0n,tagHeld:0n,tagHeldNoHala:0n,
    tagNoHalaTargetMountain:0n,tagNoHalaMountainPrized:0n,
    tagNoHalaBothHalaPrized:0n,tagNoHalaBothFailure:0n};
  for(const hand of combinationsOfCategories(counts,openingHand)){
    if(hand[CATEGORY.BASIC]===0)continue;
    const handWays=ways(counts,hand);
    const afterHand=counts.map((n,i)=>n-hand[i]);
    for(const prize of combinationsOfCategories(afterHand,prizes)){
      const prizeWays=ways(afterHand,prize);
      const afterPrize=afterHand.map((n,i)=>n-prize[i]);
      for(let draw=0;draw<counts.length;draw++){
        if(afterPrize[draw]===0)continue;
        const weight=handWays*prizeWays*BigInt(afterPrize[draw]);
        counters.valid+=weight;
        const tagsSeen=hand[CATEGORY.TAG]+Number(draw===CATEGORY.TAG);
        if(tagsSeen===0)continue;
        counters.tagHeld+=weight;
        if(hand[CATEGORY.HALA]+Number(draw===CATEGORY.HALA)>0)continue;
        counters.tagHeldNoHala+=weight;
        const mountainPrized=prize[CATEGORY.MOUNTAIN]>0;
        const allHalaPrized=prize[CATEGORY.HALA]===counts[CATEGORY.HALA];
        if(mountainPrized)counters.tagNoHalaMountainPrized+=weight;
        if(allHalaPrized)counters.tagNoHalaBothHalaPrized+=weight;
        if(mountainPrized&&allHalaPrized)
          counters.tagNoHalaBothFailure+=weight;
        if(!mountainPrized&&!allHalaPrized)
          counters.tagNoHalaTargetMountain+=weight;
      }
    }
  }
  const expected=(choose(total,openingHand)-
    choose(total-counts[CATEGORY.BASIC],openingHand))*
    choose(total-openingHand,prizes)*
    BigInt(total-openingHand-prizes);
  assert.equal(counters.valid,expected,'physical deal denominator mismatch');
  assert.equal(counters.tagHeldNoHala,
    counters.tagNoHalaTargetMountain+
    counters.tagNoHalaMountainPrized+
    counters.tagNoHalaBothHalaPrized-
    counters.tagNoHalaBothFailure,'Prize failure union mismatch');
  return counters;
}

/** @returns {number[]} Verified exact rank-6 original printed inventory. */
function originalRank6Counts(){
  const file=path.resolve(__dirname,'../results/aichi-2026/full-decklists.json');
  const field=JSON.parse(fs.readFileSync(file,'utf8'));
  const original=field.decks.find(deck=>deck.rank===6);
  assert.ok(original,'Exact original Aichi rank6 not found');
  assert.equal(original.cards.reduce((sum,c)=>sum+c.count,0),60);
  assert.deepEqual(original.cards.filter(c=>c.category==='Pokémon')
    .map(c=>[c.name,c.count]),[['Iron Thorns ex',4]]);
  const count=name=>original.cards.filter(c=>c.name===name)
    .reduce((sum,c)=>sum+c.count,0);
  assert.equal(count('Tag Call'),2);
  assert.equal(count('Guzma & Hala'),2);
  assert.equal(count('Thunder Mountain ♢'),1);
  return [4,2,2,1,51];
}

/** @param {bigint} numerator @param {bigint} denominator @returns {number} */
const rate=(numerator,denominator)=>Number(numerator)/Number(denominator);

if(require.main===module){
  const counts=originalRank6Counts();
  const totals=exactFirstDrawDeals({counts,openingHand:7,prizes:6});
  const percentages=Object.fromEntries(Object.entries(totals)
    .filter(([name])=>name!=='valid')
    .map(([name,n])=>[name,100*rate(n,totals.valid)]));
  process.stdout.write(JSON.stringify({version:VERSION,counts,
    physicalDealCounts:Object.fromEntries(Object.entries(totals)
      .map(([name,n])=>[name,String(n)])),percentages},null,2)+'\n');
}

module.exports={VERSION,CATEGORY,choose,combinationsOfCategories,ways,
  exactFirstDrawDeals,originalRank6Counts,rate};
