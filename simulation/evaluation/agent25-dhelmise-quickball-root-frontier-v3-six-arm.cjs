'use strict';

const assert=require('node:assert/strict');
const registration=require('../../results/als/registrations/agent25-owner-quickball-root-frontier-v3-20261106.json');
const {run}=require('./agent25-dhelmise-v2-native-three-lock-smoke.cjs');

function study(){
  assert.equal(registration.version,
    'agent25-owner-quickball-root-frontier-v3-precommit');
  const result=run({donorCompressor:true,ballDonorCostV3:true});
  assert.equal(result.attempts.length,6);
  assert.equal(result.ballDonorCostV3Policy,true);
  assert.equal(result.competitivelyQualifiedGames,0);
  return {...result,rootFrontierRegistration:registration.version,
    candidateAndSource60sUnchanged:true,
    previousCorrectedV2Run:42135412393,
    observerDoesNotAlterPhysicalCardRootDecisions:true,
    noCrossPolicySourceDealMatchingProof:true,
    qualifiedGames:0};
}
module.exports={study};
if(require.main===module)process.stdout.write(JSON.stringify(study(),null,2)+'\n');
