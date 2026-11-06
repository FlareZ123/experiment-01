'use strict';

const assert=require('node:assert/strict');
const {runIssue25V8WithTelepath}=require('./agent32-issue25-v8-telepath-development.cjs');
const {withOwnerAbilityConfirmPolicy}=require('../twinleaf/agent36-owner-ability-confirm-policy.cjs');
const {withRadiantZeroGateHook}=require('../twinleaf/agent1-radiant-zero-gate-hook.cjs');
const {withOwnerTelepathicBenchSearch}=require('../twinleaf/agent8-owner-telepathic-bench-search.cjs');
const {hashRegisteredFile}=require('./agent36-issue25-selected-v0.cjs');

const VERSION='agent36-issue25-v8-owner-ability-policy-retro-v1';
const EXTRA_HASH_PATHS=Object.freeze([
  'simulation/evaluation/agent36-issue25-v8-owner-ability-policy.cjs',
  'simulation/twinleaf/agent36-owner-ability-confirm-policy.cjs',
  'simulation/twinleaf/agent1-radiant-zero-gate-hook.cjs',
  'tests/agent1-radiant-zero-gate-native.test.cjs',
  'simulation/twinleaf/agent8-owner-telepathic-bench-search.cjs',
  'simulation/twinleaf/prompt-integrity.cjs',
  'simulation/evaluation/agent32-issue25-v8-telepath-development.cjs',
  'simulation/evaluation/agent36-issue25-common-v8.cjs',
  'simulation/evaluation/agent36-issue25-selected-v0.cjs',
  'simulation/evaluation/agent37-candidate-attack-settlement.cjs',
  'tests/agent36-owner-ability-confirm-policy.test.cjs',
  'tests/agent36-v8-owner-ability-policy.native.test.cjs',
  '.github/workflows/twinleaf-completion.yml'
]);

/**
 * Compose the same owner-only Telepath handler with the state-based ability
 * Confirm policy. Both wrappers run at the real native Store boundary.
 * @param {()=>any} run
 * @returns {{result:any,audit:object}}
 */
function withTelepathAndOwnerAbilityPolicy(run){
  let telepathAudit=null;
  // Existing Agent1 source-scoped paper repair is nested at the native Store
  // boundary. It restores the mandatory shuffle/end turn on legal [] choices.
  const radiant=withRadiantZeroGateHook(()=>
    withOwnerAbilityConfirmPolicy(()=>{
      const telepath=withOwnerTelepathicBenchSearch(run);
      telepathAudit=telepath.audit;
      return telepath.result;
    })
  );
  return {
    result:radiant.result.result,
    audit:{
      version:VERSION,
      ownerAbilityConfirm:radiant.result.audit,
      radiantZeroGate:radiant.audit,
      telepath:telepathAudit
    }
  };
}

/**
 * Retrospective same-eight prompt-policy probe. It does not replace the
 * selected common v8 policy or qualify games.
 * @param {{v8Deps?:object}} [deps]
 * @returns {object}
 */
function runIssue25V8WithOwnerAbilityPolicy(deps={}){
  const original=runIssue25V8WithTelepath({
    ...deps,telepath:withTelepathAndOwnerAbilityPolicy
  });
  const audit=original.diagnostic.nativeOwnerTelepathicAudit;
  return {
    ...original,
    manifest:{
      ...original.manifest,
      version:VERSION,
      profile:'retrospective-v8-eight-registered-128root-owner-ability-confirm-policy',
      policyEntryPoint:EXTRA_HASH_PATHS[0],
      confirmPolicy:'owner-only Radiant Eternatus/Articuno-GX state-based decisions; false for other Confirm prompts',
      abilityPolicy:{
        radiantEternatus:'accept only when owner has bench capacity; choose legal VMAX targets from the genuine open search prompt; use the tested Agent1 mandatory empty-search shuffle/end-turn correction',
        articunoGX:'accept only when exact available Water Energy transfer makes Ice Wing cost payable; otherwise decline',
        goFirst:'false'
      },
      nativeOwnerAbilityPolicyAudit:audit,
      resolvedSourceAndPolicyHashes:[
        ...original.manifest.resolvedSourceAndPolicyHashes,
        ...EXTRA_HASH_PATHS.map(hashRegisteredFile)
      ],
      releaseQualified:false,
      competitiveGamesQualified:0
    },
    diagnostic:{
      ...original.diagnostic,
      schema:VERSION,
      nativeOwnerAbilityPolicyAudit:audit,
      verdict:'FAIL-retrospective-development-only',
      competitiveGamesQualified:0
    }
  };
}

module.exports={
  VERSION,EXTRA_HASH_PATHS,withTelepathAndOwnerAbilityPolicy,
  runIssue25V8WithOwnerAbilityPolicy
};
