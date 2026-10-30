'use strict';
const assert=require('node:assert/strict');
const {EVOLUTIONS,countBasics}=require('./aichi-field-mulligan-census.cjs');
const {openingProbabilities}=require('./aichi-opening-basics.cjs');
const {seededRandom,expandedSource,sampleSeven}=
  require('./agent26-public-mulligan-information-power.cjs');
const {publicFailedHandHistoryPosterior}=
  require('./agent26-public-mulligan-fullhistory.cjs');
const VERSION='agent26-public-mulligan-active-conditioned-v1';

/**
 * If Active is the first Basic in a uniformly random Basic-valid seven,
 * each physical Basic has chance 1/b to be that Active, by symmetry.
 * This is a neutral *model*, not a claim about skilled Active choice.
 * @param {object} deck Exact hypothetical source 60.
 * @returns {Map<string,number>}
 */
function randomActiveNameProbabilities(deck){
  const b=countBasics(deck),counts=new Map();
  for(const card of deck.cards){
    if(card.category!=='Pokémon'||EVOLUTIONS.has(
      card.printing.set+'-'+card.printing.number))continue;
    counts.set(card.name,(counts.get(card.name)??0)+card.count);
  }
  assert.equal([...counts.values()].reduce((n,x)=>n+x,0),b);
  return new Map([...counts].map(([name,n])=>[name,n/b]));
}

/**
 * Restrict a source posterior using only the face-up Active name under
 * the declared neutral random-first-Basic selection policy.
 * @param {number[]} prior 
 * @param {Map<string,number>[]} activeModels 
 * @param {string} activeName
 * @returns {number[]}
 */
function conditionOnRandomActive(prior,activeModels,activeName){
  assert.ok(Array.isArray(prior)&&prior.length===activeModels.length);
  assert.ok(typeof activeName==='string'&&activeName.length>0);
  const a=prior.map((p,i)=>p*(activeModels[i].get(activeName)??0));
  const total=a.reduce((n,v)=>n+v,0);
  assert.ok(total>0,'Active impossible under recovered source hypotheses');
  return a.map(x=>x/total);
}

/**
 * Generate precisely the opponent-facing information: publicly revealed
 * invalid sevens and face-up Active. Discard all private valid hand cards.
 * @param {object[]} cards
 * @param {()=>number} rng
 * @returns {{history:string[][],activeName:string}}
 */
function samplePublicOpening(cards,rng){
  const history=[];
  for(let attempt=0;attempt<1000;attempt++){
    const seven=sampleSeven(cards,rng),first=seven.find(x=>x.basic);
    if(first)return {history,activeName:first.name};
    history.push(seven.map(x=>x.name));
  }
  throw Error('Too many synthetic failed sevens');
}

const entropy=p=>-p.reduce((n,x)=>n+(x>0?x*Math.log2(x):0),0);

/**
 * Compare exact posterior sources under same observed failed-hand count
 * and neutral face-up Active, with and without all publicly shown names.
 * @param {object} manifest
 * @param {{samplesPerSource?:number,seed?:number}} [options]
 * @returns {object}
 */
function assessWithVisibleActive(manifest,options={}){
  const samplesPerSource=options.samplesPerSource??256,seed=options.seed??20261030;
  assert.ok(Number.isSafeInteger(samplesPerSource)&&
    samplesPerSource>=1&&samplesPerSource<=2048);
  assert.ok(Number.isSafeInteger(seed)&&seed>0&&seed<=0xffffffff);
  assert.equal(manifest.decks.length,29);
  const decks=manifest.decks.slice().sort((a,b)=>a.rank-b.rank);
  const active=decks.map(randomActiveNameProbabilities);
  const q=decks.map(deck=>openingProbabilities(countBasics(deck))
    .initialMulliganProbability);
  const blank=()=>({n:0,trueCount:0,trueNames:0,entropyCount:0,
    entropyNames:0,mapCount:0,mapNames:0});
  const buckets={noFailedSeven:blank(),hasFailedSeven:blank()};
  const records=decks.map(d=>({rank:d.rank,attempts:0,mulligans:0,
    trueCount:0,trueNames:0}));
  for(let i=0;i<decks.length;i++){
    const cards=expandedSource(decks[i]);
    for(let trial=0;trial<samplesPerSource;trial++){
      const rng=seededRandom((seed^Math.imul(decks[i].rank,0x9e3779b1)^
        Math.imul(trial+1,0x85ebca6b))>>>0);
      const {history,activeName}=samplePublicOpening(cards,rng);
      const baseline=q.map(x=>x**history.length*(1-x));
      const baselineTotal=baseline.reduce((n,x)=>n+x,0);
      const count=conditionOnRandomActive(
        baseline.map(x=>x/baselineTotal),active,activeName);
      const full=publicFailedHandHistoryPosterior(manifest,history);
      const names=conditionOnRandomActive(
        full.models.map(x=>x.posterior),active,activeName);
      const s=history.length?buckets.hasFailedSeven:buckets.noFailedSeven;
      s.n++;
      s.trueCount+=count[i];s.trueNames+=names[i];
      s.entropyCount+=entropy(count);s.entropyNames+=entropy(names);
      s.mapCount+=Number(count.indexOf(Math.max(...count))===i);
      s.mapNames+=Number(names.indexOf(Math.max(...names))===i);
      const row=records[i];
      row.attempts++;row.mulligans+=Number(history.length>0);
      row.trueCount+=count[i];row.trueNames+=names[i];
    }
  }
  const aggregate=blank();
  for(const s of Object.values(buckets))
    for(const [k,v] of Object.entries(s))aggregate[k]+=v;
  const rates=s=>({
    attempts:s.n,
    meanTruePosteriorCountActive:s.trueCount/s.n,
    meanTruePosteriorNamesActive:s.trueNames/s.n,
    meanEntropyCountActiveBits:s.entropyCount/s.n,
    meanEntropyNamesActiveBits:s.entropyNames/s.n,
    mapAccuracyCountActive:s.mapCount/s.n,
    mapAccuracyNamesActive:s.mapNames/s.n
  });
  return {version:VERSION,seed,samplesPerSource,knownSources:29,
    sampledSetups:29*samplesPerSource,
    activeSelection:'first Basic in random valid seven, explicitly not skilled policy',
    baseline:'observed failed-hand count plus face-up Active',
    treatment:'all publicly shown failed-hand names plus face-up Active',
    summary:rates(aggregate),
    strata:Object.fromEntries(Object.entries(buckets).map(([k,s])=>[k,rates(s)])),
    perSource:records.map(row=>({rank:row.rank,attempts:row.attempts,
      mulliganFraction:row.mulligans/row.attempts,
      meanTrueCountActive:row.trueCount/row.attempts,
      meanTrueNamesActive:row.trueNames/row.attempts})),
    omittedRanks:[23,25,28],fullGames:0,competitiveQualifiedGames:0,
    caveat:'The real player may intentionally choose another Active or Bench. This is rank recognition under an explicit toy selection policy and uniform 29-source prior, not an actual game-win measurement.'
  };
}
if(require.main===module){
  const manifest=require('../results/aichi-2026/full-decklists.json');
  process.stdout.write(JSON.stringify(assessWithVisibleActive(manifest),null,2)+'\n');
}
module.exports={VERSION,randomActiveNameProbabilities,
  conditionOnRandomActive,samplePublicOpening,assessWithVisibleActive};
