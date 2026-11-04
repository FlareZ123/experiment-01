'use strict';

const assert=require('node:assert/strict');
const {runMirroredIssue25V6}=
  require('./agent1-issue25-mirrored-r6-r11-v6.cjs');
const {hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');
const {withOwnerProtectedMultiBasicStore}=
  require('../twinleaf/agent50-owner-protected-multibasic-store.cjs');

const VERSION='agent1-issue25-mirrored-protected-entry-opening-v7-development';
const EXTRA_HASH_PATHS=[
  'simulation/evaluation/agent1-issue25-protected-opening-v7.cjs',
  'simulation/twinleaf/agent50-owner-protected-multibasic-store.cjs',
  'simulation/twinleaf/agent50-owner-preserve-turn-entry-setup.cjs',
  'results/aichi-2026/registrations/agent1-issue25-protected-opening-v7-20261104.json',
  'tests/agent1-issue25-protected-opening-v7.test.cjs',
  'tests/agent1-issue25-protected-opening-v7.native.test.cjs'
];

/**
 * Predeclared single-variable setup-policy comparison against the exact v6
 * mirrored source-rank-seat seeds. Only the initial Basic/optional bonus Bench
 * chooser changes. Native Store validates actual physical placements and
 * retained printed support Basics; all attack/resource adapters stay v6.
 *
 * @param {{runner?:Function,layers?:Record<string,Function>,
 *  attackLayer?:Function,openingLayer?:Function}} [deps]
 */
function runProtectedOpeningMirroredV7(deps={}){
  const opening=deps.openingLayer??withOwnerProtectedMultiBasicStore;
  assert.equal(typeof opening,'function');
  const selected=runMirroredIssue25V6({
    runner:deps.runner,
    layers:{...deps.layers,agent50AllEligibleInitialBasics:opening},
    attackLayer:deps.attackLayer
  });
  const openingAudit=selected.diagnostic.audit?.agent50AllEligibleInitialBasics??null;
  const manifest={
    ...selected.manifest,
    version:VERSION,
    profile:'preregistered-same-seed-eight-arm-entry-support-preserving-opening-variant',
    policyEntryPoint:EXTRA_HASH_PATHS[0],
    selectedOpening:'agent50OwnerProtectedMultiBasicStore',
    baselineOpening:'agent50AllEligibleInitialBasics',
    selectedOuterToInner:selected.manifest.selectedOuterToInner.map(x=>
      x==='agent50AllEligibleInitialBasics'?
        'agent50OwnerProtectedMultiBasicStore':x),
    singlePredeclaredChange:'owner-only setup Basic and optional compensation Bench policy',
    preregisteredOpeningContrast:
      EXTRA_HASH_PATHS[3],
    sourceSpecificOpeningScriptsSelected:false,
    originalSixtiesAndSeedsUnchanged:true,
    openedEligibleSupportRetainedNativeVerified:
      openingAudit?.missingPhysicalPlacements===0&&
      openingAudit?.initialAccepted>0,
    completeOwnerInformationNoninterferenceCertified:false,
    resolvedSourceAndPolicyHashes:[
      ...selected.manifest.resolvedSourceAndPolicyHashes,
      ...EXTRA_HASH_PATHS.map(hashRegisteredFile)
    ],
    releaseQualified:false,competitiveGamesQualified:0
  };
  const diagnostic={
    ...selected.diagnostic,
    schema:VERSION,
    protectedOpeningAudit:openingAudit,
    protectedOpeningNativeSelectionCount:
      openingAudit?.initialAccepted??null,
    protectedOpeningNativeUnverifiedPhysicalPlacements:
      openingAudit?.missingPhysicalPlacements??null,
    verdict:'FAIL-protected-opening-causal-development-only',
    competitiveGamesQualified:0
  };
  return {manifest,diagnostic,rawDevelopment:selected.rawDevelopment};
}

module.exports={VERSION,EXTRA_HASH_PATHS,runProtectedOpeningMirroredV7};
