'use strict';
const assert=require('node:assert/strict');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {hashRegisteredFile,runSelectedIssue25V0}=
  require('./agent36-issue25-selected-v0.cjs');
const {withBlockedPromptEnvelope}=
  require('../twinleaf/agent50-first-blocked-prompt-envelope.cjs');
const {withPrintedAttackChoiceProvenance}=
  require('../twinleaf/agent30-attack-printed-choice-provenance.cjs');
const {withOwnerFutureSightNeutralOrder}=
  require('../twinleaf/agent30-owner-futuresight-neutral-order.cjs');

const VERSION='agent36-issue25-source-stamped-futuresight-v2-development';
const EXTRA_SOURCE_PATHS=[
  'simulation/evaluation/agent36-issue25-printed-futuresight-v2.cjs',
  'simulation/twinleaf/agent30-attack-printed-choice-provenance.cjs',
  'simulation/twinleaf/agent30-owner-futuresight-neutral-order.cjs',
  'tests/agent36-issue25-printed-futuresight-v2.native.test.cjs'
];

/**
 * Preserve outer policy and failure boundary from selected historical v0.
 * Add read-only exact printing origin attribution and exactly one source-
 * locked, neutral Future Sight reorder action. The origin observer DOES NOT
 * choose Night Watch/Get Lost targets, so both remain typed fail-closed.
 *
 * @template T
 * @param {()=>T} next genuine native runner
 * @returns {{result:T,audit:object}}
 */
function withPrintedOwnerAttackFrontier(next){
  assert.equal(typeof next,'function');
  let printedOriginAudit=null,futureSightAudit=null;
  const envelope=withBlockedPromptEnvelope(()=>{
    const printed=withPrintedAttackChoiceProvenance(()=>{
      const future=withOwnerFutureSightNeutralOrder(next);
      futureSightAudit=future.audit;
      return future.result;
    });
    printedOriginAudit=printed.audit;
    return printed.result;
  });
  return {result:envelope.result,audit:{
    ...envelope.audit,
    sourceStampedFutureSight:futureSightAudit,
    printedAttackOrigins:printedOriginAudit,
    narrowOwnerActionScope:'Duskull VIV Future Sight only',
    fullCompetitivePolicyCertified:false
  }};
}

/**
 * A distinct, opt-in v2 developmental counterfactual on EXACT same
 * historical four original source and candidate arms as selected v0.
 * Normal v0/v1 execution remains unchanged.
 *
 * @param {{runner?:Function,attackLayer?:Function,layers?:object}} [deps]
 * @returns {{manifest:object,diagnostic:object,rawDevelopment:object|null}}
 */
function runFutureSightIssue25V2(deps={}){
  const run=deps.runner??runDevelopment;
  const layer=deps.attackLayer??withPrintedOwnerAttackFrontier;
  const selected=runSelectedIssue25V0({
    runner:run,
    layers:{...deps.layers,firstBlockedPromptEnvelope:layer}
  });
  const report=selected.diagnostic.audit?.firstBlockedPromptEnvelope??null;
  const manifest={
    ...selected.manifest,
    version:VERSION,
    profile:'48-root-historical-one-printed-futuresight-prompt-v2',
    policyEntryPoint:EXTRA_SOURCE_PATHS[0],
    selectedOuterToInner:[
      ...selected.manifest.selectedOuterToInner.slice(0,-1),
      'sourceStampedOriginObserver','sourceStampedFutureSightOwnerOrder',
      'canonicalActorCommonRunner'
    ],
    sourceIndependentCommonPolicy:false,
    includedSourceStampedOrder:'Duskull VIV Future Sight',
    addedOwnerAttackScope:'revealed-four-neutral-order-no-identities-read',
    noNightWatchOrGetLostActionSelected:true,
    resolvedSourceAndPolicyHashes:[
      ...selected.manifest.resolvedSourceAndPolicyHashes,
      ...EXTRA_SOURCE_PATHS.map(hashRegisteredFile)
    ],
    fullDecisionPolicySymmetryCertified:false,
    releaseQualified:false,competitiveGamesQualified:0
  };
  const diagnostic={
    ...selected.diagnostic,
    schema:VERSION,
    sourceStampedFutureSight:report?.sourceStampedFutureSight??null,
    printedAttackOrigins:report?.printedAttackOrigins??null,
    verdict:'FAIL-development-attacks-still-open',
    competitiveGamesQualified:0
  };
  return {manifest,diagnostic,rawDevelopment:selected.rawDevelopment};
}
module.exports={VERSION,EXTRA_SOURCE_PATHS,
  withPrintedOwnerAttackFrontier,runFutureSightIssue25V2};
