'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const VERSION='agent8-rank6-direct-guzma-nine-card-marginal-v1';

/**
 * Compute an exact binomial coefficient with integer arithmetic.
 * @param {number} n Population size.
 * @param {number} k Subset size.
 * @returns {bigint}
 */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&n>=0);
  assert.ok(Number.isSafeInteger(k)&&k>=0);
  if(k>n)return 0n;
  const q=Math.min(k,n-k);
  let result=1n;
  for(let i=1;i<=q;i++)
    result=result*BigInt(n-q+i)/BigInt(i);
  return result;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b){
  while(b!==0n){const r=a%b;a=b;b=r;}
  return a;
}

/**
 * Without any additional search or discard: probability of at least one
 * printed Guzma among the original first N natural draws, conditioned on
 * the original seven-card hand containing at least one Basic Iron Thorns.
 * Six Prize cards are placed uniformly after the opening seven; marginal
 * draw exchangeability makes the next N-7 natural cards a simple sample
 * from the remaining 53, despite the intermediate Prize assignment.
 *
 * Formula for complement:
 * [C(60-Z,N)/C(60,N)] *
 * [1-C(60-Z-B,7)/C(60-Z,7)] /
 * [1-C(60-B,7)/C(60,7)].
 *
 * @param {object} counts Verified printed natural-opening roster counts.
 * @param {number} counts.deckSize Total cards.
 * @param {number} counts.basicCount Source's playable Basic Pokémon.
 * @param {number} counts.guzmaCount Source's original Guzma copies.
 * @param {number} [seenCards=9] Opening seven plus natural card draws.
 * @returns {object} Exact reduced fraction and decimal probability.
 */
function naturalGuzmaConditionalBasic(counts,seenCards=9){
  const {deckSize,basicCount,guzmaCount}=counts;
  assert.ok([deckSize,basicCount,guzmaCount,seenCards]
    .every(x=>Number.isSafeInteger(x)));
  assert.ok(deckSize>=7&&basicCount>=1&&guzmaCount>=1);
  assert.ok(basicCount+guzmaCount<=deckSize);
  assert.ok(seenCards>=7&&seenCards<=deckSize-6,
    'The requested natural draw count crosses the six Prize cards');
  const opening=7;
  const eligibleOpenings=choose(deckSize,opening)-
    choose(deckSize-basicCount,opening);
  assert.ok(eligibleOpenings>0n);
  const noGuzmaDeck=deckSize-guzmaCount;
  const openingNoGuzmaWithBasic=choose(noGuzmaDeck,opening)-
    choose(noGuzmaDeck-basicCount,opening);
  const noGuzmaSample=choose(noGuzmaDeck,seenCards);
  const sample=choose(deckSize,seenCards);
  const noGuzmaNumerator=noGuzmaSample*openingNoGuzmaWithBasic*
    choose(deckSize,opening);
  const denominator=sample*choose(noGuzmaDeck,opening)*
    eligibleOpenings;
  const numerator=denominator-noGuzmaNumerator;
  assert.ok(numerator>=0n&&numerator<=denominator);
  const divisor=gcd(numerator,denominator);
  return Object.freeze({
    seenCards,basicCount,guzmaCount,deckSize,
    numerator:(numerator/divisor).toString(),
    denominator:(denominator/divisor).toString(),
    decimal:Number(numerator)/Number(denominator),
    implication:'natural-draw-only marginal; not Guzma playable or v10-hand conditional',
    competitiveGamesQualified:0
  });
}

/**
 * Read and certify the exact rank6 original physical source counts.
 * @returns {object} Immutable Basic and Guzma source counts.
 */
function rank6NaturalGuzmaProxy(){
  const source=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  const deck=source.decks.find(row=>row.rank===6);
  assert.ok(deck&&deck.player==='Kazuma Kashi');
  assert.equal(deck.cards.reduce((n,row)=>n+row.count,0),60);
  const basicCount=deck.cards.filter(row=>row.category==='Pokémon'&&
    row.name==='Iron Thorns ex').reduce((n,row)=>n+row.count,0);
  const guzmaCount=deck.cards.filter(row=>row.name==='Guzma')
    .reduce((n,row)=>n+row.count,0);
  assert.equal(basicCount,4);
  assert.equal(guzmaCount,3);
  assert.equal(deck.cards.filter(row=>row.category==='Pokémon')
    .reduce((n,row)=>n+row.count,0),4);
  return naturalGuzmaConditionalBasic({deckSize:60,
    basicCount,guzmaCount},9);
}

module.exports={VERSION,choose,naturalGuzmaConditionalBasic,
  rank6NaturalGuzmaProxy};
