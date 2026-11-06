'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {runOriginalV7GuzmaCanary,TARGET,EXPECTED_PASS_ORDINAL}=
  require('../simulation/evaluation/agent9-v7-guzma-causal-replay.cjs');
const {writeLocked}=
  require('../simulation/evaluation/agent5-rank6-paid-dce-thunder-volt-v10.cjs');

test('same eight real original v7 physical deals with only one selected paid Guzma root',()=>{
  const out=runOriginalV7GuzmaCanary();
  const directory=process.env.AGENT9_V7_GUZMA_CANARY_DIR;
  if(directory)writeLocked(path.join(directory,
    'agent9-v7-guzma-canary-control-treatment.json'),out);
  const c=out.comparison,one=c.target;
  const brief={
    schema:out.schema,
    repository:out.checkout,vendor:out.vendorPin,
    arms:c.arms,sameOriginalPhysicalOpenings:c.sameOriginalPhysicalOpenings,
    unmodifiedNonTargetRows:c.nonTargetExactPublicReplays,
    originalReturnedAfterTreatment:
      out.controlRoundtrip.fullABAReturnToOriginal,
    originalTarget:{id:TARGET,root:EXPECTED_PASS_ORDINAL,
      status:one.baselineStatus,first:one.firstControlDifference},
    canaryTarget:{status:one.treatmentStatus,
      first:one.firstTreatmentDifference,
      canary:one.guzmaCanary,
      continuation:one.guzmaPromptContinuation},
    competitiveGamesQualified:0
  };
  console.log('AGENT9_V7_PAID_GUZMA_NATIVE',JSON.stringify(brief));
  assert.equal(c.arms,8);
  assert.equal(c.sameOriginalPhysicalOpenings,true);
  assert.equal(c.nonTargetExactPublicReplays,7);
  assert.equal(out.controlRoundtrip.fullABAReturnToOriginal,true);
  assert.equal(out.controlRoundtrip.rows.length,8);
  assert.equal(one.firstControlDifference?.actionOrdinal,EXPECTED_PASS_ORDINAL);
  assert.equal(one.firstControlDifference?.action,'PassTurnAction');
  assert.equal(one.firstTreatmentDifference?.actionOrdinal,EXPECTED_PASS_ORDINAL);
  assert.equal(one.firstTreatmentDifference?.action,'PlayCardAction');
  assert.equal(one.firstTreatmentDifference?.card,'Guzma');
  assert.equal(one.guzmaCanary?.nativeStoreAcceptedGuzmaRoots,1);
  assert.equal(one.guzmaPromptContinuation?.acceptedGuzmaRoots,1);
  assert.equal(one.guzmaPromptContinuation?.guzmaHandConsumptionConfirmed,1);
  assert.equal(one.guzmaPromptContinuation?.ownTargetPhysicalConfirmations,1);
  assert.equal(one.guzmaPromptContinuation?.gustTargetPhysicalConfirmations,1);
  assert.equal(out.competitiveGamesQualified,0);
});
