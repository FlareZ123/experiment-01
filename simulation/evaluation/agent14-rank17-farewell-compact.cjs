'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

/** @param {object} report Registered native source rank17 developmental data. */
function compact(report){
  assert.equal(report.plannedNativeArms,8);
  assert.equal(report.pairs.length,4);
  assert.equal(report.competitiveQualifiedGames,0);
  const cases=report.pairs.map(pair=>({
    sourceDeal:pair.trial.seed,
    candidate:pair.trial.candidateId,
    physicalSourceDeal:pair.sameSource,
    baselineStatus:pair.baseline.evidence.nativeStatus,
    enabledStatus:pair.farewellEnabled.evidence.nativeStatus,
    sourceAbilityRoots:pair.farewellEnabled.evidence.sourceFarewellAbilityRoots.length,
    sourceAbilitySettled:pair.farewellEnabled.evidence.sourceFarewellSettled,
    sourceAbilityUnresolved:pair.farewellEnabled.evidence.sourceFarewellPending,
    sourceBaselineError:pair.baseline.evidence.nativeError,
    sourceEnabledError:pair.farewellEnabled.evidence.nativeError
  }));
  return {version:report.version,rank:report.sourceRank,
    plannedNativeArms:8,retainedPairs:cases.length,
    physicallyPaired:cases.filter(x=>
      x.physicalSourceDeal==='EXACT_SOURCE_DEAL_MATCH').length,
    sourceAbilitySettled:cases.reduce((n,x)=>n+x.sourceAbilitySettled,0),
    sourceAbilityUnresolved:cases.reduce((n,x)=>n+x.sourceAbilityUnresolved,0),
    cases,competitiveQualifiedGames:0};
}

if(require.main===module){
  const report=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  process.stdout.write(JSON.stringify(compact(report))+'\n');
}

module.exports={compact};
