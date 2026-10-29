'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const CATEGORIES = Object.freeze([
  'Trubbish','Garbodor','Boost Shake','eligible Tool','Quick Ball',
  'Battle VIP Pass','Dark Patch','Darkness Energy','Mega Absol ex',
  'Crobat V','other Basic','other'
]);
const IX = Object.freeze({TR:0,GAR:1,BOOST:2,TOOL:3,QUICK:4,VIP:5,
  PATCH:6,DARK:7,MEGA:8,CROBAT:9,OTHER_BASIC:10,OTHER:11});
const FIXED_RANK11_COUNTS = Object.freeze([2,2,2,6,4,4,3,8,3,1,5,20]);
const BENCHABLE_OTHER_BASICS = new Set([
  'Oranguru V','Latias ex','Tapu Lele-GX','Squawkabilly ex'
]);
const TOOLS = new Set(['Float Stone','Forest Seal Stone','Muscle Band']);

/**
 * Verify rank 11 against the repository's exact published sixty rather than
 * silently treating a different list as the original source.
 * @param {object} deck Parsed entry in full-decklists.json.
 * @returns {number[]} Disjoint 12-category physical-card counts.
 */
function rank11Categories(deck) {
  assert.equal(deck.rank,11);
  const counts = Array(CATEGORIES.length).fill(0);
  for (const card of deck.cards) {
    assert.ok(Number.isInteger(card.count) && card.count>0);
    let i;
    if (card.name==='Trubbish') i=IX.TR;
    else if (card.name==='Garbodor') i=IX.GAR;
    else if (card.name==='Boost Shake') i=IX.BOOST;
    else if (TOOLS.has(card.name)) i=IX.TOOL;
    else if (card.name==='Quick Ball') i=IX.QUICK;
    else if (card.name==='Battle VIP Pass') i=IX.VIP;
    else if (card.name==='Dark Patch') i=IX.PATCH;
    else if (card.name==='Darkness Energy') i=IX.DARK;
    else if (card.name==='Mega Absol ex') i=IX.MEGA;
    else if (card.name==='Crobat V') i=IX.CROBAT;
    else if (BENCHABLE_OTHER_BASICS.has(card.name)) i=IX.OTHER_BASIC;
    else {
      assert.notEqual(card.category,'Pokémon',
        'Unexpected original Basic or Evolution needs explicit classification');
      i=IX.OTHER;
    }
    counts[i]+=card.count;
  }
  assert.deepEqual(counts,FIXED_RANK11_COUNTS);
  return counts;
}

const combinations = new Map();
/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k) {
  if(k<0 || k>n || n<0)return 0n;
  k=Math.min(k,n-k);
  const key=n+','+k;
  if(combinations.has(key))return combinations.get(key);
  let value=1n;
  for(let i=1;i<=k;i++)value=value*BigInt(n-k+i)/BigInt(i);
  combinations.set(key,value);
  return value;
}

/**
 * Six hidden Prize cards from the 52 cards after the first ordinary draw.
 * Inclusion-exclusion forces at least one searchable copy of each requested
 * target to remain in the deck. Hand-held copies do not count as searchable.
 * @param {number[]} live Cards in the remaining 52 positions before Prizes.
 * @param {number[]} targets Disjoint target-category indices.
 * @returns {bigint}
 */
function prizeSafeWays(live,targets) {
  let total=0n;
  for(let mask=0;mask<(1<<targets.length);mask++){
    let removed=0,bits=0;
    for(let i=0;i<targets.length;i++)if(mask&(1<<i)){
      removed+=live[targets[i]];bits++;
    }
    total+=(bits%2?-1n:1n)*choose(52-removed,6-removed);
  }
  return total;
}

/**
 * Exact multivariate count of physically distinct seven-card hands, a uniformly
 * drawn eighth card, and six Prize cards. All percentages condition only on a
 * Basic-valid opening seven; no strategy, mulligan bonuses or cards drawn from
 * additional effects are assumed.
 * @param {number[]} [capacities] Frozen original rank-11 counts.
 * @returns {object} Exact integer numerators and denominator.
 */
function evaluate(capacities=FIXED_RANK11_COUNTS) {
  assert.equal(capacities.length,12);
  assert.equal(capacities.reduce((s,n)=>s+n,0),60);
  const counts={quickBoost:0n,patchOverlap:0n,oneQuickNamedConflict:0n,
    crobatBenchable:0n,crobatInitiallyHeld:0n,crobatDrawnEighth:0n,
    crobatForcedActive:0n,crobatAbsent:0n};
  const hand=Array(12).fill(0);
  let validHandCategoryVectors=0,qualifyingDrawClasses=0;
  const consume=(weight)=>{
    if(hand[IX.TR]+hand[IX.MEGA]+hand[IX.CROBAT]+
       hand[IX.OTHER_BASIC]===0)return;
    validHandCategoryVectors++;
    for(let drawn=0;drawn<12;drawn++){
      const remaining=capacities[drawn]-hand[drawn];
      if(remaining===0)continue;
      const eight=hand.slice();eight[drawn]++;
      if(!eight[IX.BOOST]||!eight[IX.TOOL]||!eight[IX.QUICK]||
         eight[IX.TR]||eight[IX.VIP])continue;
      qualifyingDrawClasses++;
      const live=capacities.map((c,i)=>c-eight[i]);
      const physicalWeight=weight*BigInt(remaining);
      const safe=prizeSafeWays(live,[IX.TR,IX.GAR]);
      counts.quickBoost+=physicalWeight*safe;
      if(!eight[IX.PATCH]||!eight[IX.DARK])continue;
      counts.patchOverlap+=physicalWeight*safe;
      const megaCanBench=(hand[IX.MEGA]>0&&
        (hand[IX.TR]+hand[IX.CROBAT]+hand[IX.OTHER_BASIC]>0||
         eight[IX.MEGA]>=2))||
        (hand[IX.MEGA]===0&&eight[IX.MEGA]>0);
      if(megaCanBench||eight[IX.QUICK]!==1)continue;
      const threeSafe=prizeSafeWays(live,[IX.TR,IX.GAR,IX.MEGA]);
      const ways=physicalWeight*threeSafe;
      counts.oneQuickNamedConflict+=ways;
      if(!eight[IX.CROBAT])counts.crobatAbsent+=ways;
      else if(hand[IX.CROBAT]===1&&
        hand[IX.TR]+hand[IX.MEGA]+hand[IX.OTHER_BASIC]===0)
        counts.crobatForcedActive+=ways;
      else {
        counts.crobatBenchable+=ways;
        if(hand[IX.CROBAT])counts.crobatInitiallyHeld+=ways;
        else counts.crobatDrawnEighth+=ways;
      }
    }
  };
  const recurse=(category,left,weight)=>{
    if(category===11){
      if(left<=capacities[11]){
        hand[11]=left;
        consume(weight*choose(capacities[11],left));
      }
      return;
    }
    const maximum=Math.min(capacities[category],left);
    for(let n=0;n<=maximum;n++){
      hand[category]=n;
      recurse(category+1,left-n,
        weight*choose(capacities[category],n));
    }
  };
  recurse(0,7,1n);
  const denominator=(choose(60,7)-choose(49,7))*53n*choose(52,6);
  assert.equal(counts.oneQuickNamedConflict,
    counts.crobatBenchable+counts.crobatForcedActive+counts.crobatAbsent);
  assert.equal(counts.crobatBenchable,
    counts.crobatInitiallyHeld+counts.crobatDrawnEighth);
  return {denominator,counts,validHandCategoryVectors,
    qualifyingDrawClasses};
}

/** @param {bigint} count @param {bigint} denominator @returns {number} */
function percent(count,denominator) {
  return Number(count)/Number(denominator)*100;
}

function run() {
  const file=path.resolve(__dirname,'../results/aichi-2026/full-decklists.json');
  const data=JSON.parse(fs.readFileSync(file,'utf8'));
  const original=data.decks.find(deck=>deck.rank===11);
  const counts=rank11Categories(original);
  const exact=evaluate(counts);
  return {schema:'agent10-rank11-crobat-darkpatch-opening-v1',
    source:'results/aichi-2026/full-decklists.json rank 11',
    categories:CATEGORIES,capacities:counts,
    denominator:exact.denominator.toString(),
    counts:Object.fromEntries(Object.entries(exact.counts).map(([k,v])=>
      [k,{numerator:v.toString(),percent:percent(v,exact.denominator)}])),
    conflictCrobatBenchableFraction:
      Number(exact.counts.crobatBenchable)/
      Number(exact.counts.oneQuickNamedConflict),
    exactCardLocationOnly:true,competitiveGames:0};
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={CATEGORIES,IX,FIXED_RANK11_COUNTS,rank11Categories,
  choose,prizeSafeWays,evaluate,percent,run};
