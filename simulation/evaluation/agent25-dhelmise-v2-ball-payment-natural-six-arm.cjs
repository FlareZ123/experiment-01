'use strict';

const assert=require('node:assert/strict');
const registration=require('../../results/als/registrations/agent25-natural-full60-quickball-hns-owner-20261104.json');
const {run}=require('./agent25-dhelmise-v2-native-three-lock-smoke.cjs');

function study(){
  assert.equal(registration.version,
    'agent25-natural-full60-hns-ball-payment-owner-v1-precommit');
  const result=run({donorCompressor:true,ballDonorCost:true});
  assert.equal(result.attempts.length,6);
  assert.equal(result.ballDonorCostPolicy,true);
  assert.equal(result.competitivelyQualifiedGames,0);
  return {
    ...result,
    newPolicyRegistration:registration.version,
    previouslyFrozenControlRun:registration.priorControlCIRun,
    previouslyFrozenControlArtifact:registration.priorControlArtifact,
    noPairedPhysicalDealProof:true,
    claimsCompetitiveMatchWinRate:false
  };
}
module.exports={study};
if(require.main===module)process.stdout.write(JSON.stringify(study(),null,2)+'\n');
