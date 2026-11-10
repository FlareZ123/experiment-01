'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {census,SETS}=
  require('../../simulation/evaluation/2026-11/agent8-fairy-zone-original-field-dragon-census.cjs');

test('fully defined nine-source-set Dragon subpool has exact printed counts',()=>{
  assert.equal(Object.keys(SETS).length,9);
  const r=census();
  assert.equal(r.originalSourceDecks,29);
  assert.equal(r.printedDragonCopies,101);
  assert.equal(r.distinctOriginalDecksWithDragon,13);
  assert.deepEqual(r.ranks,
    [1,10,12,13,14,15,18,19,20,21,27,30,32]);
  assert.equal(r.largestPrintedDragonHp,370);
  assert.equal(r.allEnumeratedPrintedDragonHpWithin420,true);
  assert.ok(r.restriction.includes('Only nine'));
  assert.equal(r.paperQualifiedGames,0);
});

test('all counted Dragon entries are printed set-validated and rank totals preserve 101',()=>{
  const r=census();
  assert.equal(r.perRank.reduce((s,p)=>s+p.dragonCopies,0),101);
  assert.equal(r.perRank.find(x=>x.rank===14).dragonCopies,12);
  assert.equal(r.perRank.find(x=>x.rank===10).dragonCopies,10);
  assert.equal(r.perRank.find(x=>x.rank===1).dragonCopies,1);
  for(const p of r.perRank){
    assert.ok(p.pokemon.length>0);
    assert.equal(p.pokemon.reduce((a,b)=>a+b.count,0),p.dragonCopies);
    for(const c of p.pokemon){
      assert.equal(c.rank,p.rank);
      assert.equal(c.dragonTypeConfirmed,true);
      assert.ok(c.hp<=420);
      assert.ok(Number.isSafeInteger(c.count)&&c.count>=1);
    }
  }
});
