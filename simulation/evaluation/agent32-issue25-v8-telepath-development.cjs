'use strict';

const assert=require('node:assert/strict');
const {withTelepathInsideNativeMatches}=require('./agent8-issue25-v5-telepath-development.cjs');
const {runStewardBroaderV8}=require('./agent36-issue25-common-v8.cjs');
const {hashRegisteredFile}=require('./agent36-issue25-selected-v0.cjs');

const VERSION='agent32-issue25-v8-plus-telepath-retro-v1';
const EXTRA_HASH_PATHS=Object.freeze([
  'simulation/evaluation/agent32-issue25-v8-telepath-development.cjs',
  'simulation/evaluation/agent8-issue25-v5-telepath-development.cjs',
  'simulation/twinleaf/agent8-owner-telepathic-bench-search.cjs',
  'tests/agent8-owner-telepathic-bench-search.test.cjs',
  'tests/agent8-owner-telepathic-bench-search.native.test.cjs',
  'tests/agent32-issue25-v8-telepath-development.test.cjs',
  'tests/agent32-issue25-v8-telepath-development.native.test.cjs',
  '.github/workflows/twinleaf-completion.yml'
]);

/**
 * Separate, failure-inclusive retrospective treatment of the exact v8
 * eight-arm registration and 128-root cap. Reuses Agent8's already validated
 * owner-only Telepath prompt handler at the real headless.runMatch boundary.
 * It does not change the selected v8 policy or qualify any game.
 *
 * @param {{innerLayer?:Function,runV8?:Function,v8Deps?:object,
 *   headless?:object,telepath?:Function}} [deps]
 * @returns {{manifest:object,diagnostic:object,rawDevelopment:object|null}}
 */
function runIssue25V8WithTelepath(deps={}){
  const layer=deps.innerLayer??withTelepathInsideNativeMatches;
  const runV8=deps.runV8??runStewardBroaderV8;
  assert.equal(typeof layer,'function');
  assert.equal(typeof runV8,'function');
  const wrapped=layer(()=>runV8(deps.v8Deps),{
    headless:deps.headless,telepath:deps.telepath
  });
  assert.ok(wrapped&&typeof wrapped==='object');
  assert.ok(wrapped.result?.manifest&&wrapped.result?.diagnostic);
  assert.ok(wrapped.audit&&typeof wrapped.audit==='object');
  const original=wrapped.result;
  return {
    ...original,
    manifest:{
      ...original.manifest,
      version:VERSION,
      profile:'retrospective-v8-eight-registered-128root-plus-owner-telepath',
      policyEntryPoint:EXTRA_HASH_PATHS[0],
      addedNativePromptLayer:'agent8-owner-telepathic-psychic-bench-search-v1',
      separateTreatmentAgainstUnchangedSelectedV8:true,
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
      nativeOwnerTelepathicAudit:wrapped.audit,
      verdict:'FAIL-retrospective-development-only',
      competitiveGamesQualified:0
    }
  };
}

module.exports={VERSION,EXTRA_HASH_PATHS,runIssue25V8WithTelepath};
