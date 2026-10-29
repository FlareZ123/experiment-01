'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {auditEnergyModelBridge}=
  require('../scripts/agent17-energy-model-bridge-coverage.cjs');
const source=require('../results/aichi-2026/full-decklists.json');
const result=auditEnergyModelBridge(source);
const rank=n=>result.rows.find(r=>r.rank===n);

test('public-context energy engine covers all 118 printed source Specials',()=>{
  assert.equal(result.originalSources,29);
  assert.deepEqual(result.missingRanks,[23,25,28]);
  assert.equal(result.specialCopies,118);
  assert.equal(result.currentNumericRecognized,38);
  assert.equal(result.richerModelRecognized,118);
  assert.equal(result.stillUnmodeled,0);
  assert.equal(result.qualification.nativeStoreLegality,false);
});
test('full, partial and absent exact-printing coverage is source attributed',()=>{
  assert.deepEqual(result.fullyKnownRanks,
    [2,3,4,5,6,7,9,10,12,13,14,15,17,18,19,20,21,24,26,27,29,30,31,32]);
  assert.deepEqual(result.partialRanks,[]);
  assert.deepEqual(result.zeroRanks,[]);
});
test('raichu original conditional Counter and LPM source names now modeled',()=>{
  for(const n of [4,17]){
    const r=rank(n);
    assert.equal(r.printedSpecialCopies,12);
    assert.equal(r.currentNumericRecognized,0);
    assert.equal(r.richerModelRecognized,12);
    assert.deepEqual(r.unsupported,[]);
  }
});
test('regidrago original Double Dragon is recognized only by richer model',()=>{
  for(const n of [10,12,13,14,18,20,21,27,32]){
    assert.equal(rank(n).currentNumericRecognized,0);
    assert.ok(rank(n).richerModelRecognized>=3);
    assert.equal(rank(n).stillUnmodeled,0);
  }
});
test('changing an original sixty is rejected before helper coverage',()=>{
  const bad=structuredClone(source);
  bad.decks[0].cards[0].count--;
  assert.throws(()=>auditEnergyModelBridge(bad));
});
