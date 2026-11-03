'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROSTER=path.resolve(__dirname,
  '../../results/aichi-2026/full-decklists.json');

const KNOWN_CATEGORIES=Object.freeze([
  ['regV',['Regidrago V']],
  ['otherBasic',['Latias ex','Tapu Lele-GX','Dedenne-GX','Squawkabilly ex','Budew']],
  ['donorBasic',['Dialga-GX','Kyurem']],
  ['donorEvolved',['Salamence ex','Dragapult ex','Noivern ex']],
  ['vstar',['Regidrago VSTAR']],
  ['treasure',['Mysterious Treasure']],
  ['compressor',['Battle Compressor']],
  ['quickBall',['Quick Ball']],
  ['doubleDragon',['Double Dragon Energy']],
  ['grass',['Grass Energy']],
  ['fire',['Fire Energy']]
]);

/**
 * Partition the exact published rank13 60 by paper-relevant physical card
 * functions. Fail closed if the source inventory or categories have drifted.
 * The anonymous remainder does not contribute to any scored event.
 *
 * @param {object} roster Parsed immutable source decklist registration.
 * @returns {Array<{key:string,copies:number}>}
 */
function sourceCategories(roster) {
  const source=roster?.decks?.find(row=>row.rank===13);
  assert.equal(source?.player,'Hiromu Sasaki');
  assert.equal(source?.archetype,'Regidrago');
  const counts=new Map(source.cards.map(card=>[card.name,card.count]));
  assert.equal(counts.size,source.cards.length,
    'Require each printed rank13 name to occupy one roster entry');
  assert.equal([...counts.values()].reduce((a,b)=>a+b,0),60);
  const used=new Set();
  const categories=KNOWN_CATEGORIES.map(([key,names])=>{
    let copies=0;
    for(const name of names){
      assert.ok(!used.has(name),'Category collision '+name);
      used.add(name);
      assert.ok(counts.has(name),'Source entry missing '+name);
      copies+=counts.get(name);
    }
    return {key,copies};
  });
  const remaining=[...counts].filter(([name])=>!used.has(name))
    .reduce((sum,[,copies])=>sum+copies,0);
  categories.push({key:'other',copies:remaining});
  assert.deepEqual(categories.map(x=>x.copies),
    [4,5,2,3,3,4,2,3,3,4,3,24]);
  assert.equal(categories.reduce((sum,x)=>sum+x.copies,0),60);
  return categories;
}

/**
 * Exact integer binomial.
 * @param {number} n Nonnegative finite population.
 * @param {number} k Selection count.
 * @returns {bigint}
 */
function choose(n,k) {
  assert.ok(Number.isSafeInteger(n)&&n>=0);
  assert.ok(Number.isSafeInteger(k));
  if(k<0||k>n)return 0n;
  let r=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)
    r=r*BigInt(n-i+1)/BigInt(i);
  return r;
}

/**
 * Enumerate all 7-card physical category-count vectors with exact
 * hypergeometric weights. Marginalize the subsequent 6 prizes from the
 * remaining 53 cards only for the explicit Treasure -> VSTAR-in-deck route.
 *
 * @param {Array<{key:string,copies:number}>} categories
 * @returns {object} BigInt counts for distinct and combined opening screens.
 */
function exactCounts(categories) {
  assert.deepEqual(categories.map(x=>x.key),
    [...KNOWN_CATEGORIES.map(x=>x[0]),'other']);
  assert.equal(categories.reduce((sum,x)=>sum+x.copies,0),60);
  const byName=new Map(categories.map((cat,i)=>[cat.key,i]));
  const opened=Array(categories.length).fill(0);
  const prizeWays=choose(53,6);
  const validHands=choose(60,7)-choose(49,7);
  const jointDenominator=validHands*prizeWays;
  const counts=Object.fromEntries([
    'basicValidHands','oldRouteHands','oldEnergyHands',
    'treasureDonorHands','treasureEnergyHands',
    'oldPrizeMarginal','oldEnergyPrizeMarginal',
    'treasurePrizeMarginal','treasureEnergyPrizeMarginal',
    'unionPrizeMarginal','unionEnergyPrizeMarginal',
    'overlapPrizeMarginal','overlapEnergyPrizeMarginal',
    'treasureEnergyVstarNotHeldPrizeMarginal',
    'treasureEnergyVstarHeldPrizeMarginal'
  ].map(key=>[key,0n]));
  let vectors=0;

  function evaluate(weight) {
    vectors++;
    const get=key=>opened[byName.get(key)];
    const rv=get('regV'),b=get('otherBasic')+get('donorBasic');
    if(rv+b===0)return;
    counts.basicValidHands+=weight;
    const energy=get('doubleDragon')>=2||
      (get('doubleDragon')>=1&&(get('grass')+get('fire')>=1));
    const oldRoute=rv>0&&get('vstar')>0&&
      (get('compressor')>0||
        (get('quickBall')>0&&get('donorEvolved')>0));
    const treasureRoute=rv>0&&get('treasure')>0&&
      get('donorBasic')+get('donorEvolved')>0;
    const searchableVstarCopies=3-get('vstar');
    const viableTreasurePrizes=treasureRoute&&searchableVstarCopies>0?
      prizeWays-choose(53-searchableVstarCopies,
        6-searchableVstarCopies):0n;
    const oldW=oldRoute?prizeWays:0n;
    const newW=viableTreasurePrizes;
    const unionW=oldRoute?prizeWays:newW;
    const overlapW=oldRoute?newW:0n;
    if(oldRoute)counts.oldRouteHands+=weight;
    if(treasureRoute)counts.treasureDonorHands+=weight;
    counts.oldPrizeMarginal+=weight*oldW;
    counts.treasurePrizeMarginal+=weight*newW;
    counts.unionPrizeMarginal+=weight*unionW;
    counts.overlapPrizeMarginal+=weight*overlapW;
    if(!energy)return;
    if(oldRoute)counts.oldEnergyHands+=weight;
    if(treasureRoute)counts.treasureEnergyHands+=weight;
    counts.oldEnergyPrizeMarginal+=weight*oldW;
    counts.treasureEnergyPrizeMarginal+=weight*newW;
    counts.unionEnergyPrizeMarginal+=weight*unionW;
    counts.overlapEnergyPrizeMarginal+=weight*overlapW;
    if(treasureRoute){
      counts[get('vstar')===0?
        'treasureEnergyVstarNotHeldPrizeMarginal':
        'treasureEnergyVstarHeldPrizeMarginal']+=weight*newW;
    }
  }

  function walk(index,remaining,weight) {
    if(index===categories.length){
      if(remaining===0)evaluate(weight);
      return;
    }
    const available=categories[index].copies;
    for(let n=0;n<=Math.min(available,remaining);n++){
      opened[index]=n;
      walk(index+1,remaining-n,weight*choose(available,n));
    }
    opened[index]=0;
  }
  walk(0,7,1n);
  assert.equal(counts.basicValidHands,validHands);
  assert.equal(counts.oldEnergyHands,751044n);
  assert.equal(counts.oldRouteHands,9687014n);
  assert.equal(counts.treasureDonorHands,21887656n);
  assert.equal(counts.treasureEnergyHands,1957040n);
  assert.equal(counts.unionEnergyPrizeMarginal,
    counts.oldEnergyPrizeMarginal+
    counts.treasureEnergyPrizeMarginal-
    counts.overlapEnergyPrizeMarginal);
  assert.equal(counts.unionPrizeMarginal,
    counts.oldPrizeMarginal+
    counts.treasurePrizeMarginal-
    counts.overlapPrizeMarginal);
  return {version:'agent8-rank13-treasure-to-vstar-prize-marginal-v1',
    cards:60,openingCards:7,prizeCards:6,
    validHands,vectors,prizeWays,jointDenominator,counts};
}

/** @param {bigint} numerator @param {bigint} denominator */
function percentage(numerator,denominator){
  return (100*Number(numerator)/Number(denominator)).toFixed(9)+'%';
}

/** @returns {object} JSON-safe exact census and decimal convenience display. */
function main() {
  const categories=sourceCategories(JSON.parse(fs.readFileSync(ROSTER,'utf8')));
  const result=exactCounts(categories);
  const names=Object.keys(result.counts);
  const stats=Object.fromEntries(names.map(key=>{
    const numerator=result.counts[key];
    const divisor=key==='basicValidHands'?choose(60,7):
      key.endsWith('Hands')?result.validHands:result.jointDenominator;
    return [key,{numerator:numerator.toString(),
      denominator:divisor.toString(),
      percentage:percentage(numerator,divisor)}];
  }));
  return {version:result.version,categories,
    categoryVectors:result.vectors,
    basicValidHandDenominator:result.validHands.toString(),
    handAndPrizeDenominator:result.jointDenominator.toString(),
    prizeDealCount:result.prizeWays.toString(),stats,
    claimScope:'Physical opening resource co-occurrence only: no action, non-prize target access other than the explicit VSTAR screen, opponent lock, paid sequencing, policy, full match or win success certified.'};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={KNOWN_CATEGORIES,sourceCategories,choose,exactCounts,
  percentage,main};
