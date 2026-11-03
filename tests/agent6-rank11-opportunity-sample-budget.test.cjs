'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {requiredIndependentDeals,rank11SourceOpportunityBudget:report}=
  require('../scripts/agent6-rank11-opportunity-sample-budget.cjs');
test('registered sample budgets distinguish deals from paired arms',()=>{
 const r=report();
 assert.equal(r.letterNoDark.independentDealsFor80Pct,10);
 assert.equal(r.letterNoDark.independentDealsFor95Pct,19);
 assert.equal(r.letterCarmineNoDark.independentDealsFor95Pct,55);
 assert.equal(r.tripleItemSearchableMega.independentDealsFor80Pct,119);
 assert.equal(r.tripleItemSearchableMega.independentDealsFor95Pct,222);
 assert.ok(r.tripleItemSearchableMega.fourDealDetectionProbability<0.06);
 assert.throws(()=>requiredIndependentDeals(0,0.95));
});
