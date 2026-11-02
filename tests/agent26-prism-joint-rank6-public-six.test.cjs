'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {strictRank6PublicReceipts}=
  require('../scripts/agent26-prism-joint-rank6-public-six.cjs');
const manifest=require('../results/aichi-2026/full-decklists.json');
const receipts=require('../results/statistics/agent26-real-native-source6-public-mulligan-six.json');

test('six original public receipts give strict, repeatable singleton-aware intervals',()=>{
  const result=strictRank6PublicReceipts(manifest,receipts);
  assert.equal(result.rows.length,6);
  assert.equal(result.newGames,0);
  assert.equal(result.competitiveQualifiedGames,0);
  for(const row of result.rows){
    assert.ok(row.strictRank6Lower>=row.oldRank6Lower-1e-13);
    assert.ok(row.strictMissingSingleSourceUpper<=row.oldMissingSingleSourceUpper);
    assert.equal(row.competitiveGameQualified,false);
  }
  const first=result.rows[0];
  const fifth=result.rows[4];
  assert.deepEqual(first.prismNames,['Wondrous Labyrinth ♢']);
  assert.deepEqual(fifth.prismNames,['Thunder Mountain ♢']);
  assert.ok(Math.abs(first.oldRank6Lower-1/257)<1e-12);
  assert.ok(Math.abs(first.strictRank6Lower-1/65)<1e-12);
  assert.ok(Math.abs(fifth.oldRank6Lower-1/1537)<1e-12);
  assert.ok(Math.abs(fifth.strictRank6Lower-1/385)<1e-12);
  for(const i of [1,2,3,5]){
    assert.ok(Math.abs(result.rows[i].strictRank6Lower-
      result.rows[i].oldRank6Lower)<1e-12);
  }
});

test('altered forced-Thorns printed list invalidates the witness',()=>{
  const mutated=structuredClone(manifest);
  const rank6=mutated.decks.find(x=>x.rank===6);
  rank6.cards.find(x=>x.name==='Iron Thorns ex').count=3;
  assert.throws(()=>strictRank6PublicReceipts(mutated,receipts));
});
