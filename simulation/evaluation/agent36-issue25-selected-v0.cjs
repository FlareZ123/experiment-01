'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {developmentTrials,runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {reconcileRegisteredAttempts:reconcileRawRegisteredAttempts}=
  require('./agent3-registered-attempt-reconciliation.cjs');
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
  'simulation/evaluation/agent3-registered-attempt-reconciliation.cjs',
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
  'scripts/aichi-new-moon-candidate.cjs',
  'simulation/evaluation/aichi-pilot.cjs',
  'simulation/twinleaf/new-moon-lockbreak-validate.cjs',
  'simulation/twinleaf/headless.cjs',
  'simulation/twinleaf/newmoon-garbotoxin-blower-autonomy.cjs',
  'simulation/twinleaf/forest-stone-v-recipient-policy.cjs',
  'simulation/twinleaf/candidate-stone-star-alchemy-policy.cjs',
  'results/als/new-moon-lockbreak-english-proxy-60.json',
  'results/als/new-moon-official-japanese-print-60.json',
  'results/als/new-moon-perfection-english-map.json',
  'results/legality/japan-expanded-aichi-2026.json',
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
 * This is an actual Git observation of the running checkout, independent
 * of declared manifest SHA or the expected submodule gitlink.
 * Failure is UNKNOWN and never silently transformed into the expected SHA.
 * @param {string} relativePath
 * @returns {string|null}
 */
function observedGitRevision(relativePath){
  try{
    const sha=execFileSync('git',[
      '-C',path.join(ROOT,relativePath),'rev-parse','HEAD'
    ],{encoding:'utf8'}).trim();
    return /^[a-f0-9]{40}$/.test(sha)?sha:null;
  }catch(error){
    return null;
  }
}

/**
 * Exact identity reconciliation. Aborted, capped and failed trials must
 * retain their registered ID and count as attempted only once.
 * @param {string[]} expected
 * @param {(string|null)[]} actual
 */
/**
 * A compact SHA-256 receipt of every research-owned module actually loaded
 * through Node's module cache. This complements direct printed-deck hashes
 * and the observed vendor gitlink; it does not claim all hooks executed.
 * @returns {{moduleCount:number,sha256:string,scope:string}}
 */
function observedLoadedResearchModuleDigest(){
  const prefix=path.join(ROOT,'simulation')+path.sep;
  const modules=Object.keys(require.cache??{}).filter(file=>
    file.startsWith(prefix)&&/\.(?:cjs|js)$/.test(file)).sort();
  const hash=createHash('sha256');
  for(const file of modules){
    hash.update(path.relative(ROOT,file).split(path.sep).join('/'));
    hash.update('\0');
    hash.update(fs.readFileSync(file));
    hash.update('\0');
  }
  return {moduleCount:modules.length,sha256:hash.digest('hex'),
    scope:'actually-loaded-research-module-source-files'};
}

function reconcileRegisteredAttempts(expected,actual){
  assert.ok(Array.isArray(expected)&&Array.isArray(actual));
  const expectedSet=new Set(expected),actualSet=new Set(actual);
  const duplicates=values=>{
    const seen=new Set(),double=new Set();
    for(const value of values){
      if(seen.has(value))double.add(value);
      seen.add(value);
    }
    return [...double];
  };
  const duplicateExpected=duplicates(expected);
  const duplicateReturned=duplicates(actual);
  const missing=expected.filter(id=>!actualSet.has(id));
  const unexpected=actual.filter(id=>!expectedSet.has(id));
  const exactUniqueMatch=expected.length===actual.length&&
    duplicateExpected.length===0&&duplicateReturned.length===0&&
    missing.length===0&&unexpected.length===0;
  return {expectedCount:expected.length,returnedCount:actual.length,
    uniqueExpectedCount:expectedSet.size,
    uniqueReturnedCount:actualSet.size,duplicateExpected,
    duplicateReturned,missing,unexpected,exactUniqueMatch};
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
  const registeredAttemptReconciliation=reconcileRegisteredAttempts(
    expected,statuses.map(row=>row.id));
  const rawRowIdentityReconciliation=
    reconcileRawRegisteredAttempts(expected,rows);
  const expectedTwinleaf=
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
  const observedTwinleaf=observedGitRevision('vendor/twinleaf');
  const observedRepository=observedGitRevision('.');
  const envGitSha=process.env.GITHUB_SHA??null;
  const runtimeGitAttestationStatus=
    !observedTwinleaf||!observedRepository?'UNRESOLVED':
    observedTwinleaf!==expectedTwinleaf||
      (envGitSha!==null&&observedRepository!==envGitSha)?
      'MISMATCH':'VERIFIED';
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
    outerOwnerPromptWrappersSelectedForBothSeats:true,
    fullDecisionPolicySymmetryCertified:false,
    originalSourceRanks:[6,11],
    originalSourceRegistration:'agent41-crossrank-r6-r11-v1-20261019',
    historicalOnly:true,
    expectedPinnedTwinleafGitlink:expectedTwinleaf,
    observedTwinleafGitCommit:observedTwinleaf,
    observedRepositoryGitCommit:observedRepository,
    ciRepositoryRevision:envGitSha,
    runtimeGitAttestationStatus,
    runtimeInputHashScope:'direct-selected-modules-and-deck-inputs',
    observedLoadedResearchModuleDigest:observedLoadedResearchModuleDigest(),
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
    allRegisteredAttemptsReturned:
      registeredAttemptReconciliation.exactUniqueMatch&&
      rawRowIdentityReconciliation.exactlyReconciled,
    registeredAttemptReconciliation,
    rawRowIdentityReconciliation,
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
  hashRegisteredFile,observedGitRevision,reconcileRegisteredAttempts,
  observedLoadedResearchModuleDigest,runSelectedIssue25V0};
