'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {firstOwnerTurnSourceIncidence,VERSION}=
  require('../simulation/evaluation/agent4-first-owner-turn-field-incidence.cjs');

const manifest=JSON.parse(fs.readFileSync(
  path.resolve(__dirname,'../results/aichi-2026/full-decklists.json'),'utf8'));

test('exact source-only first-turn restrictions remain separated from missing opponents',()=>{
  const r=firstOwnerTurnSourceIncidence(manifest);
  assert.equal(r.version,VERSION);
  assert.equal(r.knownOriginalSourceSixties,29);
  assert.deepEqual(r.unknownSourceRanks,[23,25,28]);
  assert.equal(r.originalSourceRanksWithRestrictedTrainer,15);
  assert.equal(r.totalRestrictedTrainerCopies,43);
  assert.deepEqual(r.byPrinting.filter(x=>x.originalDeckCopies>0),[
    {printing:'Battle VIP Pass FST',nativeFullName:'Battle VIP Pass FST',
      sourceId:'swsh8-225',originalDeckCopies:42},
    {printing:'Wait and See Hammer LOT',nativeFullName:'Wait and See Hammer LOT',
      sourceId:'sm8-192',originalDeckCopies:1}
  ]);
  assert.equal(r.byPrinting.find(x=>x.printing==='Wait and See Turbo ASR')?.nativeFullName,'Wait and See Turbo ASR 158');
  assert.equal(r.byPrinting.find(x=>x.printing==='Call Bell SSP')?.nativeFullName,'Helper Bell SSP');
  assert.equal(r.gameWinRateEstimated,false);
  assert.equal(r.fieldCompletelyAuthenticated,false);
  assert.equal(r.independentPlayableOpportunities,0);
  assert.deepEqual(r.rows.map(x=>x.rank),[
    4,5,8,9,10,11,13,16,17,18,19,22,26,30,31
  ]);
  assert.match(r.sourceParsedSha256,/^[a-f0-9]{64}$/);
});

test('unseen exact source cards cannot silently be counted by mere similar words',()=>{
  const first=manifest.decks.find(d=>d.rank===5);
  const altered=structuredClone(first);
  altered.rank=32;
  altered.cards[0].name='Made Up Basic';
  const mock={decks:[altered]};
  const a=firstOwnerTurnSourceIncidence(mock);
  assert.equal(a.knownOriginalSourceSixties,1);
  assert.equal(a.unknownSourceRanks.length,31);
  assert.equal(a.totalRestrictedTrainerCopies,3);
  assert.equal(a.originalSourceRanksWithRestrictedTrainer,1);
  assert.equal(a.rows[0].rank,32);
});

test('source rank uniqueness and complete physical 60 are hard census gates',()=>{
  const a=manifest.decks.find(x=>x.rank===5);
  assert.throws(()=>firstOwnerTurnSourceIncidence({decks:[a,a]}),
    /Duplicate Aichi source rank/);
  const wrong=structuredClone(a);
  wrong.cards[0].count--;
  assert.throws(()=>firstOwnerTurnSourceIncidence({decks:[wrong]}),
    /Incomplete exact printed source sixty/);
});
