'use strict';
const assert=require('node:assert/strict');
const {EVOLUTIONS,countBasics}=
  require('./aichi-field-mulligan-census.cjs');
const {openingProbabilities}=
  require('./aichi-opening-basics.cjs');
const {publicFailedHandHistoryPosterior}=
  require('./agent26-public-mulligan-fullhistory.cjs');

const VERSION='agent26-public-mulligan-name-history-information-simulation-v1';

/** @param {number} seed @returns {()=>number} */
function seededRandom(seed){
  let state=seed>>>0;
  if(state===0)state=0x9e3779b9;
  return ()=>{
    state^=state<<13;
    state^=state>>>17;
    state^=state<<5;
    return (state>>>0)/0x100000000;
  };
}

/**
 * Exact known source printing stage classification. The 60-card owner deck
 * is a *hypothesis used to generate simulated public hands*, never an input
 * that a live opponent-choice policy receives.
 * @param {object} deck Original source printing inventory.
 * @returns {{name:string,basic:boolean}[]}
 */
function expandedSource(deck){
  const out=[];
  for(const entry of deck.cards){
    const basic=entry.category==='Pokémon'&&!EVOLUTIONS.has(
      entry.printing.set+'-'+entry.printing.number);
    for(let i=0;i<entry.count;i++)
      out.push({name:entry.name,basic});
  }
  assert.equal(out.length,60);
  assert.equal(out.filter(x=>x.basic).length,countBasics(deck));
  return out;
}

/**
 * Draw a uniform unordered seven from 60 entries without replacement,
 * with independent full restoration between invalid opening hands.
 * @param {object[]} cards Source 60.
 * @param {()=>number} random
 * @returns {object[]}
 */
function sampleSeven(cards,random){
  assert.equal(cards.length,60);
  const pool=cards.slice();
  for(let i=0;i<7;i++){
    const j=i+Math.floor(random()*(60-i));
    [pool[i],pool[j]]=[pool[j],pool[i]];
  }
  return pool.slice(0,7);
}

/**
 * Sample the exact native-paper-observable identity sequence only.
 * The next valid seven is deliberately never returned to the classifier.
 * @param {object[]} cards Source 60.
 * @param {()=>number} random
 * @returns {string[][]}
 */
function samplePublicHistory(cards,random){
  const history=[];
  for(let attempt=0;attempt<1000;attempt++){
    const hand=sampleSeven(cards,random);
    if(hand.some(x=>x.basic))return history;
    history.push(hand.map(x=>x.name));
  }
  throw new Error('Failed to sample a Basic-valid seven after 1000 attempts');
}

function entropy(weights){
  return -weights.reduce((n,p)=>
    n+(p>0?p*Math.log2(p):0),0);
}

/**
 * Independent count-only baseline: observing exactly k failed seven-card
 * hands and no card identities. Both methods use uniform 29-source prior.
 * @param {object[]} decks Recovered sources with known printed Basic counts.
 * @param {number} k Observed failed hands.
 * @returns {number[]} Posteriors aligned to decks.
 */
function countOnlyPosterior(decks,k){
  const weights=decks.map(deck=>{
    const q=openingProbabilities(countBasics(deck))
      .initialMulliganProbability;
    return q**k*(1-q);
  });
  const total=weights.reduce((n,w)=>n+w,0);
  assert.ok(total>0);
  return weights.map(w=>w/total);
}

/**
 * Fixed-seed, balanced-by-source Monte Carlo of opening public-information
 * value alone. Results never represent full-game strength.
 * @param {object} manifest Original 29-source publication.
 * @param {{samplesPerSource?:number,seed?:number}} [options]
 * @returns {object} Full failure-inclusive sampled-source denominators.
 */
function assessPublicHistoryInformation(manifest,options={}){
  const samplesPerSource=options.samplesPerSource??256;
  const seed=options.seed??20261030;
  assert.ok(Number.isSafeInteger(samplesPerSource)&&
    samplesPerSource>=1&&samplesPerSource<=2048);
  assert.ok(Number.isSafeInteger(seed)&&seed>=1&&seed<=0xffffffff);
  assert.equal(manifest.decks.length,29);
  const decks=manifest.decks.slice().sort((a,b)=>a.rank-b.rank);
  const per=decks.map(deck=>({
    rank:deck.rank,attempts:0,withFailedSeven:0,totalFailedSevens:0,
    sumTruePosteriorCount:0,sumTruePosteriorNames:0,
    sumEntropyCount:0,sumEntropyNames:0,
    mapCorrectCount:0,mapCorrectNames:0
  }));
  const strata={
    noFailedSeven:{attempts:0,sumTrueCount:0,sumTrueNames:0,
      sumEntropyCount:0,sumEntropyNames:0},
    hasFailedSeven:{attempts:0,sumTrueCount:0,sumTrueNames:0,
      sumEntropyCount:0,sumEntropyNames:0}
  };
  for(let i=0;i<decks.length;i++){
    const cards=expandedSource(decks[i]);
    const row=per[i];
    for(let trial=0;trial<samplesPerSource;trial++){
      const stream=seededRandom((seed^Math.imul(decks[i].rank,0x9e3779b1)^
        Math.imul(trial+1,0x85ebca6b))>>>0);
      const history=samplePublicHistory(cards,stream);
      const onlyCount=countOnlyPosterior(decks,history.length);
      const full=publicFailedHandHistoryPosterior(manifest,history);
      assert.equal(full.models.length,decks.length);
      const namePosterior=full.models.map(model=>model.posterior);
      assert.deepEqual(full.models.map(x=>x.rank),decks.map(x=>x.rank));
      const countMap=onlyCount.indexOf(Math.max(...onlyCount));
      const nameMap=namePosterior.indexOf(Math.max(...namePosterior));
      row.attempts++;
      if(history.length>0)row.withFailedSeven++;
      row.totalFailedSevens+=history.length;
      row.sumTruePosteriorCount+=onlyCount[i];
      row.sumTruePosteriorNames+=namePosterior[i];
      row.sumEntropyCount+=entropy(onlyCount);
      row.sumEntropyNames+=full.posteriorEntropyBits;
      if(countMap===i)row.mapCorrectCount++;
      if(nameMap===i)row.mapCorrectNames++;
      const s=history.length===0?strata.noFailedSeven:strata.hasFailedSeven;
      s.attempts++;
      s.sumTrueCount+=onlyCount[i];
      s.sumTrueNames+=namePosterior[i];
      s.sumEntropyCount+=entropy(onlyCount);
      s.sumEntropyNames+=full.posteriorEntropyBits;
    }
  }
  const rate=(sum,n)=>n===0?null:sum/n;
  const summary=(rows)=>({
    attempts:rows.reduce((n,r)=>n+r.attempts,0),
    meanTruePosteriorCount:rate(rows.reduce((n,r)=>
      n+r.sumTruePosteriorCount,0),rows.reduce((n,r)=>n+r.attempts,0)),
    meanTruePosteriorNames:rate(rows.reduce((n,r)=>
      n+r.sumTruePosteriorNames,0),rows.reduce((n,r)=>n+r.attempts,0)),
    mapAccuracyCount:rate(rows.reduce((n,r)=>n+r.mapCorrectCount,0),
      rows.reduce((n,r)=>n+r.attempts,0)),
    mapAccuracyNames:rate(rows.reduce((n,r)=>n+r.mapCorrectNames,0),
      rows.reduce((n,r)=>n+r.attempts,0)),
    meanEntropyCountBits:rate(rows.reduce((n,r)=>n+r.sumEntropyCount,0),
      rows.reduce((n,r)=>n+r.attempts,0)),
    meanEntropyNamesBits:rate(rows.reduce((n,r)=>n+r.sumEntropyNames,0),
      rows.reduce((n,r)=>n+r.attempts,0))
  });
  const stratum=s=>({
    attempts:s.attempts,
    meanTruePosteriorCount:rate(s.sumTrueCount,s.attempts),
    meanTruePosteriorNames:rate(s.sumTrueNames,s.attempts),
    meanEntropyCountBits:rate(s.sumEntropyCount,s.attempts),
    meanEntropyNamesBits:rate(s.sumEntropyNames,s.attempts)
  });
  return {
    version:VERSION,seed,samplesPerSource,
    originalSourceCount:decks.length,
    totalSampledSetups:decks.length*samplesPerSource,
    uniformSourcePrior:true,
    baseline:'exact number of failed hands only',
    treatment:'all seven publicly shown card names in every failed hand',
    summary:summary(per),
    strata:{noFailedSeven:stratum(strata.noFailedSeven),
      hasFailedSeven:stratum(strata.hasFailedSeven)},
    perSource:per.map(row=>({
      rank:row.rank,attempts:row.attempts,
      failedSevenRate:row.withFailedSeven/row.attempts,
      meanFailedSevens:row.totalFailedSevens/row.attempts,
      meanTruePosteriorCount:row.sumTruePosteriorCount/row.attempts,
      meanTruePosteriorNames:row.sumTruePosteriorNames/row.attempts,
      mapAccuracyCount:row.mapCorrectCount/row.attempts,
      mapAccuracyNames:row.mapCorrectNames/row.attempts
    })),
    missing:[23,25,28],
    caveat:'Synthetic publicly revealed sevens only; fixed seed, non-native setup, known-source uniform prior. No actor decisions, game outcomes or competitive strength.',
    fullGames:0,competitiveQualifiedGames:0
  };
}

if(require.main===module){
  const manifest=require('../results/aichi-2026/full-decklists.json');
  process.stdout.write(JSON.stringify(assessPublicHistoryInformation(manifest),
    null,2)+'\n');
}

module.exports={VERSION,seededRandom,expandedSource,sampleSeven,
  samplePublicHistory,countOnlyPosterior,assessPublicHistoryInformation};
