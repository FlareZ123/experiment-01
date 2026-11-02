'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

/** @param {object} report Retrospective native original-printed data. */
function compact(report){
  assert.equal(report.attemptedNativeArms,24);
  assert.equal(report.preservedPairs,12);
  assert.equal(report.competitiveQualifiedGames,0);
  const rows=report.comparisons.map(pair=>({
    trial:pair.trial.id,rank:pair.sourceRank,
    sameOriginalSource:pair.sameSource,
    baselineStatus:pair.baseline.evidence.nativeStatus,
    treatmentStatus:pair.farewellEnabled.evidence.nativeStatus,
    sourceActions:pair.farewellEnabled.evidence.sourceFarewellAbilityRoots.length,
    settled:pair.farewellEnabled.evidence.sourceFarewellSettled,
    pending:pair.farewellEnabled.evidence.sourceFarewellPending,
    baselineError:pair.baseline.evidence.nativeError,
    treatmentError:pair.farewellEnabled.evidence.nativeError
  }));
  const byRank={};
  for(const rank of report.originalRanks){
    const group=rows.filter(row=>row.rank===rank);
    byRank[rank]={
      pairedCases:group.length,
      exactSourceMatches:group.filter(row=>
        row.sameOriginalSource==='EXACT_SOURCE_DEAL_MATCH').length,
      nativeRecordedAbilities:group.reduce((n,row)=>n+row.sourceActions,0),
      physicallySettled:group.reduce((n,row)=>n+(row.settled??0),0),
      pending:group.reduce((n,row)=>n+(row.pending??0),0),
      originalDriverErrors:group.filter(row=>
        row.baselineError||row.treatmentError).length
    };
  }
  return {version:report.version,attemptedNativeArms:24,
    allSourceRows:rows,byRank,competitiveQualifiedGames:0};
}

if(require.main===module){
  const data=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  process.stdout.write(JSON.stringify(compact(data))+'\n');
}

module.exports={compact};
