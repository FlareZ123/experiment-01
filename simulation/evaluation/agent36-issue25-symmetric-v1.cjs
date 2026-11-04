'use strict';
const assert=require('node:assert/strict');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {hashRegisteredFile,runSelectedIssue25V0}=
  require('./agent36-issue25-selected-v0.cjs');
const VERSION='agent36-issue25-symmetric-v1-source-independent-resource-development';
const EXTRA_HASH_PATHS=[
  'simulation/evaluation/agent36-issue25-symmetric-v1.cjs',
  'simulation/evaluation/agent36-bilateral-two-seat-common-policy.cjs',
  'tests/agent36-issue25-symmetric-v1.native.test.cjs'
];

/**
 * Use the same actually executing owner-prompt wrapper stack as the frozen
 * v0 and alter ONLY the underlying common runner's source-rank / candidate
 * resource asymmetry switch. Retain all four historical source-deal attempts.
 * This is a developmental source-independence counterfactual, not a vetted
 * bilateral game policy or an admissible win sample.
 *
 * @param {{runner?:(options:object)=>object}} [deps] Deterministic pure-test seam.
 * @returns {{manifest:object,diagnostic:object,rawDevelopment:object|null}}
 */
function runSymmetricIssue25V1(deps={}){
  const run=deps.runner??runDevelopment;
  assert.equal(typeof run,'function');
  const result=runSelectedIssue25V0({
    runner:options=>run({...options,sourceIndependentCommonPolicy:true}),
    layers:deps.layers,
    registeredTrialIds:deps.registeredTrialIds
  });
  const indicated=result.rawDevelopment?.sourceIndependentCommonPolicyOptIn;
  const manifest={
    ...result.manifest,
    version:VERSION,
    profile:'fixed-48-action-source-independent-two-seat-development-v1',
    policyEntryPoint:EXTRA_HASH_PATHS[0],
    sourceIndependentCommonPolicy:true,
    actualRunnerConfirmedOption:indicated===true,
    selectedSameAgent41ResourceAdaptersForBothSeats:true,
    originalSourceRankScriptsDisabledByOptIn:true,
    resolvedSourceAndPolicyHashes:[
      ...result.manifest.resolvedSourceAndPolicyHashes,
      ...EXTRA_HASH_PATHS.map(hashRegisteredFile)
    ],
    knownStructuralVetoes:{
      ...result.manifest.knownStructuralVetoes,
      sourceRankSpecificNativeScripts:false,
      candidateSeatSpecificLegacyCommonHooks:false,
      actualTwoSeatResourceVersionConfirmedByNativeRows:false,
      rawNativeFallbackStillUnqualified:true
    },
    releaseQualified:false,competitiveGamesQualified:0
  };
  const nativeRows=result.rawDevelopment?.rows??[];
  const positiveRows=nativeRows.filter(row=>
    row.status===undefined&&row.policyAudit?.twoSeatVersion);
  const twoSeatVersion=positiveRows[0]?.policyAudit?.twoSeatVersion??null;
  if(positiveRows.length>0&&positiveRows.every(row=>
    row.policyAudit?.twoSeatVersion===twoSeatVersion&&
    row.policyAudit?.installedPhysicalSeats?.join(',')==='0,1')){
    manifest.knownStructuralVetoes.actualTwoSeatResourceVersionConfirmedByNativeRows=true;
  }
  const diagnostic={
    ...result.diagnostic,
    schema:VERSION,
    observedTwoSeatResourcePolicyRows:positiveRows.length,
    observedSameResourcePolicyVersion:twoSeatVersion,
    reportedSourceIndependentOptIn:indicated??null,
    verdict:'FAIL-complete-development-policy-qualification',
    competitiveGamesQualified:0
  };
  return {manifest,diagnostic,rawDevelopment:result.rawDevelopment};
}
module.exports={VERSION,EXTRA_HASH_PATHS,runSymmetricIssue25V1};
