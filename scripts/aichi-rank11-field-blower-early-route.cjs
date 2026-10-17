'use strict';

const assert = require('node:assert/strict');
const manifest = require('../results/aichi-2026/full-decklists.json');

const CHAMPION_BASIC_NAMES = new Set([
  'Shadow Rider Calyrex V', "Lillie's Clefairy ex", 'Tapu Lele-GX',
  'Trevenant & Dusknoir-GX', 'Latias ex', 'Dialga-GX', 'Mimikyu',
  'Girafarig', 'Marshadow', 'Radiant Eternatus'
]);

/** @param {number[]} caps @param {number} total @returns {number[][]} */
function allocations(caps, total) {
  const out = [];
  /** @param {number} index @param {number} left @param {number[]} values */
  function visit(index, left, values) {
    if(index === caps.length-1) {
      if(left<=caps[index]) out.push([...values,left]);
      return;
    }
    for(let n=0;n<=Math.min(caps[index],left);n++) {
      visit(index+1,left-n,[...values,n]);
    }
  }
  visit(0,total,[]);
  return out;
}

const BINOMIAL = Array.from({length:61},(_,n)=> {
  const row = Array(61).fill(0n);
  row[0]=1n;
  if(n>0)for(let k=1;k<=n;k++) {
    row[k]=(BINOMIAL[n-1]?.[k-1]||0n)+(BINOMIAL[n-1]?.[k]||0n);
  }
  return row;
});
/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k) { return k<0||k>n?0n:BINOMIAL[n][k]; }
/** @param {bigint} a @param {bigint} b */
function gcd(a,b){while(b!==0n){const r=a%b;a=b;b=r;}return a;}
/** @param {bigint} n @param {bigint} d */
function fraction(n,d) {
  const g=gcd(n,d);
  return {numerator:String(n/g),denominator:String(d/g),
    percent:Number(n)/Number(d)*100};
}
/** @param {number[]} source @param {number[]} selected */
function ways(source,selected) {
  return source.reduce((product,n,i)=>product*choose(n,selected[i]),1n);
}

/**
 * Exact uniformly dealt opening model. Categories:
 * Shadow Rider V, Forest Seal Stone, Field Blower, other Basics, remaining.
 * Seven valid starting cards, six Prizes set, then one first-turn draw.
 * @param {number[]} counts
 */
function exact(counts){
  assert.equal(counts.reduce((a,b)=>a+b,0),60);
  let valid=0n,direct=0n,stone=0n,union=0n;
  for(const hand of allocations(counts,7)){
    if(hand[0]+hand[3]===0) continue;
    const handWays=ways(counts,hand);
    const remaining=counts.map((n,i)=>n-hand[i]);
    for(const prizes of allocations(remaining,6)){
      const dealtWays=handWays*ways(remaining,prizes);
      for(let draw=0;draw<counts.length;draw++){
        const available=remaining[draw]-prizes[draw];
        if(available===0) continue;
        const weight=dealtWays*BigInt(available);
        const fieldBlowerVisible=hand[2]>0||draw===2;
        const stoneVisible=hand[1]>0||draw===1;
        const shadowVVisible=hand[0]>0||draw===0;
        const stoneBlowerSearch=stoneVisible&&shadowVVisible&&prizes[2]===0;
        valid+=weight;
        if(fieldBlowerVisible)direct+=weight;
        if(stoneBlowerSearch)stone+=weight;
        if(fieldBlowerVisible||stoneBlowerSearch)union+=weight;
      }
    }
  }
  const validExpected=(choose(60,7)-choose(60-counts[0]-counts[3],7))*
    choose(53,6)*47n;
  assert.equal(valid,validExpected,'Opening-seven mulligan conditioning mismatch');
  assert.ok(union>=direct&&union>=stone);
  return {
    validDealWeight:String(valid),totalDealWeight:String(choose(60,7)*choose(53,6)*47n),
    validOpening:fraction(valid,choose(60,7)*choose(53,6)*47n),
    directFieldBlower:fraction(direct,valid),
    stoneShadowVAndUnprizedBlower:fraction(stone,valid),
    unionDirectOrStone:fraction(union,valid),
    additionalDisjointStoneRoute:fraction(union-direct,valid)
  };
}

/** Validate the event definition against the immutable rank-one registration. */
function run(){
  const deck=manifest.decks.find(row=>row.rank===1);
  assert.ok(deck&&deck.cards.reduce((n,c)=>n+c.count,0)===60);
  const copies=name=>deck.cards.filter(c=>c.name===name).reduce((n,c)=>n+c.count,0);
  const allBasic=deck.cards.filter(c=>CHAMPION_BASIC_NAMES.has(c.name))
    .reduce((n,c)=>n+c.count,0);
  const v=copies('Shadow Rider Calyrex V');
  const stone=copies('Forest Seal Stone');
  const blower=copies('Field Blower');
  assert.equal(v,3);assert.equal(stone,1);assert.equal(blower,1);
  assert.equal(allBasic,14);
  const counts=[v,stone,blower,allBasic-v,60-allBasic-stone-blower];
  return {
    schema:'rank11-garbotoxin-champion-opening-response-resource-opportunity-v1',
    source:'Aichi final rank1 source 60 versus final rank11 printed Garbotoxin',
    sourceCounts:{shadowRiderV:v,forestSealStone:stone,fieldBlower:blower,
      otherBasics:allBasic-v,otherCards:counts[4]},
    definition:'Conditional on initial valid seven. Reveal first seven, set six random Prizes, then mandatory first draw. Event is direct Field Blower in first eight OR Stone and Shadow Rider V in first eight with Field Blower not Prized. No mulligan bonus, other searches, Item lock, evolved board, simulated choice or whole-game win.',
    exact:exact(counts),qualifiedForCompetitiveInference:false
  };
}
if(require.main===module) process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={allocations,exact,run};
