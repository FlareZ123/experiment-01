'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const manifest=require('../results/aichi-2026/full-decklists.json');
const {seededRandom,expandedSource}=require(
  '../scripts/agent26-public-mulligan-information-power.cjs');
const {randomActiveNameProbabilities,conditionOnRandomActive,
  samplePublicOpening,assessWithVisibleActive}=require(
  '../scripts/agent26-public-mulligan-active-conditioned.cjs');
const close=(x,y)=>assert.ok(Math.abs(x-y)<1e-12,
  String(x)+' != '+String(y));
const decks=manifest.decks.slice().sort((a,b)=>a.rank-b.rank);
const byRank=x=>decks.find(deck=>deck.rank===x);

test('known printed Basic fractions are exact under neutral Active choice',()=>{
  const thorns=randomActiveNameProbabilities(byRank(6));
  assert.equal(thorns.size,1);
  close(thorns.get('Iron Thorns ex'),1);
  const champ=randomActiveNameProbabilities(byRank(1));
  close(champ.get('Shadow Rider Calyrex V'),3/14);
  close([...champ.values()].reduce((n,x)=>n+x,0),1);
});

test('face-up Iron Thorns Active removes every incompatible published 60',()=>{
  const models=decks.map(randomActiveNameProbabilities);
  const p=conditionOnRandomActive(Array(29).fill(1/29),models,
    'Iron Thorns ex');
  assert.deepEqual(p.map((x,i)=>x>0?decks[i].rank:null)
    .filter(x=>x!==null),[6,24,29]);
  close(p.reduce((n,x)=>n+x,0),1);
  for(const i of [6,24,29])
    close(p[decks.findIndex(x=>x.rank===i)],1/3);
  assert.throws(()=>conditionOnRandomActive(Array(29).fill(1/29),
    models,'unobserved Starter Pokémon'),/Active impossible/);
});

test('sample reveals only visible Active and previously failed seven names',()=>{
  const cards=expandedSource(byRank(6));
  const one=samplePublicOpening(cards,seededRandom(20261030));
  const two=samplePublicOpening(cards,seededRandom(20261030));
  assert.deepEqual(one,two);
  assert.equal(one.activeName,'Iron Thorns ex');
  assert.ok(one.history.every(h=>h.length===7&&
    h.every(n=>n!=='Iron Thorns ex')));
});

test('balanced source study preserves zero-failure no-additional-history equality',()=>{
  const a=assessWithVisibleActive(manifest,{samplesPerSource:4,seed:20261030});
  const b=assessWithVisibleActive(manifest,{samplesPerSource:4,seed:20261030});
  assert.deepEqual(a,b);
  assert.equal(a.sampledSetups,116);
  assert.equal(a.summary.attempts,116);
  assert.equal(a.perSource.length,29);
  assert.equal(a.strata.noFailedSeven.attempts+
    a.strata.hasFailedSeven.attempts,116);
  close(a.strata.noFailedSeven.meanTruePosteriorNamesActive,
    a.strata.noFailedSeven.meanTruePosteriorCountActive);
  close(a.strata.noFailedSeven.meanEntropyNamesActiveBits,
    a.strata.noFailedSeven.meanEntropyCountActiveBits);
  assert.equal(a.competitiveQualifiedGames,0);
});
