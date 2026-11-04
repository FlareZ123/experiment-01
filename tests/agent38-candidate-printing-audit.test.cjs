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

test('both Basic Energy naming conventions preserve unlimited copy exception',()=>{
  const alternate=JSON.parse(JSON.stringify(challenger));
  alternate.cards.find(x=>x.category==='Energy').name='Basic Darkness Energy';
  const report=auditPrintedSixty(alternate);
  assert.equal(report.quantities,60);
  assert.equal(report.noMoreThanFourFromNamesAndCategory,true);
  // Source MEE15 is absent from bundled source even under the normalized
  // Basic prefix; this does not convert it into a different printed set.
  assert.equal(report.unmatchedCopies,8);
});

test('impossible 59-card or zero-copy manifest fails closed',()=>{
  const malformed=JSON.parse(JSON.stringify(challenger));
  malformed.cards[0].count--;
  assert.throws(()=>auditPrintedSixty(malformed),/60/);
  malformed.cards[0].count++;
  malformed.cards[0].count=0;
  assert.throws(()=>auditPrintedSixty(malformed));
});

test('unindexed SMP promo uses only exact existing bundled card identity',()=>{
  const rank1=originals.decks.find(deck=>deck.rank===1);
  const report=auditPrintedSixty(rank1);
  const promo=report.rows.find(row=>row.name==='Trevenant & Dusknoir-GX');
  assert.equal(promo.state,'exact-bundled-printing');
  assert.equal(promo.matchedIds.length,1);
  assert.equal(promo.matchedIds[0].id,'smp-SM217');
  assert.ok(promo.matchedIds[0].subtypes.includes('Basic'));
  assert.equal(promo.matchedIds[0].printedExpandedFlag,'Legal');

  const fake=JSON.parse(JSON.stringify(rank1));
  fake.cards.find(row=>row.name==='Trevenant & Dusknoir-GX')
    .printing.number='218';
  const rejected=auditPrintedSixty(fake).rows
    .find(row=>row.name==='Trevenant & Dusknoir-GX');
  assert.equal(rejected.state,'printing-not-matched-in-existing-set-corpus');
  assert.equal(rejected.matchedIds.length,0);
});

test('unindexed bundled XY promos match exact Basic and Supporter identities',()=>{
  const rank2=originals.decks.find(deck=>deck.rank===2);
  const rank3=originals.decks.find(deck=>deck.rank===3);
  const a=auditPrintedSixty(rank2).rows;
  const b=auditPrintedSixty(rank3).rows;
  for(const [rows,name,id,subtype] of [
    [a,'Jirachi','xyp-XY67','Basic'],
    [a,'Karen','xyp-XY177','Supporter'],
    [b,'Regirock','xyp-XY49','Basic']
  ]){
    const match=rows.find(row=>row.name===name);
    assert.equal(match.state,'exact-bundled-printing',id);
    assert.equal(match.matchedIds.length,1,id);
    assert.equal(match.matchedIds[0].id,id);
    assert.ok(match.matchedIds[0].subtypes.includes(subtype),id);
    assert.equal(match.matchedIds[0].printedExpandedFlag,'Legal',id);
  }

  const forged=JSON.parse(JSON.stringify(rank3));
  forged.cards.find(row=>row.name==='Regirock').printing.number='999';
  const unknown=auditPrintedSixty(forged).rows
    .find(row=>row.name==='Regirock');
  assert.equal(unknown.state,'printing-not-matched-in-existing-set-corpus');
  assert.equal(unknown.matchedIds.length,0);
});
