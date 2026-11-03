'use strict';
const assert=require('node:assert/strict');
const {run:runFactorial}=require('./agent10-rank9-funding-retreat-factorial.cjs');
const {VERSION,withRank9RetreatPaymentCustody}=
  require('../twinleaf/agent10-rank9-retreat-payment-custody-v2.cjs');
function run(){
  const observed=withRank9RetreatPaymentCustody(runFactorial);
  const factorial=observed.result;
  assert.equal(factorial.totalNativeTrialCount,16);
  assert.equal(factorial.allPhysicalDealsAndOriginalDecksEqual,true);
  assert.equal(factorial.competitiveQualifiedGames,0);
  return {
    schema:'agent10-original-rank9-physical-fee-both-routes-v2',
    observerVersion:VERSION,
    originalSourceRank:9,
    retrospectiveHistoricalDeals:true,
    pinnedVendor:factorial.pinnedVendor,
    originalTrialCount:factorial.originalTrialCount,
    totalNativeTrialCount:factorial.totalNativeTrialCount,
    samePrintedDeckAndFullDealAcrossFactors:
      factorial.allPhysicalDealsAndOriginalDecksEqual,
    sourceFeeWitness:observed.audit,
    affectedNativeComparison:factorial.comparisons
      .filter(p=>Object.values(p.arms).some(a=>
        a.source.retreatRoots.length>0))
      .map(p=>({id:p.id,seed:p.seed,sourceSeat:p.sourceSeat,
        arms:Object.fromEntries(Object.entries(p.arms).map(([k,v])=>[
          k,{firstClawTurn:v.source.firstClawTurn,
            sourceRetreatRoots:v.source.retreatRoots,
            nativeFinal:v.nativeFinal}
        ]))})),
    competitiveQualifiedGames:0,
    caveat:'Historical four original source deal pairs x four policy factors. Native physical fees are narrow accepted Store transactions, not a qualification of original-owner whole-game custody, clock, opponent decisions, or competitive match wins.'
  };
}
if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  const a=result.sourceFeeWitness;
  assert.equal(a.errors.length,0);
  assert.equal(a.exactPhysicalPaymentCount,2,
    'Expected one exact original source Prism payment from each native fee route');
  assert.deepEqual(a.receipts.map(x=>[x.turn,x.route]).sort(),
    [[32,'automatic'],[42,'selected-prompt']]);
}
module.exports={run};
