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

test('rank16 first-turn ordinary draw adds independent access resources, exactly',()=>{
 const d=opening.firstTurnDrawEnvelope();
 assert.equal(d.denominator,'15916235808');
 assert.equal(d.direct.count,'4533240096');
 assert.equal(d.firstDrawBudewPlusFloat.count,'166105128');
 assert.equal(d.searchFloatNoBudewSeen.count,'2580517989');
 assert.equal(d.union.count,'7279863213');
 assert(Math.abs(d.union.probability-0.45738598628583477)<1e-12);
 assert(Math.abs(d.prizeAdjustedUnion.probability-0.45555192323737254)<1e-12);
});
test('first-turn prize chance correctly accounts for 2 unseen Budew',()=>{
 const d=opening.firstTurnDrawEnvelope();
 assert(Math.abs(d.chanceBothUnseenBudewPrizeGivenNoBudewSeenEight-30/(52*51))<1e-14);
 assert(d.prizeAdjustedUnion.probability<d.union.probability);
 assert(d.prizeAdjustedUnion.probability>0.45);
 assert(d.direct.probability<d.union.probability);
});
