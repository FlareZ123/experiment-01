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

test('Prism Star source glyph variants resolve only exact printed Prism Star Pokémon',()=>{
  for(const [rank,name,id] of [
    [4,'Ditto ♢','sm8-154'],[8,'Tapu Koko ♢','sm9-51']
  ]){
    const original=originals.decks.find(deck=>deck.rank===rank);
    const result=auditPrintedSixty(original);
    const prism=result.rows.find(row=>row.name===name);
    assert.equal(prism.state,'exact-bundled-printing');
    assert.equal(prism.matchedIds.length,1);
    assert.equal(prism.matchedIds[0].id,id);
    assert.ok(prism.matchedIds[0].subtypes.includes('Prism Star'));
    assert.ok(prism.matchedIds[0].subtypes.includes('Basic'));
    assert.equal(prism.matchedIds[0].printedExpandedFlag,'Legal');

    const spoof=JSON.parse(JSON.stringify(original));
    spoof.cards.find(row=>row.name===name).name=name.replace(' ♢',' ♡');
    const rejected=auditPrintedSixty(spoof).rows
      .find(row=>row.name.endsWith(' ♡'));
    assert.equal(rejected.state,'printing-not-matched-in-existing-set-corpus');
    assert.equal(rejected.matchedIds.length,0);

    const falseStage=JSON.parse(JSON.stringify(original));
    falseStage.cards.find(row=>row.name===name).printing.number='999';
    const missing=auditPrintedSixty(falseStage).rows
      .find(row=>row.name===name);
    assert.equal(missing.state,'printing-not-matched-in-existing-set-corpus');
  }
});

test('original Team Flare Gear labels resolve only three exact source PHF printings',()=>{
  const examples=[
    [1,'Battle Compressor','xy4-92'],
    [7,'Robo Substitute','xy4-102'],
    [7,'Target Whistle','xy4-106']
  ];
  for(const [rank,name,id] of examples){
    const orig=originals.decks.find(row=>row.rank===rank);
    const source=auditPrintedSixty(orig).rows.find(row=>row.name===name);
    assert.equal(source.state,'exact-bundled-printing',name);
    assert.equal(source.matchedIds.length,1,name);
    assert.equal(source.matchedIds[0].id,id,name);
    assert.ok(source.matchedIds[0].subtypes.includes('Item'));
    const fake=JSON.parse(JSON.stringify(orig));
    fake.cards.find(row=>row.name===name).printing.number='999';
    assert.equal(auditPrintedSixty(fake).rows.find(row=>row.name===name)
      .state,'printing-not-matched-in-existing-set-corpus');
  }
});

test('source Prism Stadium Unicode glyphs need exact matching printed Prism subtype',()=>{
  const specimens=[
    [6,'Thunder Mountain ♢','sm8-191'],
    [6,'Wondrous Labyrinth ♢','sm9-158']
  ];
  for(const [rank,name,id] of specimens){
    const orig=originals.decks.find(row=>row.rank===rank);
    const card=auditPrintedSixty(orig).rows.find(row=>row.name===name);
    assert.equal(card.state,'exact-bundled-printing',name);
    assert.equal(card.matchedIds.length,1,name);
    assert.equal(card.matchedIds[0].id,id,name);
    assert.ok(card.matchedIds[0].subtypes.includes('Prism Star'));
    assert.ok(card.matchedIds[0].subtypes.includes('Stadium'));
    const forged=JSON.parse(JSON.stringify(orig));
    forged.cards.find(row=>row.name===name).name=name.replace(' ♢',' ♡');
    assert.equal(auditPrintedSixty(forged).rows
      .find(row=>row.name.endsWith(' ♡')).state,
      'printing-not-matched-in-existing-set-corpus');
  }
});

test('original BW promo Tropical Beach gets exact local promo, unknown Palace Belt stays unresolved',()=>{
  const orig=originals.decks.find(row=>row.rank===3);
  const beach=auditPrintedSixty(orig).rows.find(row=>row.name==='Tropical Beach');
  assert.equal(beach.state,'exact-bundled-printing');
  assert.equal(beach.matchedIds.length,1);
  assert.equal(beach.matchedIds[0].id,'bwp-BW50');
  assert.ok(beach.matchedIds[0].subtypes.includes('Stadium'));
  const fake=JSON.parse(JSON.stringify(orig));
  fake.cards.find(row=>row.name==='Tropical Beach').printing.number='51';
  assert.equal(auditPrintedSixty(fake).rows
    .find(row=>row.name==='Tropical Beach').state,
    'printing-not-matched-in-existing-set-corpus');
  const thorn=originals.decks.find(row=>row.rank===6);
  const palace=auditPrintedSixty(thorn).rows.find(row=>row.name==='Palace Belt');
  assert.equal(palace.state,'printing-not-matched-in-existing-set-corpus');
});

test('source UPR Unit Energy abbreviation resolves exact local Energy card',()=>{
  const orig=originals.decks.find(row=>row.rank===4);
  const match=auditPrintedSixty(orig).rows.find(row=>row.name==='Unit Energy LPM');
  assert.equal(match.state,'exact-bundled-printing');
  assert.equal(match.matchedIds.length,1);
  assert.equal(match.matchedIds[0].id,'sm5-138');
  assert.ok(match.matchedIds[0].subtypes.includes('Special'));
  const fake=JSON.parse(JSON.stringify(orig));
  fake.cards.find(row=>row.name==='Unit Energy LPM').name='Unit Energy LPP';
  assert.equal(auditPrintedSixty(fake).rows
    .find(row=>row.name==='Unit Energy LPP').state,
    'printing-not-matched-in-existing-set-corpus');
});
