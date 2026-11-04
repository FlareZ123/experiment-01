'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {developmentTrials,runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {withGoFirstChoice}=
  require('../twinleaf/agent6-go-first-choice.cjs');
const {withOwnerStartingBasicChoice}=
  require('../twinleaf/agent50-owner-starting-basic-choice.cjs');
const {withOwnerPublicAcknowledgements}=
  require('../twinleaf/agent50-owner-public-acknowledgements.cjs');
const {withOwnerMandatoryShowCards}=
  require('../twinleaf/agent50-owner-mandatory-showcards.cjs');
const {withBlockedPromptEnvelope}=
  require('../twinleaf/agent50-first-blocked-prompt-envelope.cjs');
const {withNativeRawStateFallbackQuarantine}=
  require('../twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

const VERSION='agent36-issue25-selected-v0-48root-failclosed';
const ROOT=path.resolve(__dirname,'../..');
const SELECTED_OUTER_TO_INNER=Object.freeze([
  'nativeRawStateQuarantine',
  'declineGoFirstBothSeats',
  'agent50AllEligibleInitialBasics',
  'publicMulliganAndWaitAcks',
  'mandatoryInTurnShowCards',
  'firstBlockedPromptEnvelope',
  'canonicalActorCommonRunner'
]);
const CODE_PATHS=Object.freeze([
  'simulation/evaluation/agent36-issue25-selected-v0.cjs',
  'simulation/evaluation/agent41-bilateral-v2-development.cjs',
  'simulation/evaluation/agent41-bilateral-common-policy.cjs',
  'simulation/evaluation/agent7-canonical-actor-composition.cjs',
  'simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs',
  'simulation/twinleaf/agent6-go-first-choice.cjs',
  'simulation/twinleaf/agent50-owner-starting-basic-choice.cjs',
  'simulation/twinleaf/agent50-owner-public-acknowledgements.cjs',
  'simulation/twinleaf/agent50-owner-mandatory-showcards.cjs',
  'simulation/twinleaf/agent50-first-blocked-prompt-envelope.cjs',
  'simulation/twinleaf/rank6-broad-thorns-policy.cjs',
  'simulation/twinleaf/rank11-direct-boostshake.cjs',
  'results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json',
  'results/aichi-2026/full-decklists.json',
  'results/aichi-2026/benchmark-shadow-rider.md',
  'results/als/new-moon-lockbreak-60-candidate.md'
]);

/** @param {string} relativePath @returns {{path:string,sha256:string}} */
function hashRegisteredFile(relativePath){
  const file=path.join(ROOT,relativePath);
  return {path:relativePath,sha256:createHash('sha256')
    .update(fs.readFileSync(file)).digest('hex')};
}

/**
 * A deliberately strict, single ENTRY POINT for the previously executed
 * Agent50 V7 historical owner-choice wrapper stack. This v0 selects exactly
 * one of the conflicting starting-Basic policies. Source rank 6/11 scripted
 * policies and candidate-aware legacy resource hooks still run underneath.
 * Their asymmetry is an explicit FAIL, never a certification of a common
 * competitive player.
 *
 * @param {{
 *  runner?: (options:object)=>object,
 *  layers?: Record<string,(next:Function)=>{result:unknown,audit:object}>
 * }} [injected] Test injection only; native release uses the default stack.
 * @returns {{manifest:object,diagnostic:object,rawDevelopment:object|null}}
 */
function runSelectedIssue25V0(injected={}){
  const runner=injected.runner??runDevelopment;
  assert.equal(typeof runner,'function');
  const layers={
    nativeRawStateQuarantine:next=>
      withNativeRawStateFallbackQuarantine(next,{maxRecords:16}),
    declineGoFirstBothSeats:next=>withGoFirstChoice([false,false],next),
    agent50AllEligibleInitialBasics:withOwnerStartingBasicChoice,
    publicMulliganAndWaitAcks:withOwnerPublicAcknowledgements,
    mandatoryInTurnShowCards:withOwnerMandatoryShowCards,
    firstBlockedPromptEnvelope:withBlockedPromptEnvelope,
    ...injected.layers
  };
  const expected=developmentTrials().map(row=>row.id);
  assert.equal(expected.length,4);
  const audit={};
  let development=null,thrown=null;
  let next=()=>{
    development=runner({actorOnlyComposition:true,nativeRootActionLimit:48});
    return development;
  };
  // The single declared order is executed, rather than merely recorded.
  for(let i=SELECTED_OUTER_TO_INNER.length-2;i>=0;i--){
    const key=SELECTED_OUTER_TO_INNER[i];
    const oldNext=next;
    const wrapper=layers[key];
    assert.equal(typeof wrapper,'function',key);
    next=()=>{
      const wrapped=wrapper(oldNext);
      assert.ok(wrapped&&typeof wrapped==='object',key);
      audit[key]=wrapped.audit??null;
      return wrapped.result;
    };
  }
  try{next();}
  catch(error){
    thrown=error;
    audit.nativeRawStateQuarantine??=
      error?.nativeRawStateFallbackQuarantine??null;
  }
  const rows=Array.isArray(development?.rows)?development.rows:[];
  const statuses=rows.map(row=>({
    id:row.trial?.id??row.id??null,
    status:row.status??(row.finished===true?
      'native-terminal-unqualified':'returned-unqualified'),
    originalSourceSeat:row.sourceSeat??null,
    candidateSeat:row.candidateSeat??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    verifiedFirstTurn:row.verifiedFirstTurn??null,
    actualStarterSeat:row.actualStarterSeat??null,
    nativeRootActionCount:
      row.nativeRootActionCount??row.rootActionCount??null,
    finished:row.finished??null,
    nativeAbortProvenance:row.nativeAbortProvenance??null
  }));
  const quarantine=audit.nativeRawStateQuarantine;
  const manifest={
    version:VERSION,profile:'fixed-48-action-historical-development-v0',
    policyEntryPoint:CODE_PATHS[0],
    selectedOuterToInner:[...SELECTED_OUTER_TO_INNER],
    selectedOpening:'agent50AllEligibleInitialBasics',
    excludedOpenings:[
      'agent4SingleBasicBonusDecline',
      'agent21DevelopmentStartingBasics'
    ],
    selectedGoFirstChoices:[false,false],
    actorOnlyComposition:true,nativeRootActionLimit:48,
    firstNativeFallback:'fail-closed',
    actorPolicyAppliedToBothSeats:true,
    originalSourceRanks:[6,11],
    originalSourceRegistration:'agent41-crossrank-r6-r11-v1-20261019',
    historicalOnly:true,
    expectedPinnedTwinleafGitlink:
      'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    ciRepositoryRevision:process.env.GITHUB_SHA??null,
    resolvedSourceAndPolicyHashes:CODE_PATHS.map(hashRegisteredFile),
    knownStructuralVetoes:{
      sourceRankSpecificNativeScripts:true,
      candidateSeatSpecificLegacyCommonHooks:true,
      unhandledNativeAttackPrompts:true,
      completeOwnerInformationNoninterferenceCertified:false,
      paperPaymentsCertified:false,
      fullOriginalFieldCertified:false,
      opponentCompetenceCertified:false,
      officialPaperClockCertified:false
    },
    releaseQualified:false,competitiveGamesQualified:0
  };
  const diagnostic={
    schema:VERSION,registered:expected,
    attemptedRows:statuses,
    allRegisteredAttemptsReturned:rows.length===expected.length,
    audit,
    rawDecoderExecuted:
      quarantine?.originalNativeDecoderExecuted??null,
    fallbackCalls:quarantine?.rawStateFallbackCalls??null,
    fallbackPromptEnvelopes:
      audit.firstBlockedPromptEnvelope?.envelopes??null,
    thrownCode:thrown?.code??null,
    thrownMessage:thrown?.message??null,
    verdict:'FAIL-development-policy-only',
    competitiveGamesQualified:0
  };
  return {manifest,diagnostic,rawDevelopment:development};
}
module.exports={VERSION,SELECTED_OUTER_TO_INNER,CODE_PATHS,
  hashRegisteredFile,runSelectedIssue25V0};
