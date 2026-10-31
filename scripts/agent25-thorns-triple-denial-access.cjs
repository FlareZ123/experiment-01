'use strict';

const assert = require('node:assert/strict');
const VERSION = 'agent25-exact-triple-denial-cohold-v1';
const CARD_IDS = Object.freeze({
  basic: ['Iron Thorns ex', 'TWM', '77'],
  plumeria: ['Plumeria', 'BUS', '120'],
  flare: ['Team Flare Grunt', 'XY', '129'],
  hammer: ['Crushing Hammer', 'POR', '71']
});

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(k) ||
      n < 0 || k < 0 || k > n) return 0n;
  let result = 1n;
  for (let i = 1; i <= Math.min(k, n-k); i++) {
    result = result * BigInt(n-i+1) / BigInt(i);
  }
  return result;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b) {
  while(b!==0n) [a,b]=[b,a%b];
  return a;
}

/**
 * Exact conditional card-location probability from disjoint categories.
 * Requires at least one Basic in opening, then k ordinary draws; all six
 * unseen Prize cards are marginalized by exchangeability.
 * @param {{deckSize:number,opening:number,basicCount:number,
 *  requiredCounts:number[],draws:number}} input
 * @returns {{numerator:bigint,denominator:bigint,fraction:string,probability:number}}
 */
function exactCohold(input) {
  const {deckSize:N,opening:h,basicCount:b,requiredCounts:groups,draws:k}=input;
  for (const [name,v] of Object.entries({N,h,b,k}))
    assert.ok(Number.isSafeInteger(v) && v>=0,`${name} must be a nonnegative integer`);
  assert.ok(Array.isArray(groups) && groups.length<=12);
  for (const count of groups)
    assert.ok(Number.isSafeInteger(count)&&count>=0,'invalid required category count');
  assert.ok(h<=N && k<=N-h && b<=N && b+groups.reduce((a,c)=>a+c,0)<=N,
    'disjoint category counts must fit the deck');
  let favorable=0n;
  for(let mask=0;mask<(1<<groups.length);mask++) {
    let missing=0,sign=1n;
    for(let i=0;i<groups.length;i++) if(mask&(1<<i)){
      missing+=groups[i];sign=-sign;
    }
    favorable+=sign *
      (choose(N-missing,h)-choose(N-missing-b,h)) *
      choose(N-h-missing,k);
  }
  const total=(choose(N,h)-choose(N-b,h))*choose(N-h,k);
  assert.ok(total>0n && favorable>=0n && favorable<=total,
    'invalid basic-conditional event or invalid combinatorial numerator');
  const divisor=gcd(favorable,total);
  return Object.freeze({numerator:favorable,denominator:total,
    fraction:`${favorable/divisor}/${total/divisor}`,
    probability:Number(favorable)/Number(total)});
}

/** @param {object} deck @param {[string,string,string]} id */
function exactPrintingCount(deck,id) {
  return deck.cards.filter(c=>c.name===id[0]&&
    c.printing?.set===id[1]&&String(c.printing?.number)===id[2])
    .reduce((sum,c)=>sum+c.count,0);
}

/**
 * Physical original 60 rank audit. Other Trainer effects and opponent
 * mulligan bonuses are excluded; this is not native action availability.
 * @param {object} manifest Exact original Aichi source-deck manifest
 * @param {number} rank Final placement rank 6, 24 or 29
 * @param {number} draws Additional ordinary draws after the opening seven
 */
function sourceRankCohold(manifest,rank,draws=1) {
  assert.ok([6,24,29].includes(rank),'only authenticated Iron Thorns source ranks');
  const deck=manifest.decks.find(d=>d.rank===rank);
  assert.ok(deck&&deck.archetype==='Iron Thorns',`missing original source rank ${rank}`);
  const size=deck.cards.reduce((sum,c)=>sum+c.count,0);
  assert.equal(size,60,'original physical deck must contain exactly 60 cards');
  const counts=Object.fromEntries(Object.entries(CARD_IDS).map(([key,id])=>
    [key,exactPrintingCount(deck,id)]));
  assert.deepEqual([counts.basic,counts.plumeria,counts.flare],
    [4,4,2],'authenticated source printing/count contract changed');
  assert.ok(counts.hammer===0||counts.hammer===4,
    'unexpected source Crushing Hammer print/count');
  const common={deckSize:size,opening:7,basicCount:counts.basic,draws};
  const two=exactCohold({...common,requiredCounts:[counts.plumeria,counts.flare]});
  const three=exactCohold({...common,
    requiredCounts:[counts.plumeria,counts.flare,counts.hammer]});
  return Object.freeze({version:VERSION,rank,counts,draws,
    plumeriaAndFlare:two,plumeriaFlareAndHammer:three,
    tripleConditionalOnBoth:three.probability/two.probability,
    measures:'owner-card-location-only',nativePlayabilityVerified:false,
    opponentEnergyTargetRequired:true,competitiveGameQualified:false});
}

module.exports={VERSION,CARD_IDS,choose,exactCohold,sourceRankCohold};

if(require.main===module) {
  const manifest=require('../results/aichi-2026/full-decklists.json');
  const rows=[6,24,29].flatMap(rank=>[0,1,2].map(draws=>{
    const r=sourceRankCohold(manifest,rank,draws);
    return {rank,draws,hammerCopies:r.counts.hammer,
      two:r.plumeriaAndFlare.fraction,
      three:r.plumeriaFlareAndHammer.fraction,
      triplePct:(100*r.plumeriaFlareAndHammer.probability).toFixed(8)};
  }));
  process.stdout.write(JSON.stringify(rows,null,2)+'\n');
}
