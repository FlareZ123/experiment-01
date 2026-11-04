'use strict';
const assert=require('node:assert/strict');
const {POLICY_VERSION,withBilateralCommonCandidatePolicy}=
  require('./agent41-bilateral-common-policy.cjs');

const VERSION='agent36-identical-two-seat-resource-wrapper-v1';

/**
 * Reuse the SAME Agent41 three-resource policy for both physical seats.
 * This forms an opt-in source-rank-independent resource policy and retains
 * the ordinary per-seat paper caveats. Installation is deterministic:
 * seat0 outer, seat1 inner, each hook actor-scoped. A policy-local audit
 * proves both handlers were installed, but does not establish that their
 * combined decisions are competitively strong or paper-complete.
 *
 * @template T
 * @param {()=>T} execute Actual native match runner.
 * @param {{withSeat?:(seat:0|1,execute:Function)=>{result:unknown,policyAudit:object}}} [deps]
 * @returns {{result:T,policyAudit:object}}
 */
function withIdenticalTwoSeatCommonPolicy(execute,deps={}){
  assert.equal(typeof execute,'function');
  const withSeat=deps.withSeat??withBilateralCommonCandidatePolicy;
  assert.equal(typeof withSeat,'function');
  const outer=withSeat(0,()=>withSeat(1,execute));
  assert.ok(outer&&outer.policyAudit);
  const inner=outer.result;
  assert.ok(inner&&inner.policyAudit);
  return {
    result:inner.result,
    policyAudit:{
      version:POLICY_VERSION,
      twoSeatVersion:VERSION,
      sharedResourcePolicySelected:true,
      installedPhysicalSeats:[0,1],
      wrapperInstallationOrder:[0,1],
      selectedSameAdapterFunctionsForEachSeat:true,
      sourceRankConditionalResourceWrapper:false,
      perSeatAudits:{
        0:outer.policyAudit,
        1:inner.policyAudit
      },
      ownerHiddenInformationCertified:false,
      paperPaymentCertified:false,
      wholeGamePolicyCertified:false,
      competitiveGameQualified:false
    }
  };
}
module.exports={VERSION,withIdenticalTwoSeatCommonPolicy};
