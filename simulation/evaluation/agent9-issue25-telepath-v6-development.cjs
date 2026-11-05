'use strict';

const {runStewardInnermostPrizeV5} =
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const {withOwnerTelepathicBenchSearch} =
  require('../twinleaf/agent8-owner-telepathic-bench-search.cjs');
const {hashRegisteredFile} =
  require('./agent36-issue25-selected-v0.cjs');

const VERSION = 'agent9-issue25-telepath-v6-same-eight-development';
const HASH_PATHS = Object.freeze([
  'simulation/evaluation/agent9-issue25-telepath-v6-development.cjs',
  'simulation/twinleaf/agent8-owner-telepathic-bench-search.cjs',
  'tests/agent9-issue25-telepath-v6.native.test.cjs'
]);

/**
 * Retrospective, controlled eight-arm successor to the unchanged steward v5.
 * Both physical seats receive exactly the same previously developed Telepath
 * from-hand search continuation. It wraps the actual native Store and bot,
 * leaving all selected v5 component hooks and the frozen root cap untouched.
 *
 * @returns {{manifest:object,diagnostic:object,rawDevelopment:object|null}}
 */
function runTelepathV6() {
  const wrapped = withOwnerTelepathicBenchSearch(
    () => runStewardInnermostPrizeV5()
  );
  const v5 = wrapped.result;
  return {
    manifest: {
      ...v5.manifest,
      version: VERSION,
      policyEntryPoint: HASH_PATHS[0],
      comparisonType: 'retrospective-same-deal-telepath-owner-prompt-only',
      selectedV5Version: v5.manifest.version,
      sourceIndependentCommonPolicy: true,
      rootCapUnchanged: true,
      telepathicFromHandOriginOnly: true,
      nativeOwnerSearchPaperQualified: false,
      resolvedSourceAndPolicyHashes: [
        ...v5.manifest.resolvedSourceAndPolicyHashes,
        ...HASH_PATHS.map(hashRegisteredFile)
      ],
      releaseQualified: false,
      competitiveGamesQualified: 0
    },
    diagnostic: {
      ...v5.diagnostic,
      schema: VERSION,
      telepathicOwnerContinuationAudit: wrapped.audit,
      verdict: 'FAIL-retrospective-owner-prompt-only-development',
      competitiveGamesQualified: 0
    },
    rawDevelopment: v5.rawDevelopment
  };
}

module.exports = {VERSION, HASH_PATHS, runTelepathV6};
