'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const manifest=require('../results/aichi-2026/full-decklists.json');
const {seededRandom,expandedSource,sampleSeven,samplePublicHistory,
  countOnlyPosterior,assessPublicHistoryInformation}=
  require('../scripts/agent26-public-mulligan-information-power.cjs');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,
  String(a)+' != '+String(b));
const decks=manifest.decks.slice().sort((a,b)=>a.rank-b.rank);

test('repeated seeded public seven sampler preserves original 60 and Basic tags',()=>{
  const rank6=decks.find(x=>x.rank===6);
  const cards=expandedSource(rank6);
  assert.equal(cards.length,60);
  assert.equal(cards.filter(x=>x.basic).length,4);
  const a=sampleSeven(cards,seededRandom(6));
  const b=sampleSeven(cards,seededRandom(6));
  assert.deepEqual(a,b);
  assert.equal(a.length,7);
  assert.ok(a.every(x=>cards.some(c=>c.name===x.name)));
});

test('actual synthetic invalid hand identity history contains no Basic',()=>{
  const cards=expandedSource(decks.find(x=>x.rank===6));
  const history=samplePublicHistory(cards,seededRandom(20261030));
  assert.ok(Array.isArray(history));
  assert.ok(history.every(hand=>hand.length===7));
  const knownBasics=new Set(cards.filter(x=>x.basic).map(x=>x.name));
  assert.ok(history.flat().every(name=>!knownBasics.has(name)));
});

test('baseline count-only distribution uses exact source geometric openings',()=>{
  const p=countOnlyPosterior(decks,0);
  near(p.reduce((n,x)=>n+x,0),1);
  const rank6Index=decks.findIndex(x=>x.rank===6);
  const noMulliganWeight=1-0.6005003742553344;
  const total=decks.reduce((n,deck)=>n+(
    1-require('../scripts/aichi-opening-basics.cjs')
      .openingProbabilities(require('../scripts/aichi-field-mulligan-census.cjs')
        .countBasics(deck)).initialMulliganProbability),0);
  near(p[rank6Index],noMulliganWeight/total);
});

test('stratified source study retains every synthetic attempt and seed',()=>{
  const options={samplesPerSource:4,seed:20261030};
  const x=assessPublicHistoryInformation(manifest,options);
  const y=assessPublicHistoryInformation(manifest,options);
  assert.deepEqual(x,y);
  assert.equal(x.totalSampledSetups,116);
  assert.equal(x.summary.attempts,116);
  assert.equal(x.perSource.length,29);
  assert.equal(x.strata.noFailedSeven.attempts+
    x.strata.hasFailedSeven.attempts,116);
  for(const row of x.perSource){
    assert.equal(row.attempts,4);
    assert.ok(row.failedSevenRate>=0&&row.failedSevenRate<=1);
    assert.ok(row.meanTruePosteriorNames>=0&&
      row.meanTruePosteriorNames<=1);
  }
  near(x.strata.noFailedSeven.meanEntropyNamesBits,
    x.strata.noFailedSeven.meanEntropyCountBits);
  near(x.strata.noFailedSeven.meanTruePosteriorNames,
    x.strata.noFailedSeven.meanTruePosteriorCount);
  assert.equal(x.fullGames,0);
  assert.equal(x.competitiveQualifiedGames,0);
});
