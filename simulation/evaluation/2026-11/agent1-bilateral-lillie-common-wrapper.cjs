'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const LILLIE_MODULE=require.resolve('../../twinleaf/agent12-actor-only-lillie-after-pass.cjs');
const {withActorOnlyLillieAfterPass,VERSION:LILLIE_SELECTOR_VERSION}=
  require(LILLIE_MODULE);

const VERSION='agent1-bilateral-lillie-common-wrapper-v1';

/** @param {string} file @returns {string} */
function sha256File(file){
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

/**
 * Apply the same actor-owned Lillie's Determination-after-Pass selector to
 * both real physical players around an existing synchronous native runner.
 * The selector is deliberately outside candidate/source policy composition:
 * either player's own held Lillie can replace only that player's own Pass.
 * No candidate identity, opponent rank, seed, or hidden opponent information
 * is used. The default runner is unchanged unless this wrapper is selected.
 *
 * @template T
 * @param {()=>T} execute Existing shared-policy/native execution.
 * @param {{lillieDeps?:object}} [options] Native/test dependency injection.
 * @returns {{result:T,policyAudit:object}}
 */
function withBilateralLillieAfterPass(execute,{lillieDeps={}}={}){
  assert.equal(typeof execute,'function');
  const observed=withActorOnlyLillieAfterPass(execute,lillieDeps);
  const audit=observed.audit;
  assert.equal(audit.bothPhysicalSeats,true,
    'The Lillie selector must be installed for both physical seats');
  const rootEvents=Array.isArray(audit.rootEvents)?audit.rootEvents:[];
  const observedPhysicalSeats=[...new Set(rootEvents
    .map(row=>row.seat).filter(seat=>seat===0||seat===1))].sort();
  return {
    result:observed.result,
    policyAudit:{
      version:VERSION,
      selectorVersion:LILLIE_SELECTOR_VERSION,
      installedForBothPhysicalSeats:true,
      candidateIdentityBranch:false,
      opponentRankBranch:false,
      seedOrTurnBranch:false,
      decisionInformation:'Actor-owned hand plus public board/restrictions through actorObservation; no opponent hidden identities or deck/Prize identities',
      observedPhysicalSeats,
      attemptedLillieRoots:audit.attemptedLillieRoots,
      acceptedLillieRoots:audit.acceptedLillieRoots,
      rejectedLillieRoots:audit.rejectedLillieRoots,
      sampledRootEvents:rootEvents,
      selectorAudit:audit,
      wrapperSha256:sha256File(__filename),
      selectorSha256:sha256File(LILLIE_MODULE),
      selectorInformationSetSafe:true,
      wholeGamePolicyCertified:false,
      paperPaymentCertified:false,
      officialClockCertified:false,
      competitiveGameQualified:false
    }
  };
}

/**
 * Convenience adapter for the canonical Agent41 bilateral development runner.
 * This is an explicit research-only opt-in; it does not mutate the selected
 * v8/v2 baseline or its frozen registration.
 *
 * @param {object} trial Registered trial.
 * @param {Map<string,object>} candidates Prepared candidate map.
 * @param {object} [options] Existing executeDevelopment options.
 * @param {{executeDevelopment?:Function,lillieDeps?:object}} [deps] Test seam.
 * @returns {object} Original trial output plus an explicit policy receipt.
 */
function executeDevelopmentWithBilateralLillie(trial,candidates,options={},deps={}){
  const executeDevelopment=deps.executeDevelopment??
    require('../agent41-bilateral-v2-development.cjs').executeDevelopment;
  assert.equal(typeof executeDevelopment,'function');
  const wrapped=withBilateralLillieAfterPass(
    ()=>executeDevelopment(trial,candidates,options),
    {lillieDeps:deps.lillieDeps??{}}
  );
  const output=wrapped.result;
  assert.ok(output&&typeof output==='object'&&!Array.isArray(output));
  assert.equal(typeof output.policyVersion,'string',
    'Canonical development output must carry its base policy version');
  const suffix='+'+LILLIE_SELECTOR_VERSION;
  return {
    ...output,
    policyVersion:output.policyVersion.endsWith(suffix)?
      output.policyVersion:output.policyVersion+suffix,
    bilateralLillieAfterPassOptIn:true,
    bilateralLillieAfterPassPolicyAudit:wrapped.policyAudit
  };
}

module.exports={VERSION,LILLIE_SELECTOR_VERSION,withBilateralLillieAfterPass,
  executeDevelopmentWithBilateralLillie};
