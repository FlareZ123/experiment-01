'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {countHandMultisets,auditFieldHandDigestDomain}=
  require('../scripts/agent16-hand-multiset-digest-domain.cjs');
const field=require('../results/aichi-2026/full-decklists.json');

test('tiny deck exhaustive multiset categories and hand length',()=>{
  const cards=[{name:'A',count:2},{name:'B',count:1}];
  assert.equal(countHandMultisets(cards,2),2n); // A+A, A+B
  assert.equal(countHandMultisets(cards,1),2n);
  assert.equal(countHandMultisets(cards,0),1n);
  assert.equal(countHandMultisets(cards,4),0n);
});

test('identical names on distinct lines inflate the line-level upper bound',()=>{
  const cards=[{name:'A',count:1},{name:'A',count:1},{name:'B',count:1}];
  assert.equal(countHandMultisets(cards,2,'line'),3n);
  assert.equal(countHandMultisets(cards,2,'name'),2n);
});

test('actual 60-card source rank11 seven-card domain has only 2,018,562 multisets',()=>{
  const d=field.decks.find(x=>x.rank===11);
  assert.equal(d.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(countHandMultisets(d.cards,7,'line'),2018562n);
  assert.equal(countHandMultisets(d.cards,6,'line'),508978n);
});

test('rank16 name-collapse further reduces the inventory-line upper bound',()=>{
  const d=field.decks.find(x=>x.rank===16);
  assert.equal(countHandMultisets(d.cards,7,'line'),3869032n);
  assert.ok(countHandMultisets(d.cards,7,'name')<3869032n);
});

test('all currently authenticated original inventories have fewer than 2^25 seven-card name multisets',()=>{
  const summary=auditFieldHandDigestDomain(field,7);
  assert.equal(summary.authenticatedInventoryCount,29);
  assert.equal(summary.categoryLineDomainUpperBound,'21854508');
  assert.ok(summary.rows.every(row=>
    BigInt(row.categoryLineUpperBound)<(1n<<25n)));
  assert.ok(summary.rows.every(row=>
    BigInt(row.nameOnlyDomain)<=BigInt(row.categoryLineUpperBound)));
  assert.equal(summary.competitivelyQualifiedGames,0);
});
