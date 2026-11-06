'use strict';

const assert=require('node:assert/strict');
const registration=require('../../results/als/registrations/agent25-quickball-three-donor-root-cost-v4-20261106.json');
const {run}=require('./agent25-dhelmise-v2-native-three-lock-smoke.cjs');

function study(){
  assert.equal(registration.version,
    'agent25-quickball-three-donor-root-cost-v4-precommit');
  const result=run({donorCompressor:true,ballDonorCostV4:true});
  assert.equal(result.attempts.length,6);
  assert.equal(result.ballDonorCostV4Policy,true);
  assert.equal(result.competitivelyQualifiedGames,0);
  return {...result,v4ThreeDonorRegistration:registration.version,
    source60AndCandidate60Unchanged:true,
    nativeSourceRootAcceptanceAndPaidCostRequireIndependentAudit:true,
    frozenV3Control:registration.frozenSourcePolicyControlRun,
    frozenV3Artifact:registration.frozenControlArtifact,
    noCrossRunDealParityProof:true,
    competitiveQualifiedGames:0};
}
module.exports={study};
if(require.main===module)process.stdout.write(JSON.stringify(study(),null,2)+'\n');
