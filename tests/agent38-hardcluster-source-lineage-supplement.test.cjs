'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const original=require('../results/aichi-2026/full-decklists.json');
const admission=require('../results/aichi-2026/original-printed60-admission-v1.json');
const supplement=require(
  '../results/aichi-2026/agent38-hardcluster-source-lineage-supplement-20261102.json');
const root=path.resolve(__dirname,'..');

test('rank provenance is original published sixty, not inferred alternative',()=>{
  assert.equal(supplement.fieldAuthenticatedPrinted60,29);
  assert.equal(supplement.fieldTotalRanks,32);
  assert.deepEqual(supplement.missingOriginalRanks,[23,25,28]);
  assert.deepEqual(supplement.rows.map(r=>r.rank),[8,11,16,22]);
  assert.equal(supplement.originalSourceDataset,
    'results/aichi-2026/full-decklists.json');
  for(const r of supplement.rows){
    const src=original.decks.find(x=>x.rank===r.rank);
    const pinned=admission.rows.find(x=>x.rank===r.rank);
    assert.ok(src&&pinned);
    assert.equal(r.player,src.player);
    assert.equal(src.cards.reduce((n,c)=>n+c.count,0),60);
    assert.equal(r.printed60Sha256,pinned.printed60Sha256);
    assert.match(r.printed60Sha256,/^[a-f0-9]{64}$/);
    assert.equal(r.competitiveQualifiedGames,0);
  }
});

test('extra original source cohorts retain distinct physical and paired units',()=>{
  const rank=new Map(supplement.rows.map(x=>[x.rank,x]));
  assert.equal(rank.get(8).sourcePhysicalDeals,128);
  assert.equal(rank.get(8).nativeGameAttempts,256);
  assert.equal(rank.get(8).comparableIndependentDeals,128);
  assert.equal(rank.get(8).ownerVisibleOpportunity.count,3);
  assert.equal(rank.get(8).paidCharacteristicEffect.completedGarbodor,1);
  assert.equal(rank.get(8).paidCharacteristicEffect.ownerK1Unavailable,2);
  assert.equal(rank.get(11).nativeGameAttempts,256);
  assert.equal(rank.get(11).pairedSourceSeedFrameSize,128);
  assert.equal(rank.get(11).comparableIndependentDeals,null);
  assert.equal(rank.get(11).ownerVisibleOpportunity.count,21);
  assert.equal(rank.get(11).paidCharacteristicEffect.completedGarbodor,20);
  assert.equal(rank.get(11).paidCharacteristicEffect.ownerK1Unavailable,1);
  assert.equal(rank.get(16).nativeGameAttempts,2);
  assert.equal(rank.get(22).nativeGameAttempts,2);
  assert.equal(rank.get(22).ownerVisibleOpportunity.status,'UNVERIFIED');
});

test('no developmental source witness is promoted to whole-game admission',()=>{
  assert.equal(supplement.competitivelyQualifiedGames,0);
  assert.equal(supplement.fixedChampionDeckSelected,false);
  const statuses=new Set(supplement.statuses);
  for(const row of supplement.rows){
    assert.ok(row.firstMissingTransition.length>40);
    assert.ok(row.nativeGameAttempts>0);
    for(const key of ['ownerVisibleOpportunity','naturalSelectedRoot',
      'paidCharacteristicEffect','opposingResponse']){
      const section=row[key];
      assert.ok(statuses.has(section.status));
      if(typeof section.count==='number')assert.ok(section.count>=0);
      if(typeof section.denominator==='number'&&
        typeof section.count==='number')
        assert.ok(section.count<=section.denominator);
    }
    assert.notEqual(row.opposingResponse.status,'VERIFIED');
    for(const file of [row.sourceReport,row.registration,
      row.sourceProvenanceReport].filter(Boolean))
      assert.ok(fs.existsSync(path.join(root,file)),file);
  }
  assert.ok(supplement.rows.every(r=>r.competitiveQualifiedGames===0));
});
