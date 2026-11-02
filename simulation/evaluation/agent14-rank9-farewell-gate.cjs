'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');

/** @param {object} data Native frozen original-source replay. */
function assertDeferredSourceConservation(data){
  assert.equal(data.attemptedNativeArms,8);
  assert.equal(data.comparisons.length,4);
  assert.equal(data.competitiveQualifiedGames,0);
  const rows=data.comparisons;
  for(const row of rows){
    assert.equal(row.sameSource,'EXACT_SOURCE_DEAL_MATCH');
    assert.equal(row.baseline.evidence.nativeError,null);
    assert.equal(row.farewellEnabled.evidence.nativeError,null);
  }
  const settled=rows.reduce((n,row)=>
    n+row.farewellEnabled.evidence.sourceFarewellSettled,0);
  const pending=rows.reduce((n,row)=>
    n+row.farewellEnabled.evidence.sourceFarewellPending,0);
  assert.equal(settled,6);
  assert.equal(pending,0);
  return {pairedOriginalCases:4,sourceFarewellSettlements:settled,
    unresolved:pending,competitiveQualifiedGames:0};
}
if(require.main===module){
  const data=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  process.stdout.write(JSON.stringify(assertDeferredSourceConservation(data))+'\n');
}
module.exports={assertDeferredSourceConservation};
