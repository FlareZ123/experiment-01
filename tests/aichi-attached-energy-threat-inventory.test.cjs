'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {sourceThreatInventory,auditField,candidateEnergyBudget,run}=
  require('../scripts/aichi-attached-energy-threat-inventory.cjs');

test('copy counts do not treat VS Seeker or Lusamine as resolved Energy discards',()=>{
  const cards=[
    {category:'Trainer',name:'Plumeria',count:4},
    {category:'Trainer',name:'Team Flare Grunt',count:2},
    {category:'Trainer',name:'Enhanced Hammer',count:2},
    {category:'Trainer',name:'Faba',count:1},
    {category:'Trainer',name:'Crushing Hammer',count:4},
    {category:'Trainer',name:'VS Seeker',count:3},
    {category:'Trainer',name:'Lusamine',count:2},
    {category:'Energy',name:'Psychic Energy',count:42}
  ];
  const value=sourceThreatInventory({rank:6,archetype:'fixture',cards});
  assert.equal(value.directSupporterAttached,6);
  assert.equal(value.specialEnergyRemoval,3);
  assert.equal(value.probabilisticAttached,4);
  assert.equal(value.recursion['VS Seeker'],3);
  assert.equal(value.recursion.Lusamine,2);
  assert.equal(value.directSupporterAttached,6,'Reusers do not add actual removal copies');
});

test('rejects incomplete exact-source rosters',()=>{
  assert.throws(()=>sourceThreatInventory({
    rank:4,archetype:'broken',
    cards:[{category:'Trainer',name:'Plumeria',count:59}]
  }),/not a complete 60/);
  assert.throws(()=>auditField({}),/Expected published decks/);
});

test('source-frozen Aichi 29-field threat census and candidate budget',()=>{
  const value=run();
  assert.equal(value.publishedOpponents,29);
  assert.deepEqual(value.missingOpponents,[23,25,28]);
  assert.deepEqual(value.highDirectSupporterCopiesRanks,[3,6,24,29]);
  assert.equal(value.totalDirectSupporterCopies,29);
  assert.equal(value.totalCoinItemCopies,8);
  assert.equal(value.totalSpecialRemovalCopies,18);
  for(const [rank,special,coin] of [[3,3,0],[6,3,4],[24,3,0],[29,2,4]]){
    const row=value.rows.find(r=>r.rank===rank);
    assert.equal(row.directSupporterAttached,6,'source rank '+rank);
    assert.equal(row.specialEnergyRemoval,special);
    assert.equal(row.probabilisticAttached,coin);
    assert.equal(row.recursion['VS Seeker'],3);
    assert.equal(row.recursion.Lusamine,2);
  }
  assert.deepEqual(
    {basic:value.candidate.basicPsychic,special:value.candidate.telepathicPsychic,
      total:value.candidate.total,powerglass:value.candidate.powerglassCopies},
    {basic:3,special:3,total:6,powerglass:2});
  assert.equal(value.performanceQualified,false);
});

test('same singleton Special Energy threat cannot become generic Energy removal',()=>{
  const deck={rank:1,archetype:'fixture',cards:[
    {category:'Trainer',name:'Enhanced Hammer',count:4},
    {category:'Trainer',name:'Faba',count:1},
    {category:'Trainer',name:'VS Seeker',count:4},
    {category:'Energy',name:'Psychic Energy',count:51}
  ]};
  const row=sourceThreatInventory(deck);
  assert.equal(row.directSupporterAttached,0);
  assert.equal(row.specialEnergyRemoval,5);
  assert.equal(row.probabilisticAttached,0);
});
