'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const {SOURCE_JP_ONLY,withVerifiedJapanesePromoPublicMetadata,
  JapaneseOnlyPromoReceipts}=require(
  '../simulation/twinleaf/planning/owner-japanese-only-promo-source-metadata.cjs');
const {targetMatch,loadBundledPublicPrintMetadata,
  withSourceDisplayAliases}=require(
  '../simulation/twinleaf/planning/owner-public-discard-target-necessary.cjs');
const {withVerifiedMEEBasicEnergyPrintings}=require(
  '../simulation/twinleaf/planning/owner-external-mee-basic-energy-metadata.cjs');

test('three English-unreleased source promos have independently indexed exact original numbers',()=>{
  assert.deepEqual(SOURCE_JP_ONLY.map(x=>[x.printing,x.sourceNumber]),[
    ['Palace Book SMP','NAN25'],
    ["Player's Ceremony SP",'127'],
    ['Palace Belt BWP','153']
  ]);
  for(const c of SOURCE_JP_ONLY){
    assert.ok(c.source.startsWith('https://limitlesstcg.com/cards/jp/'));
    assert.equal(c.officiallyEnglishReleased,false);
    assert.equal(c.expandedJapan,'listed-legal');
    assert.equal(c.expandedInternational,'listed-not-legal');
    assert.equal(c.nativeImplemented,null);
  }
});

test('supplemental public category index is immutable and source/format separated',()=>{
  const baseline=withVerifiedMEEBasicEnergyPrintings(
    withSourceDisplayAliases(loadBundledPublicPrintMetadata(
      path.join(__dirname,'../resources'))));
  for(const row of SOURCE_JP_ONLY)
    assert.equal(baseline.has(row.printing),false,row.printing);
  const updated=withVerifiedJapanesePromoPublicMetadata(baseline);
  assert.equal(updated.size,baseline.size+3);
  assert.equal(targetMatch(updated.get('Palace Book SMP'),'supporter'),false);
  assert.equal(targetMatch(updated.get("Player's Ceremony SP"),'supporter'),false);
  assert.equal(targetMatch(updated.get('Palace Belt BWP'),'supporter'),false);
  assert.equal(targetMatch(updated.get('Palace Book SMP'),
    'pokemon-or-basic-energy'),false);
  assert.equal(updated.get("Player's Ceremony SP").variants[0]
    .provenance,'japanese-source-unofficial-translation');
  assert.throws(()=>withVerifiedJapanesePromoPublicMetadata(new Map([
    ['Palace Book SMP',{variants:[{supertype:'Pokémon',subtypes:['Basic']}]}]
  ])));
});

test('authenticated original source contains exactly 14 Japanese-only copies in five ranks',()=>{
  const source=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const rows=source.decks.flatMap(deck=>
    JapaneseOnlyPromoReceipts(deck.cards).map(item=>({...item,rank:deck.rank})));
  assert.equal(rows.reduce((sum,r)=>sum+r.count,0),14);
  assert.deepEqual([...new Set(rows.map(r=>r.rank))].sort((a,b)=>a-b),
    [3,6,7,24,29]);
  assert.deepEqual([
    ...new Set(rows.map(r=>r.printing))
  ].sort(),[
    'Palace Belt BWP','Palace Book SMP',"Player's Ceremony SP"
  ].sort());
  assert.equal(rows.every(r=>r.jpExpanded==='listed-legal'),true);
  assert.equal(rows.every(r=>r.intlExpanded==='listed-not-legal'),true);
});

test('missing exact source collector number fails closed',()=>{
  assert.throws(()=>JapaneseOnlyPromoReceipts([{
    category:'Trainer',name:'Palace Book',
    printing:{set:'SMP',number:'NAN00'},count:1
  }]));
});
