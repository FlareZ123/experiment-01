'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

/**
 * Print only a bounded, failure-inclusive native result synopsis.
 * All original row details and untrusted terminals remain in the artifact.
 * @param {object} data Full retrospective JSON.
 * @returns {object}
 */
function compact(data){
  assert.equal(data.attemptedNativeArms,8);
  assert.equal(data.preservedPairs,4);
  assert.equal(data.competitiveQualifiedGames,0);
  return {
    version:data.version,attemptedNativeArms:data.attemptedNativeArms,
    reportedPairs:data.comparisons.length,
    competitiveQualifiedGames:data.competitiveQualifiedGames,
    cases:data.comparisons.map(row=>({
      id:row.trial?.id,sourceSeat:row.baseline?.evidence?.sourceSeat,
      sameSource:row.sameSource,
      baselineStatus:row.baseline?.evidence?.nativeStatus,
      treatmentStatus:row.farewellEnabled?.evidence?.nativeStatus,
      sourceAbilityRoots:row.farewellEnabled?.evidence?.sourceFarewellAbilityRoots,
      bothSeatIntentCount:row.farewellEnabled?.evidence?.bothSeatFarewellIntentCount,
      nativePhysicalReceipts:row.farewellEnabled?.rawDevelopmentRow?.actorOnlyDecisionCoverage?.detailedComponentAudits?.root?.farewellLetterReceipts??[],
      bothSeatPhysicalConfirmed:
        row.farewellEnabled?.evidence?.bothSeatFarewellConfirmedEffects,
      bothSeatPhysicalUnconfirmed:
        row.farewellEnabled?.evidence?.bothSeatFarewellUnconfirmedEffects,
      sourceAttackDelta:row.observedSourceAttackDelta,
      baselineError:row.baseline?.evidence?.nativeError,
      treatmentError:row.farewellEnabled?.evidence?.nativeError
    }))
  };
}

if(require.main===module){
  assert.equal(process.argv.length,3);
  const data=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  process.stdout.write(JSON.stringify(compact(data))+'\n');
}

module.exports={compact};
