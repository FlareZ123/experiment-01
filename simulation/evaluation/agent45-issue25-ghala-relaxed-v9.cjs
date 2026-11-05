'use strict';

const {runAgent45GuzmaHalaV8,
  withNativeTagThenGuzmaHalaInsideSelectedV5}=
  require('./agent45-issue25-ghala-followup-v8.cjs');
const {hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');

const VERSION='agent45-issue25-relaxed-two-owner-card-ghala-v9-retro';
const HASH_PATHS=Object.freeze([
  'results/aichi-2026/registrations/agent45-issue25-ghala-relaxed-payment-v9-20261105.json',
  'simulation/evaluation/agent45-issue25-ghala-relaxed-v9.cjs',
  'tests/agent45-owner-ghala-relaxed-cost.test.cjs',
  'tests/agent45-issue25-ghala-relaxed-v9.native.test.cjs'
]);

/**
 * The complete v8 native owner sequence is unchanged, except that the
 * after-authenticated-Tag-Call G&H options may select two actual owner
 * hand cards regardless of their discard penalty. This is a structural
 * payment feasibility test and intentionally forfeits the v8 DCI guard.
 * Source names/roles, original eight initial deals and cap are identical.
 *
 * @param {object} [deps] Optional original runner injections for pure tests.
 * @returns {{manifest:object,diagnostic:object,rawDevelopment:object|null}}
 */
function runAgent45GuzmaHalaRelaxedV9(deps={}){
  const selected=runAgent45GuzmaHalaV8({
    ...deps,
    innerLayer:deps.innerLayer??(next=>
      withNativeTagThenGuzmaHalaInsideSelectedV5(next,{
        halaOptions:{maxDiscardPenalty:Number.POSITIVE_INFINITY}
      }))
  });
  return {
    manifest:{
      ...selected.manifest,
      version:VERSION,
      policyEntryPoint:HASH_PATHS[1],
      comparisonBaseline:'actual-accepted-native-v8-conservative-cost-40',
      singleTreatment:'relaxed-owner-visible-G&H-two-card-payment-cutoff',
      originalRegisteredSourceAndCandidateSixtiesUnchanged:true,
      originalNativeRootCap:48,
      optimizationOrStrategicDominanceCertified:false,
      competitiveGamesQualified:0,
      releaseQualified:false,
      resolvedSourceAndPolicyHashes:[
        ...selected.manifest.resolvedSourceAndPolicyHashes,
        ...HASH_PATHS.map(hashRegisteredFile)
      ]
    },
    diagnostic:{
      ...selected.diagnostic,schema:VERSION,
      verdict:'FAIL-retrospective-relaxed-cost-structural-test-only',
      competitiveGamesQualified:0
    },
    rawDevelopment:selected.rawDevelopment
  };
}

module.exports={VERSION,HASH_PATHS,runAgent45GuzmaHalaRelaxedV9};
