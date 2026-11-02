'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const VERSION='agent4-garbotoxin-literal-open-v1';
const RANKS=Object.freeze([8,11,16,22]);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&n>=0);
  assert.ok(Number.isSafeInteger(k));
  if(k<0||k>n)return 0n;
  let product=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)
    product=product*BigInt(n-i+1)/BigInt(i);
  return product;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b){
  while(b!==0n){const r=a%b;a=b;b=r;}
  return a;
}

/**
 * Exact opening sample without accepted opponent mulligan bonus cards.
 * Seven initial cards must contain a Basic. Sample six Prizes, then one
 * turn-one draw; all 60-card physical permutations are equiprobable.
 * The literal condition is Trubbish + Float Stone + Boost Shake in the
 * eight owner-visible cards AND at least one Garbodor still in deck.
 * This tests only raw resource presence, not legal execution or strength.
 *
 * @param {{trubbish:number,floatStone:number,boostShake:number,
 *          garbodor:number,basic:number}} p Source-60 counts.
 * @returns {{numerator:string,denominator:string,
 *           validStartProbability:number,conditionalProbability:number,
 *           unconditionalProbability:number}}
 */
function literalOpeningChance(p){
  for(const [key,n] of Object.entries(p)){
    assert.ok(Number.isSafeInteger(n)&&n>=0,key+' count must be nonnegative integer');
  }
  const {trubbish:a,floatStone:b,boostShake:c,garbodor:d,basic}=p;
  assert.ok(basic>=a&&basic<=60);
  const populations=[a,b,c,d,basic-a,60-basic-b-c-d];
  assert.ok(populations.every(n=>n>=0));
  assert.equal(populations.reduce((n,x)=>n+x,0),60);
  const prizeWays=choose(52,6);
  const allEightWays=choose(60,8);
  let weightedSuccessful=0n;
  for(let na=1;na<=Math.min(a,8);na++)
   for(let nb=1;nb<=Math.min(b,8-na);nb++)
    for(let nc=1;nc<=Math.min(c,8-na-nb);nc++)
     for(let nd=0;nd<=Math.min(d,8-na-nb-nc);nd++)
      for(let ne=0;ne<=Math.min(basic-a,8-na-nb-nc-nd);ne++){
        const nf=8-na-nb-nc-nd-ne;
        if(nf<0||nf>populations[5])continue;
        const hand=[na,nb,nc,nd,ne,nf];
        const handWays=hand.reduce((acc,h,i)=>acc*choose(populations[i],h),1n);
        const basicInEight=na+ne;
        // Of eight possible last-drawn positions, exactly one invalidates
        // the first-seven Basic requirement when only one Basic is visible.
        const validWeight=basicInEight===1?7n:8n;
        const garbRemaining=d-nd;
        const waysAllGarbPrized=choose(52-garbRemaining,6-garbRemaining);
        weightedSuccessful+=handWays*validWeight*(prizeWays-waysAllGarbPrized);
      }
  const unconditionalDenominator=8n*allEightWays*prizeWays;
  const validStarts=choose(60,7)-choose(60-basic,7);
  const validStartProbability=Number(validStarts)/Number(choose(60,7));
  const conditionalNumerator=weightedSuccessful*choose(60,7);
  const conditionalDenominator=unconditionalDenominator*validStarts;
  const divisor=gcd(conditionalNumerator,conditionalDenominator);
  return {
    numerator:(conditionalNumerator/divisor).toString(),
    denominator:(conditionalDenominator/divisor).toString(),
    validStartProbability,
    conditionalProbability:Number(conditionalNumerator)/Number(conditionalDenominator),
    unconditionalProbability:Number(weightedSuccessful)/Number(unconditionalDenominator)
  };
}

/** @param {object} deck Original normalized 60-card published entry. */
function countsFromSource(deck){
  assert.ok(RANKS.includes(deck.rank));
  assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
  const count=name=>deck.cards.filter(c=>c.name===name)
    .reduce((n,c)=>n+c.count,0);
  // Every Pokemon in these four source lists besides Garbodor is Basic.
  // If a source adds another evolution, stop rather than misclassify it.
  const supported=new Set(['Mega Absol ex','Trubbish','Garbodor','Tapu Koko ♢',
    'Dedenne-GX','Crobat V','Squawkabilly ex','Tapu Lele-GX',
    'Budew','Oranguru V','Latias ex','Vikavolt V']);
  const pokemon=deck.cards.filter(c=>c.category==='Pokémon');
  assert.ok(pokemon.every(c=>supported.has(c.name)));
  return {trubbish:count('Trubbish'),floatStone:count('Float Stone'),
    boostShake:count('Boost Shake'),garbodor:count('Garbodor'),
    basic:pokemon.filter(c=>c.name!=='Garbodor')
      .reduce((n,c)=>n+c.count,0)};
}

/** @param {object} roster */
function analyze(roster){
  return RANKS.map(rank=>{
    const deck=roster.decks.find(d=>d.rank===rank);
    assert.ok(deck,'missing original rank '+rank);
    const counts=countsFromSource(deck);
    return {rank,player:deck.player,counts,...literalOpeningChance(counts)};
  });
}
if(require.main===module){
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  process.stdout.write(JSON.stringify({version:VERSION,rows:analyze(roster)},null,2)+'\n');
}
module.exports={VERSION,RANKS,choose,literalOpeningChance,countsFromSource,analyze};
