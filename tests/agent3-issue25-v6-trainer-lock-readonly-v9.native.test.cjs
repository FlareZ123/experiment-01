'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  runReadOnlyReplayV9,writeReadOnlyReplayV9
}=require('../simulation/evaluation/agent3-issue25-v6-trainer-lock-readonly-v9.cjs');

test('same eight v6 original native deals with untouched policy and two existing read-only observers',()=>{
  const observed=runReadOnlyReplayV9();
  const dir=process.env.ISSUE25_AGENT3_V9_RECEIPT_DIR;
  const artifact=dir?writeReadOnlyReplayV9(observed,dir):null;
  const result=observed.audit;
  console.log('AGENT3_ISSUE25_READONLY_V9_NATIVE',JSON.stringify({
    status:result.status,
    nativeActualAttemptCount:result.rows.length,
    exactEightNativeBaselineParity:
      result.gates.completeOriginalNativeParity,
    observedOwnerTrainerCensusAllEight:
      result.gates.observedOwnerTrainerCensusAllEight,
    observedOwnerTrainerFlag:result.actualObservedOwnerTrainerFlag,
    observedPassiveWindowFlag:result.actualObservedPowerWindowFlag,
    nativeRows:result.rows.map(row=>({
      id:row.id,sourceSeat:row.observedSourceSeat,
      disposition:row.nativeDisposition,
      acceptedRoots:row.nativeAcceptedRoots,
      equalPhysicalAndRootBaseline:row.allBaselineNativeFieldsEqual,
      exactBaselineFields:row.baselineExactChecks,
      trainerSource:row.ownerTrainerFrontier.sourceSeat,
      trainerCandidate:row.ownerTrainerFrontier.candidateSeat,
      passivePressureStatus:row.passiveOrPowerLock.rank6?.status??null,
      nativePassivePowerChecks:
        row.passiveOrPowerLock.rank6NativeBoundaries
          ?.nativeCandidateTurn2Powers??null
    })),
    qualifiedCompetitiveGames:result.qualifiedCompetitiveGames,
    artifact
  }));
  assert.equal(observed.execution.manifest.releaseQualified,false);
  assert.equal(result.qualifiedCompetitiveGames,0);
  assert.equal(result.rows.length,8);
  assert.equal(result.actualRunnerSourceIndependent,true);
  assert.equal(result.gates.completeOriginalNativeParity,true,
    'Read-only observer changed physical deal, native roots or disposition');
  assert.equal(result.gates.observedOwnerTrainerCensusAllEight,true,
    'A genuine owner-root Trainer observer was missing');
});
