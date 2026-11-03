'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {auditPrintedSixty}=require('../scripts/agent38-candidate-printing-audit.cjs');
const challenger=require('../results/aichi-2026/candidate-arven-shake-absol-v1.json');
const originals=require('../results/aichi-2026/full-decklists.json');

test('fixed 60 resolves every listed printing except source MEE15 energy set',()=>{
  const report=auditPrintedSixty(challenger);
  assert.equal(report.quantities,60);
  assert.equal(report.totalEntries,27);
  assert.equal(report.foundEntries,26);
  assert.equal(report.matchedCopies,52);
  assert.equal(report.unmatchedCopies,8);
  assert.equal(report.knownAceSpecCopies,1);
  assert.equal(report.noMoreThanFourFromNamesAndCategory,true);
  const unmatched=report.rows.filter(row=>
    row.state!=='exact-bundled-printing');
  assert.equal(unmatched.length,1);
  assert.equal(unmatched[0].printing.set,'MEE');
  assert.equal(String(unmatched[0].printing.number),'15');
  assert.equal(unmatched[0].name,'Darkness Energy');
  assert.equal(unmatched[0].count,8);
});

test('critical printed Arven/Boost Shake/Float Stone/Garbodor lines all match',()=>{
  const report=auditPrintedSixty(challenger);
  const identities=new Map([
    ['Arven','sv1-166'],
    ['Boost Shake','swsh7-142'],
    ['Float Stone','xy8-137'],
    ['Garbodor','xy9-57'],
    ['Trubbish','swsh8-168']
  ]);
  for(const [name,id] of identities){
    const row=report.rows.find(x=>x.name===name);
    assert.ok(row);
    assert.equal(row.state,'exact-bundled-printing');
    assert.equal(row.matchedIds[0].id,id);
    assert.equal(row.matchedIds[0].printedExpandedFlag,'Legal');
  }
});

test('original rank11 has the same unindexed Darkness Energy source printing',()=>{
  const rank11=originals.decks.find(deck=>deck.rank===11);
  const result=auditPrintedSixty(rank11);
  const unknown=result.rows.filter(row=>
    row.state!=='exact-bundled-printing');
  assert.equal(rank11.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(unknown.length,1);
  assert.equal(unknown[0].printing.set,'MEE');
  assert.equal(unknown[0].name,'Darkness Energy');
  assert.equal(unknown[0].count,8);
});

test('multiple printings of one card name count toward four-copy cap',()=>{
  const malformed=JSON.parse(JSON.stringify(challenger));
  const row=malformed.cards.find(x=>x.name==='Quick Ball');
  const clone=JSON.parse(JSON.stringify(row));
  row.count=3;
  clone.count=2;
  malformed.cards.push(clone);
  const other=malformed.cards.find(x=>x.name==='Marnie');
  other.count-=1;
  const out=auditPrintedSixty(malformed);
  assert.equal(out.quantities,60);
  assert.equal(out.noMoreThanFourFromNamesAndCategory,false);
});

test('impossible 59-card or zero-copy manifest fails closed',()=>{
  const malformed=JSON.parse(JSON.stringify(challenger));
  malformed.cards[0].count--;
  assert.throws(()=>auditPrintedSixty(malformed),/60/);
  malformed.cards[0].count++;
  malformed.cards[0].count=0;
  assert.throws(()=>auditPrintedSixty(malformed));
});
