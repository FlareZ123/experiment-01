'use strict';

/*
 * Opt-in rank13 worker overlay: only dispatches the two targeted Crispin
 * branches, then delegates ALL other actions/prompts to the current exact
 * Agent24 rank13 actor-only worker. Not installed in V3 registration.
 *
 * Policy identity is deliberately new; do not mislabel this as Agent24's
 * frozen/tested original. Host adoption also requires the separate exact
 * Crispin AttachEnergyPrompt projection from this branch.
 */
const base=require('./agent24-rank13-regidrago-opponent-policy.cjs');
const {chooseRank13VsSeekerFundingLine:recover}=
  require('./agent47-rank13-vsseeker-funding-line.cjs');
const {chooseRank13CrispinContinuation:continueCrispin}=
  require('./agent47-rank13-crispin-prompt-continuation.cjs');
const POLICY_VERSION='agent47-rank13-crispin-overlay-v1';

function createPolicy({role,seat,policyVersion,config}) {
  if(policyVersion!==POLICY_VERSION)
    throw new Error('R13_CRISPIN_OVERLAY_VERSION_MISMATCH');
  const main=base.createPolicy({
    role,seat,policyVersion:base.POLICY_VERSION,config
  });
  return Object.freeze({
    decide(request) {
      if(request?.role!==role || request?.seat!==seat ||
         request?.observation?.actorSeat!==seat)
        return {kind:'abstain',reasonCode:'ROLE_SEAT_BINDING_MISMATCH'};
      const decision=recover(request)??continueCrispin(request);
      return decision??main.decide(request);
    }
  });
}
module.exports={
  POLICY_VERSION,SOURCE_RANK:base.SOURCE_RANK,
  SOURCE_FINGERPRINT_SHA256:base.SOURCE_FINGERPRINT_SHA256,
  SOURCE_LIST_BLOB_SHA1:base.SOURCE_LIST_BLOB_SHA1,
  CANDIDATE_FINGERPRINT_SHA256:base.CANDIDATE_FINGERPRINT_SHA256,
  CANDIDATE_LIST_BLOB_SHA1:base.CANDIDATE_LIST_BLOB_SHA1,
  ENGINE_PIN:base.ENGINE_PIN,
  createPolicy
};
