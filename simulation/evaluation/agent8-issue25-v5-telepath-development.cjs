'use strict';

const assert = require('node:assert/strict');
const {withOwnerTelepathicBenchSearch} =
  require('../twinleaf/agent8-owner-telepathic-bench-search.cjs');
const {runStewardInnermostPrizeV5} =
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const {hashRegisteredFile} =
  require('./agent36-issue25-selected-v0.cjs');

const VERSION = 'agent8-issue25-v5-plus-telepath-retro-v1';
const EXTRA_HASH_PATHS = Object.freeze([
  'simulation/evaluation/agent8-issue25-v5-telepath-development.cjs',
  'simulation/twinleaf/agent8-owner-telepathic-bench-search.cjs',
  'tests/agent8-owner-telepathic-bench-search.test.cjs',
  'tests/agent8-owner-telepathic-bench-search.native.test.cjs',
  'tests/agent8-issue25-v5-telepath-development.test.cjs',
  'tests/agent8-issue25-v5-telepath-development.native.test.cjs'
]);

/**
 * Install once outside the selected v5 headless patch, so it executes INSIDE
 * the selected Prize/Promotion handlers at the original native runMatch call.
 * The Telepath native bot decoder is consequently the last installed decoder.
 * @template T
 * @param {()=>T} next Run one full original-source batch.
 * @param {{headless?:{runMatch:Function},telepath?:Function}} [deps] Pure-test seam.
 * @returns {{result:T,audit:object}}
 */
function withTelepathInsideNativeMatches(next, deps = {}) {
  assert.equal(typeof next, 'function');
  const headless = deps.headless ?? require('../twinleaf/headless.cjs');
  const telepath = deps.telepath ?? withOwnerTelepathicBenchSearch;
  const old = headless.runMatch;
  assert.equal(typeof old, 'function');
  assert.equal(typeof telepath, 'function');
  const matches = [];
  function wrappedRunMatch(request) {
    const label = request?.label ?? null;
    try {
      const outcome = telepath(() => old(request));
      matches.push({label, disposition: 'returned-unqualified',
        telepath: outcome.audit, qualifiedGames: 0});
      return outcome.result;
    } catch (error) {
      matches.push({label, disposition: 'engine-aborted-unqualified',
        telepath: error?.ownerTelepathicAudit ?? null, qualifiedGames: 0});
      throw error;
    }
  }
  headless.runMatch = wrappedRunMatch;
  try {
    return {result: next(), audit: {
      version: VERSION, nativeMatchCalls: matches.length,
      nativeMatchAttempts: matches,
      ownerOnlyPostSearchChoice: true,
      sourceIndependentBothSeats: true,
      competitiveGamesQualified: 0
    }};
  } finally {
    assert.strictEqual(headless.runMatch, wrappedRunMatch,
      'Concurrent headless.runMatch patch survived Telepath experiment');
    headless.runMatch = old;
  }
}

/**
 * This is a separate, unselected retrospective treatment of the exact same
 * v5 eight original rank6/rank11 physical registrations and root48 horizon.
 * No candidate, source seed, paper qualification or match result is selected.
 * @param {{innerLayer?:Function, v5Deps?:object}} [deps] Pure injection.
 * @returns {{manifest:object,diagnostic:object,rawDevelopment:object|null}}
 */
function runIssue25V5WithTelepath(deps = {}) {
  const layer = deps.innerLayer ?? withTelepathInsideNativeMatches;
  const wrapped = layer(() => runStewardInnermostPrizeV5(deps.v5Deps));
  const original = wrapped.result;
  assert.ok(original?.manifest && original?.diagnostic);
  return {
    ...original,
    manifest: {
      ...original.manifest,
      version: VERSION,
      profile: 'retrospective-v5-eight-registered-48root-plus-owner-telepath',
      policyEntryPoint: EXTRA_HASH_PATHS[0],
      addedNativePromptLayer: 'owner-telepathic-basic-psychic-bench-search',
      separateTreatmentAgainstUnchangedSelectedV5: true,
      sourceIndependentCommonPolicy: true,
      resolvedSourceAndPolicyHashes: [
        ...original.manifest.resolvedSourceAndPolicyHashes,
        ...EXTRA_HASH_PATHS.map(hashRegisteredFile)
      ],
      releaseQualified: false,
      competitiveGamesQualified: 0
    },
    diagnostic: {
      ...original.diagnostic,
      schema: VERSION,
      nativeOwnerTelepathicAudit: wrapped.audit,
      verdict: 'FAIL-retrospective-development-only',
      competitiveGamesQualified: 0
    }
  };
}

module.exports = {VERSION, EXTRA_HASH_PATHS,
  withTelepathInsideNativeMatches, runIssue25V5WithTelepath};
