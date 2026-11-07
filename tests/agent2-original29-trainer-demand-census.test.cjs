'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {census}=require(
  '../simulation/evaluation/agent2-original29-trainer-demand-census.cjs');

test('exact original 29 source inventory remains immutable',()=>{
  const r=census();
  assert.equal(r.originalSixties,29);
  assert.deepEqual(r.missingFullListRanks,[23,25,28]);
  assert.equal(r.sourceDeckRanks.length,29);
  assert.equal(r.sourceDeckRanks.includes(23),false);
  assert.equal(r.sourceDeckRanks.includes(25),false);
  assert.equal(r.sourceDeckRanks.includes(28),false);
  assert.equal(r.qualifiedGames,0);
});

test('high-copy Trainers counted by original deck names, not inferred play',()=>{
  const r=census();
  const entry=name=>r.rankedTrainerCounts.find(row=>row.name===name);
  assert.deepEqual([entry('Quick Ball').deckCount,entry('Quick Ball').copyCount],
    [21,72]);
  assert.deepEqual([entry('VS Seeker').deckCount,entry('VS Seeker').copyCount],
    [23,59]);
  assert.deepEqual([entry('Battle VIP Pass').deckCount,
    entry('Battle VIP Pass').copyCount],[15,42]);
  assert.deepEqual([entry("Trainers' Mail").deckCount,
    entry("Trainers' Mail").copyCount],[10,29]);
  assert.deepEqual([entry('Hisuian Heavy Ball').deckCount,
    entry('Hisuian Heavy Ball').copyCount],[20,25]);
  assert.deepEqual([entry('Mysterious Treasure').deckCount,
    entry('Mysterious Treasure').copyCount],[10,37]);
  assert.equal(r.trainerNameCount,125);
});

test('overlapping reach is union of distinct originals, never copy sum',()=>{
  const r=census();
  assert.equal(r.groups.topTwoSearch.deckCount,26);
  assert.equal(r.groups.topThreeSearch.deckCount,27);
  assert.equal(r.groups.discardSupporterOrMail.deckCount,25);
  assert.equal(r.groups.psychicOrGenericSearch.deckCount,17);
  assert.equal(r.groups.topTwoSearch.aggregatedCopies,131);
  assert.equal(r.qualification.actorOnlyNativePromptCoverageMeasured,false);
  assert.equal(r.qualification.futurePolicyWinRateInferred,false);
});

test('tampered field coverage or duplicated original 60 fails closed',()=>{
  const original=require('../results/aichi-2026/full-decklists.json');
  const changed=structuredClone(original);
  changed.decks.pop();
  assert.throws(()=>census(changed),/source coverage changed/);
  const duplicate=structuredClone(original);
  duplicate.decks[0].cards.push({...duplicate.decks[0].cards[0]});
  assert.throws(()=>census(duplicate),/60/);
});
