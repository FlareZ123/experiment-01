'use strict';
const assert = require('node:assert/strict');
const {run: runPaired} = require('./agent10-rank9-special-paid-retreat-pair.cjs');
const {VERSION, withRank9RetreatPhysicalCustody} =
  require('../twinleaf/agent10-rank9-retreat-physical-custody.cjs');

/** Pure observation of the existing historically frozen paired four-case run. */
function run() {
  const observed = withRank9RetreatPhysicalCustody(runPaired);
  const paired = observed.result;
  assert.equal(paired.completeControl, true);
  assert.equal(paired.completeTreatment, true);
  assert.equal(paired.physicalDealParity, true);
  assert.equal(paired.competitiveQualifiedGames, 0);
  return {
    schema:'agent10-original-rank9-custody-native-v1',
    witnessVersion:VERSION,
    sourcePrintedRank:9,
    historicalDeal: true,
    unchangedSourceAndCandidates: paired.unchangedFixedSourceSixties,
    actualNativeAttemptPairs: paired.pairs.length,
    pinnedVendorRevision: paired.pinnedVendorRevision,
    pairedFullPhysicalDealsMatch: paired.physicalDealParity,
    rootChoiceChangedPairs: paired.pairs.filter(p =>
      p.firstDifferentNativeRootIndex !== null).map(p=>({
      id:p.id, firstDifferentRoot:p.firstDifferentNativeRootIndex
    })),
    custody: observed.audit,
    matchedOriginalPairSummary: paired.pairs.map(p=>({
      id:p.id, seed:p.seed, sourceSeat:p.sourceSeat,
      sourceDealSame:p.sourceDealSame, fullDealSame:p.fullDealSame,
      treatmentSourceRetreats:p.treatmentSourceRetreats,
      baselineNativeStatus:p.baselineStatus,
      treatmentNativeStatus:p.treatmentStatus
    })),
    competitiveQualifiedGames:0,
    caveat:'Single retrospectively identified authentic source turn; source-only opt-in actor, native rule-engine and no match-clock certification. A physical Energy reference receipt is not whole-game paper validity.'
  };
}
if(require.main === module) {
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  assert.equal(result.custody.errors.length,0);
  assert.equal(result.custody.exactPhysicalPaidRetreatReceipts,1,
    'The exact historical source turn must show a physically identical paid Prism card');
}
module.exports = {run};
