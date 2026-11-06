'use strict';

const assert=require('node:assert/strict');
const registration=require('../../results/als/registrations/agent25-natural-full60-ball-prompt-staging-v2-20261106.json');
const {run}=require('./agent25-dhelmise-v2-native-three-lock-smoke.cjs');

function study(){
  assert.equal(registration.version,
    'agent25-natural-full60-hns-ball-staging-v2-precommit');
  const result=run({donorCompressor:true,ballDonorCostV2:true});
  assert.equal(result.attempts.length,6);
  assert.equal(result.ballDonorCostV2Policy,true);
  assert.equal(result.competitivelyQualifiedGames,0);
  return {...result,stagedSourceRegistration:registration.version,
    previousV1NativeRun:registration.priorFrozenV1Run,
    previousV1NativeArtifact:registration.priorFrozenV1Artifact,
    treatmentChange:'exact physical Quick Ball staged owner.supporter source recognition',
    noCrossRunPairedPhysicalDealProof:true,
    claimsCompetitiveMatchWinRate:false};
}
module.exports={study};
if(require.main===module)process.stdout.write(JSON.stringify(study(),null,2)+'\n');
