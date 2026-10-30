'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const field=require('../results/aichi-2026/full-decklists.json');
const {PRINTINGS,EVOLUTIONS,countBasics,summarizeFieldMulligans}=
  require('../scripts/aichi-field-mulligan-census.cjs');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,
  String(a)+' differs from '+String(b));

test('all 29 source lists have known printed stages and 60 physical cards',()=>{
  assert.equal(PRINTINGS.size,102);
  assert.equal(EVOLUTIONS.size,26);
  assert.equal(field.decks.length,29);
  for(const deck of field.decks){
    const b=countBasics(deck);
    assert.ok(b>=4&&b<=16,deck.rank+': '+b);
  }
});

test('three published Iron Thorns-only sources are uniquely four-Basic',()=>{
  const result=summarizeFieldMulligans(field);
  assert.deepEqual(result.summary.fourBasicRanks,[6,24,29]);
  assert.equal(result.championBasics,14);
  for(const rank of [6,24,29]){
    const row=result.rows.find(x=>x.rank===rank);
    assert.equal(row.basics,4);
    close(row.championMayDraw,0.5642343175423022);
    close(row.sourceMayDraw,0.060393062632150364);
    close(row.championExpectedOffer,1.4123525560019536);
  }
  for(const row of result.rows){
    if(![6,24,29].includes(row.rank))assert.ok(row.basics>=10);
  }
});

test('the 28 known nonmirror original opponents have deterministic field average',()=>{
  const result=summarizeFieldMulligans(field);
  assert.equal(result.rows.length,28);
  assert.equal(result.summary.opponentsMissing,3);
  close(result.summary.championMayDrawMean,0.19023783742849779);
  close(result.summary.sourceMayDrawMean,0.11222548945458474);
  close(result.summary.championExpectedOfferMean,0.3098290855280589);
});

test('published evolution multiplicities are removed from Basic counts',()=>{
  const byRank=new Map(summarizeFieldMulligans(field).rows.map(x=>[x.rank,x.basics]));
  assert.equal(byRank.get(2),14);
  assert.equal(byRank.get(4),13);
  assert.equal(byRank.get(10),15);
  assert.equal(byRank.get(31),15);
  assert.equal(byRank.get(32),13);
});

test('no unknown Basic or Evolution card is silently inferred',()=>{
  const altered=structuredClone(field.decks[0]);
  altered.cards.find(x=>x.category==='Pokémon').printing.number='999999';
  assert.throws(()=>countBasics(altered),/Unclassified printed Pokémon/);
});

test('a malformed 59-card original source is rejected',()=>{
  const altered=structuredClone(field.decks[0]);
  altered.cards[0].count--;
  assert.throws(()=>countBasics(altered),/total 60/);
});

test('missing-source rank claims remain explicitly unresolved',()=>{
  const altered=structuredClone(field);
  altered.missing_full_lists=[...field.missing_full_lists.slice(1)];
  assert.throws(()=>summarizeFieldMulligans(altered));
});
