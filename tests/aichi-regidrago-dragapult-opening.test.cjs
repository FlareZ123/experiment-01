'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {dragapultOpeningAccess,nineRankDragapultCensus}=
  require('../scripts/aichi-regidrago-dragapult-opening.cjs');

/**
 * Independent physical ordered-deal enumerator. Prize cards are drawn after
 * initial hand and before the player's first normal draw, as in actual setup.
 * @param {string[]} cards Unique physical slots represented by category tags.
 * @param {number} opening
 * @param {number} prizes
 * @returns {object}
 */
function brute(cards,opening,prizes) {
  let valid=0,hand=0,compressed=0;
  const count=opening+prizes+1;
  /** @param {string[]} dealt @param {number[]} remaining */
  function visit(dealt,remaining) {
    if(dealt.length===count){
      const opener=dealt.slice(0,opening);
      if(!opener.includes('B'))return;
      valid++;
      const prizesTaken=dealt.slice(opening,opening+prizes);
      const observed=opener.concat(dealt[count-1]);
      if(observed.includes('D')&&observed.includes('S'))hand++;
      else if(!observed.includes('D')&&observed.includes('C')&&
        !prizesTaken.includes('D'))compressed++;
      return;
    }
    for(const i of remaining) {
      visit([...dealt,cards[i]],remaining.filter(x=>x!==i));
    }
  }
  visit([],cards.map((_,i)=>i));
  return {hand:hand/valid,compressor:compressed/valid,
    either:(hand+compressed)/valid};
}

test('exact prize-aware two-route fractions match independently enumerated deals',()=>{
  for(const sample of [
    {cards:['B','B','D','S','C','X','X','X'],opening:2,prizes:2},
    {cards:['B','B','B','D','S','S','C','C','X'],opening:3,prizes:2},
    {cards:['B','B','D','S','X','X','X','X'],opening:2,prizes:2}
  ]){
    const {cards,opening,prizes}=sample;
    const model=dragapultOpeningAccess({size:cards.length,
      opening,prizes,basics:cards.filter(x=>x==='B').length,
      searchers:cards.filter(x=>x==='S').length,
      compressors:cards.filter(x=>x==='C').length});
    const independent=brute(cards,opening,prizes);
    assert.ok(Math.abs(model.handDiscard.probability-independent.hand)<1e-12);
    assert.ok(Math.abs(model.deckCompressor.probability-
      independent.compressor)<1e-12);
    assert.ok(Math.abs(model.either.probability-independent.either)<1e-12);
  }
});

test('mutually exclusive routes, no-compressor case and validation',()=>{
  const rows=[
    dragapultOpeningAccess({basics:15,searchers:8,compressors:0}),
    dragapultOpeningAccess({basics:15,searchers:8,compressors:2})
  ];
  assert.equal(rows[0].deckCompressor.probability,0);
  assert.ok(rows[1].either.probability>rows[0].either.probability);
  for(const row of rows)
    assert.ok(Math.abs(row.either.probability-
      row.handDiscard.probability-row.deckCompressor.probability)<1e-14);
  assert.throws(()=>dragapultOpeningAccess({
    basics:0,searchers:1,compressors:1}),RangeError);
  assert.throws(()=>dragapultOpeningAccess({
    size:8,opening:2,prizes:6,basics:2,searchers:1,compressors:1}),RangeError);
});

test('nine published rank counts and independently audited Basics drive the census',()=>{
  const manifestPath=path.join(__dirname,
    '../results/aichi-2026/full-decklists.json');
  const auditPath=path.join(__dirname,
    '../results/aichi-2026/opening-hand-audit.json');
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  const audit=JSON.parse(fs.readFileSync(auditPath,'utf8'));
  const census=nineRankDragapultCensus(manifest,audit);
  assert.deepEqual(census.rows.map(x=>x.rank),
    [10,12,13,14,18,20,21,27,32]);
  assert.deepEqual(census.rows.map(x=>x.basics),
    [15,15,11,14,16,14,14,15,13]);
  assert.deepEqual(census.rows.map(x=>x.compressor),
    [1,0,2,1,0,1,1,1,1]);
  assert.deepEqual(census.rows.map(x=>x.treasure),
    [3,4,4,4,4,3,4,4,3]);
  assert.deepEqual(census.rows.map(x=>x.quick),
    [3,4,3,4,3,4,4,4,4]);
  assert.ok(Math.abs(census.rows[0].treasureOnly.percent-
    3.9233469367)<1e-8,'Reproduce independent prior rank10 MT count');
  assert.ok(Math.abs(census.means.either-16.488187584456)<1e-8);
  assert.ok(census.rows.every(row=>row.either.probability<=1));
  const bad=JSON.parse(JSON.stringify(audit));
  bad.decks.find(x=>x.rank===10).unresolved_pokemon=['missing-printing'];
  assert.throws(()=>nineRankDragapultCensus(manifest,bad),
    /unresolved Basic printing/);
});
