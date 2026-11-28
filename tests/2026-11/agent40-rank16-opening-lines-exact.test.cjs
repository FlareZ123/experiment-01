'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const opening=require('../../simulation/evaluation/2026-11/agent40-rank16-opening-lines-exact.cjs');
test('rank16 opening denominator and mulligan count',()=>{
 const o=opening.calculate();
 assert.equal(o.denominator,'386206920');
 assert.equal(o.validOpenings,'300306336');
 assert.equal(o.basicCopies,11);
 assert.equal(opening.choose(60,7).toString(),'386206920');
 assert.equal(opening.choose(49,7).toString(),'85900584');
});
test('rank16 direct Budew, Trubbish and Float co-presence',()=>{
 const e=opening.calculate().conditionalOnValidOpening;
 assert.equal(e.directBudew.count,'85532832');
 assert.equal(e.budewAndTrubbish.count,'16776144');
 assert.equal(e.budewTrubbishFloat.count,'5275304');
 assert(e.budewAndTrubbish.probability<e.directBudew.probability);
});
test('rank16 no-Budew Float-search event disjoint from direct Budew',()=>{
 const e=opening.calculate().conditionalOnValidOpening;
 assert.equal(e.noBudewTrubbishFloatQuickOrVip.count,'11644920');
 assert.equal(e.noBudewOtherBasicFloatQuickOrVip.count,'39740253');
 assert.equal(e.directBudewOrNoBudewOtherBasicFloatSearchCore.count,'125273085');
 assert.equal(85532832+39740253,125273085);
 assert(e.noBudewTrubbishFloatQuickOrVip.probability<e.noBudewOtherBasicFloatQuickOrVip.probability);
});
