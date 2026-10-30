'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const VERSION='agent40-bunnelby-known-source-direct-8-card-conjunction-v1';

/** Exact binomial coefficient with BigInt; integer at every step. */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&Number.isSafeInteger(k)&&
    n>=0&&k>=0&&k<=n);
  let result=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)
    result=result*BigInt(n-i+1)/BigInt(i);
  return result;
}

/**
 * Enumerate a seven-card starting hand followed by one natural draw as one
 * eight-card subset, ignoring opener mulligans and opponent bonus draws.
 * Categories are disjoint physical print groups. No staged-game simulator.
 *
 * @param {number[]} counts [Bunnelby, other evolvable Basic, GH, TagCall, TM, Jet, rest]
 * @returns {{total:bigint,conjunction:bigint,supporter:bigint,heldPair:bigint}}
 */
function countConjunction(counts){
  assert.equal(counts.length,7);
  assert.equal(counts.reduce((a,b)=>a+b,0),60);
  const total=choose(60,8),acc={
    total,conjunction:0n,supporter:0n,heldPair:0n};
  for(let b=0;b<=counts[0];b++)
    for(let t=0;t<=counts[1];t++)
      for(let g=0;g<=counts[2];g++)
        for(let tag=0;tag<=counts[3];tag++)
          for(let tm=0;tm<=counts[4];tm++)
            for(let jet=0;jet<=counts[5];jet++){
              const other=8-b-t-g-tag-tm-jet;
              if(other<0||other>counts[6]||b===0||t===0)continue;
              const weight=choose(counts[0],b)*choose(counts[1],t)*
                choose(counts[2],g)*choose(counts[3],tag)*
                choose(counts[4],tm)*choose(counts[5],jet)*
                choose(counts[6],other);
              const supporter=g+tag>0,heldPair=tm>0&&jet>0;
              if(supporter)acc.supporter+=weight;
              if(heldPair)acc.heldPair+=weight;
              if(supporter||heldPair)acc.conjunction+=weight;
            }
  return acc;
}
const countCards=(deck,name)=>deck.cards.filter(x=>x.name===name)
  .reduce((n,row)=>n+row.count,0);

/**
 * Rank2 Vileplume and rank15 Lopunny Vileplume both include Bunnelby and
 * three prospective evolution Basics. This is one narrow *observable*
 * direct-hand conjunction, NOT the probability of playing a complete ALS.
 *
 * A hand may obtain Bunnelby/targets via Artazon or another line and succeed
 * without the conjunction. A hand satisfying it can fail through Prize
 * placement, Supporter discard cost, search exhaustion, and turn sequencing.
 *
 * @param {2|15} rank Source 60.
 * @param {object} manifest Frozen authenticated exact field.
 */
function evaluate(rank,manifest){
  assert.ok(rank===2||rank===15);
  const deck=manifest.decks.find(x=>x.rank===rank);
  assert.ok(deck);
  assert.equal(deck.cards.reduce((n,row)=>n+row.count,0),60);
  const evoTargets=rank===2?['Oddish','Pidgey','Lillipup']:
    ['Oddish','Pidgey','Buneary'];
  const counts=[
    countCards(deck,'Bunnelby'),
    evoTargets.reduce((n,name)=>n+countCards(deck,name),0),
    countCards(deck,'Guzma & Hala'),
    countCards(deck,'Tag Call'),
    countCards(deck,'Technical Machine: Evolution'),
    countCards(deck,'Jet Energy')
  ];
  counts.push(60-counts.reduce((n,c)=>n+c,0));
  const raw=countConjunction(counts);
  const toRate=x=>Number(x)/Number(raw.total);
  const basicNames=new Set(rank===2?
    ['Bunnelby','Oddish','Pidgey','Lillipup','Fan Rotom','Relicanth',
      'Mr. Mime','Girafarig','Budew','Jirachi']:
    ['Bunnelby','Oddish','Pidgey','Buneary','Fan Rotom','Budew',
      'Eldegoss V','Tatsugiri']);
  const basicCount=deck.cards.filter(x=>basicNames.has(x.name))
    .reduce((n,x)=>n+x.count,0);
  assert.equal(basicCount,14,'Original source basic-profile changed');
  const pOpenValid=1-Number(choose(60-basicCount,7))/
    Number(choose(60,7));
  return {rank,counts,denominator:String(raw.total),
    direct8ConjunctionNumerator:String(raw.conjunction),
    direct8ConjunctionProbability:toRate(raw.conjunction),
    direct8SupportedByGuzmaHalaOrTagCallProbability:
      toRate(raw.supporter),
    direct8HeldJetAndTmProbability:toRate(raw.heldPair),
    firstSevenHasBasicProbability:pOpenValid,
    direct8ConjunctionConditionedOnLegalInitialSeven:
      toRate(raw.conjunction)/pOpenValid,
    exclusions:'Artazon searches, extra draw, card-cost feasibility, Prizes, actual TM attack settlement, all opponent behavior',
    competitiveQualifiedGames:0};
}

/** Source-derived exact combinatorics; never a sampled win-rate claim. */
function run(){
  const manifest=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  return {schema:VERSION,scope:'Exact direct-hand component conjunction only',
    population:'Authenticated original rank2 and rank15 60s',
    results:[evaluate(2,manifest),evaluate(15,manifest)],
    caveat:'This is not a bound on overall first-turn ALS success: alternative Stadium/Item paths can succeed without the conjunction and protected-card discard/prizing can make included hands fail.',
    competitiveQualifiedGames:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,choose,countConjunction,evaluate,run};
