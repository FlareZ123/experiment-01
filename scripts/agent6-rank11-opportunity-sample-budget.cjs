'use strict';
const assert=require('node:assert/strict');
const {rank11Report}=require('./agent6-rank11-letter-opportunity.cjs');
const {rank11CoheldReport}=
  require('./agent6-rank11-letter-carmine-contention.cjs');
const {rank11LetterQuickPatchWindow}=
  require('./agent6-rank11-letter-quickpatch-prize.cjs');

/**
 * Prospective cohort count for at least one witnessed opening opportunity.
 * Assumes independent authenticated legal openings, fixed marginal chance,
 * no postselection and no game-policy constraints. Not game-win power.
 * @param {number} p Opportunity probability per independent source deal.
 * @param {number} desired Detection probability, strictly between 0 and 1.
 */
function requiredIndependentDeals(p,desired){
  assert.ok(p>0&&p<1&&desired>0&&desired<1);
  return Math.ceil(Math.log1p(-desired)/Math.log1p(-p));
}
function rank11SourceOpportunityBudget(){
  const single=rank11Report();
  const coheld=rank11CoheldReport();
  const triple=rank11LetterQuickPatchWindow();
  const events={
    letterNoDark:single.probability,
    letterCarmineNoDark:coheld.allLegalOpenings.coheldProbability,
    tripleItemSearchableMega:triple.withAvailableMegaProbability
  };
  return Object.fromEntries(Object.entries(events).map(([name,p])=>[
    name,{perIndependentDeal:p,
      fourDealDetectionProbability:1-(1-p)**4,
      independentDealsFor80Pct:requiredIndependentDeals(p,0.8),
      independentDealsFor95Pct:requiredIndependentDeals(p,0.95)}
  ]));
}
module.exports={requiredIndependentDeals,rank11SourceOpportunityBudget};
