'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const roster=require('../results/aichi-2026/full-decklists.json').decks;
const {printedSixtyKey,conditionalMirrorCeiling}=
  require('../simulation/evaluation/agent45-symmetric-mirror-uniform-ceiling.cjs');

test('the original rank1 champion reference is an exact known field mirror',()=>{
  const champion=roster.find(d=>d.rank===1);
  assert.ok(champion);
  const result=conditionalMirrorCeiling(champion.cards,roster,32);
  assert.equal(roster.length,29);
  assert.deepEqual(result.exactMatchingKnownOriginalRanks,[1]);
  assert.equal(result.originalRanksStillUnverified,3);
  assert.equal(result.optimisticUniformFieldCeilingNumerator,63);
  assert.equal(result.optimisticUniformFieldCeilingDenominator,64);
  assert.equal(result.optimisticUniformFieldCeilingPercent,98.4375);
  assert.equal(result.oneObjectiveTarget995AchievableUnderTheseAssumptions,false);
  assert.equal(result.observedCompetitiveGames,0);
});
test('reordering and splitting identical printed copies preserves equality',()=>{
  const champion=roster.find(d=>d.rank===1);
  const card=champion.cards[0];
  const modified=[
    ...champion.cards.slice(1).reverse(),
    {...card,count:1},{...card,count:card.count-1}
  ];
  assert.equal(printedSixtyKey(modified),printedSixtyKey(champion.cards));
});
test('different official display printing is no longer an exact printed mirror',()=>{
  const champion=roster.find(d=>d.rank===1);
  const modified=champion.cards.map((c,i)=>i===0?
    {...c,printing:{...c.printing,number:String(Number(c.printing.number)+1)}}:c);
  assert.notEqual(printedSixtyKey(modified),printedSixtyKey(champion.cards));
  assert.deepEqual(conditionalMirrorCeiling(modified,roster,32)
    .exactMatchingKnownOriginalRanks,[]);
});
test('two identical known source lists lower the hypothetical optimistic ceiling',()=>{
  const champion=roster.find(d=>d.rank===1);
  const other={...champion,rank:2};
  const r=conditionalMirrorCeiling(champion.cards,[champion,other],32);
  assert.deepEqual(r.exactMatchingKnownOriginalRanks,[1,2]);
  assert.equal(r.optimisticUniformFieldCeilingPercent,96.875);
});
test('unknown original lists never silently become exact mirror evidence',()=>{
  const champion=roster.find(d=>d.rank===1);
  const r=conditionalMirrorCeiling(champion.cards,[champion],32);
  assert.equal(r.knownAuthenticatedOriginalRanks,1);
  assert.equal(r.originalRanksStillUnverified,31);
  assert.deepEqual(r.exactMatchingKnownOriginalRanks,[1]);
});
test('incomplete or duplicated original deck copies are rejected',()=>{
  const champion=roster.find(d=>d.rank===1);
  assert.throws(()=>printedSixtyKey(champion.cards.slice(1)));
  assert.throws(()=>conditionalMirrorCeiling(champion.cards,[champion,champion]));
});
