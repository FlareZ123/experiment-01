'use strict';

const {runIssue25V8WithTelepath}=require('./agent32-issue25-v8-telepath-development.cjs');
const {withOwnerConfirmDefaultFalse}=require('../twinleaf/agent32-owner-confirm-default-false.cjs');
const {withOwnerTelepathicBenchSearch}=require('../twinleaf/agent8-owner-telepathic-bench-search.cjs');
const {hashRegisteredFile}=require('./agent36-issue25-selected-v0.cjs');

const VERSION='agent32-issue25-v8-telepath-plus-default-confirm-false-v1';
const EXTRA_HASH_PATHS=[
  'simulation/evaluation/agent32-issue25-v8-telepath-confirm-default-false.cjs',
  'simulation/twinleaf/agent32-owner-confirm-default-false.cjs',
  'tests/agent32-confirm-false.test.cjs',
  'tests/agent32-issue25-v8-telepath-confirm-default-false.test.cjs',
  'tests/agent32-issue25-v8-telepath-confirm-default-false.native.test.cjs',
  'vendor/twinleafgg/ptcg-server/src/simple-bot/prompt-resolver/confirm-prompt-resolver.ts',
  'vendor/twinleafgg/ptcg-server/src/game/store/prompts/confirm-prompt.ts',
  'vendor/twinleafgg/ptcg-server/src/game/store/actions/resolve-prompt-action.ts',
  'vendor/twinleafgg/ptcg-server/src/simple-bot/simple-tactics-ai.ts',
  '.github/workflows/twinleaf-completion.yml'
];

/**
 * @param {()=>any} run Native match callback.
 * @returns {{result:any,audit:object}}
 */
function withTelepathAndDefaultConfirmFalse(run){
  let telepathAudit=null;
  const confirm=withOwnerConfirmDefaultFalse(()=>{
    const telepath=withOwnerTelepathicBenchSearch(run);
    telepathAudit=telepath.audit;
    return telepath.result;
  });
  return {result:confirm.result,audit:{
    version:VERSION,confirm:confirm.audit,telepath:telepathAudit
  }};
}

/**
 * @param {{v8Deps?:object}} [deps]
 * @returns {object}
 */
function runIssue25V8WithTelepathAndDefaultConfirmFalse(deps={}){
  const original=runIssue25V8WithTelepath({
    ...deps,telepath:withTelepathAndDefaultConfirmFalse
  });
  const audit=original.diagnostic.nativeOwnerTelepathicAudit;
  return {
    ...original,
    manifest:{
      ...original.manifest,
      version:VERSION,
      profile:'retrospective-v8-eight-registered-128root-telepath-plus-default-confirm-false',
      addedNativePromptLayer:'agent8-owner-telepathic-bench-search+agent32-owner-confirm-default-false',
      nativeOwnerPromptAudit:audit,
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
      nativeOwnerPromptAudit:audit,
      verdict:'FAIL-development-only',
      competitiveGamesQualified:0
    }
  };
}

module.exports={
  VERSION,EXTRA_HASH_PATHS,withTelepathAndDefaultConfirmFalse,
  runIssue25V8WithTelepathAndDefaultConfirmFalse
};
