'use strict';

const assert=require('node:assert/strict');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {runStewardInnermostPrizeV5}=
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const {hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');

const VERSION='agent8-issue25-steward-v5-native-trainer-fallback-v6-development';
const EXTRA_HASH_PATHS=Object.freeze([
  'simulation/evaluation/agent8-issue25-trainer-v6-development.cjs',
  'simulation/twinleaf/agent50-native-owner-trainer-pass-bridge.cjs',
  'simulation/twinleaf/agent49-trainer-hand-payment-veto.cjs',
  'tests/agent8-issue25-trainer-v6-development.test.cjs',
  'tests/agent8-issue25-trainer-v6-development.native.test.cjs'
]);

/**
 * Preserve all currently selected flags and registration; change only the
 * previously proven, default-off, common owner Trainer fallback flag.
 * This native-bot advice is not information-set-safe or paper-certified.
 * @param {object} input Options from the frozen v5 runner.
 * @returns {object} Fresh, opt-in treatment options.
 */
function withNativeTrainerFallbackOptions(input){
  assert.ok(input&&typeof input==='object');
  assert.equal(input.actorOnlyComposition,true,
    'Owner Trainer fallback requires the existing canonical actor policy');
  assert.equal(input.sourceIndependentCommonPolicy,true,
    'The native Trainer treatment must have an identical policy on both seats');
  assert.equal(input.nativeOwnerTrainerFallback??false,false,
    'The control must have the generic Trainer fallback disabled');
  assert.equal(input.nativeRootActionLimit,48,
    'Preserve the previously frozen 48-root horizon');
  assert.ok(Array.isArray(input.registeredTrials)&&
    input.registeredTrials.length===8,
    'Preserve all eight already registered trial IDs');
  return {...input,nativeOwnerTrainerFallback:true};
}

/**
 * Retrospective, within-fixed-opening one-factor comparison with the
 * steward's developmental v5 control. Never label these games qualified.
 * Exact source deck, candidate 60s, both seats, and trial IDs are inherited.
 * @param {{runner?:Function,innerLayer?:Function,layers?:object,
 *   attackLayer?:Function}} [deps] Pure injection seams.
 * @returns {object} Development-only candidate with complete raw ledger.
 */
function runIssue25NativeTrainerV6(deps={}){
  const run=deps.runner??runDevelopment;
  assert.equal(typeof run,'function');
  const selected=runStewardInnermostPrizeV5({
    ...deps,
    runner:options=>run(withNativeTrainerFallbackOptions(options))
  });
  const inherited=selected.manifest;
  assert.equal(inherited.originalRegisteredTrialCount,8);
  assert.equal(inherited.nativeRootActionLimit,48);
  assert.equal(selected.diagnostic.selectedNativeAttempts.length,8);
  return {
    ...selected,
    manifest:{
      ...inherited,
      version:VERSION,
      profile:'retrospective-v5-original-eight-common-native-trainer-fallback-48root-v6',
      policyEntryPoint:EXTRA_HASH_PATHS[0],
      treatmentOption:'nativeOwnerTrainerFallback:true',
      comparisonControl:'agent36-issue25-steward-owner-prize-promotion-v5-retro',
      nativeTrainerPreferenceInformationSetSafe:false,
      trainerPaperPaymentVerified:false,
      sourceIndependentCommonPolicy:true,
      sourceDealMatchingWithinIdenticalTrialRequired:true,
      resolvedSourceAndPolicyHashes:[
        ...inherited.resolvedSourceAndPolicyHashes,
        ...EXTRA_HASH_PATHS.map(hashRegisteredFile)
      ],
      releaseQualified:false,
      competitiveGamesQualified:0
    },
    diagnostic:{
      ...selected.diagnostic,
      schema:VERSION,
      observedNativeTrainerTreatment:true,
      nativeTrainerPreferenceInformationSetSafe:false,
      ownerTrainerPaperPaymentVerified:false,
      verdict:'FAIL-default-off-retrospective-trainer-policy-development-only',
      competitiveGamesQualified:0
    }
  };
}

module.exports={VERSION,EXTRA_HASH_PATHS,
  withNativeTrainerFallbackOptions,runIssue25NativeTrainerV6};
