'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {run,writeArchive,VERSION}=
  require('../simulation/evaluation/agent36-issue25-common-v9-paid-retreat-aba.cjs');

test('registered v9 A/B/A toggles only the common owner-paid-retreat root on the same eight native deals',()=>{
  const result=run();
  const directory=process.env.ISSUE25_STEWARD_V9_DIR;
  const archive=directory?writeArchive(result,directory):null;
  const summary={
    schema:result.schema,version:VERSION,
    registration:result.registrationPath,
    pinnedTwinleaf:result.pinnedTwinleaf,
    summary:result.summary,
    phaseSummaries:result.summary.phaseSummaries,
    archive
  };
  console.log('AGENT36_ISSUE25_V9_PAID_RETREAT_NATIVE',JSON.stringify(summary));
  assert.equal(result.schema,VERSION);
  assert.equal(result.registration.expectedNativeAttempts,24);
  assert.deepEqual(result.phases.map(x=>x.actorTwoUnitPaidRetreatRoot),
    [false,true,false]);
  assert.equal(result.summary.nativeAttempts,24);
  assert.equal(result.summary.allRegisteredIdsReturned,true);
  assert.equal(result.summary.allOpeningsMatchedWithinTrial,true);
  assert.equal(result.summary.controlsRepeatedExactly,true);
  assert.equal(result.summary.allTreatmentFirstDivergencesAreRetreat,true);
  assert.equal(result.summary.phaseSummaries.length,3);
  assert.equal(result.releaseQualified,false);
  assert.equal(result.competitiveGamesQualified,0);
  assert.equal(result.estimatedWinRate,null);
});
