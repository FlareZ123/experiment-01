'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {runDevelopment} = require('./agent41-bilateral-v2-development.cjs');
const {hashRegisteredFile} = require('./agent36-issue25-selected-v0.cjs');
const {runSymmetricIssue25V1} = require('./agent36-issue25-symmetric-v1.cjs');
const {withPrintedOwnerAttackFrontier} =
  require('./agent36-issue25-printed-futuresight-v2.cjs');
const {withSourceStampedNightWatchOwner} =
  require('../twinleaf/agent36-source-stamped-nightwatch-owner.cjs');

const VERSION = 'agent1-issue25-joined-symmetric-resource-printed-attacks-v4-development';
const EXTRA_HASH_PATHS = [
  'simulation/evaluation/agent1-issue25-joined-two-seat-attacks-v4.cjs',
  'simulation/evaluation/agent36-issue25-symmetric-v1.cjs',
  'simulation/evaluation/agent36-issue25-printed-futuresight-v2.cjs',
  'simulation/twinleaf/agent36-source-stamped-nightwatch-owner.cjs',
  'simulation/twinleaf/agent12-nightwatch-paper-random-chooser.cjs',
  'tests/agent1-issue25-joined-two-seat-attacks-v4.test.cjs',
  'tests/agent1-issue25-joined-two-seat-attacks-v4.native.test.cjs',
  'simulation/evaluation/agent1-issue25-v4-public-receipt.cjs',
  'simulation/evaluation/agent7-issue25-v3-executed-receipt.cjs',
  'tests/agent1-issue25-v4-public-receipt.test.cjs'
];

/**
 * Join the existing source-stamped printed ATTACK handlers at the same owner
 * prompt boundary. A fresh, non-public OS seed is created for each invocation,
 * before the native four-arm batch runs. It is exposed only in the postrun audit.
 * This is NOT a proof of per-game independent randomness or player-policy safety.
 *
 * @template T
 * @param {()=>T} next
 * @param {{
 *   randomBytes?:(n:number)=>Buffer,
 *   printedLayer?:(next:Function)=>{result:T,audit:object},
 *   nightWatchLayer?:(next:Function,opts:object)=>{result:T,audit:object}
 * }} [deps] Pure-test dependency seam.
 * @returns {{result:T,audit:object}}
 */
function withJoinedOwnerAttackFrontier(next, deps = {}) {
  assert.equal(typeof next, 'function');
  const randomBytes = deps.randomBytes ?? crypto.randomBytes;
  assert.equal(typeof randomBytes, 'function');
  const secret = randomBytes(32);
  assert.ok(Buffer.isBuffer(secret) && secret.length === 32,
    'Night Watch physical randomness requires 256-bit OS entropy');
  const campaignSeed = secret.toString('hex');
  const seedCommitmentSha256 =
    crypto.createHash('sha256').update(campaignSeed).digest('hex');
  const printedLayer = deps.printedLayer ?? withPrintedOwnerAttackFrontier;
  const nightWatchLayer = deps.nightWatchLayer ??
    withSourceStampedNightWatchOwner;
  assert.equal(typeof printedLayer, 'function');
  assert.equal(typeof nightWatchLayer, 'function');

  let nightWatchAudit = null;
  const selected = printedLayer(() => {
    const used = nightWatchLayer(next, {
      committedSeed: campaignSeed,
      followSequentialNativeStores: true,
      perNativeStoreEntropy: true
    });
    nightWatchAudit = used.audit;
    return used.result;
  });
  return {
    result: selected.result,
    audit: {
      ...selected.audit,
      sourceStampedNightWatch: nightWatchAudit,
      preRunUnpredictableSeedCommitmentSha256: seedCommitmentSha256,
      randomSeedSource: 'node:crypto.randomBytes(32) before registered batch; unique HMAC subkeys per native Store',
      randomSeedScope: 'one private four-arm seed with distinct native-Store HMAC subkeys',
      seedNotPublishedUntilAfterRun: true,
      fullPaperRandomnessCertified: false,
      completeOwnerInformationNoninterferenceCertified: false,
      competitivelyQualifiedGames: 0
    }
  };
}

/**
 * One executable developmental closure: Agent36 v1's source-independent
 * BOTH-seat resource runner, plus its v2 Future Sight observer/handler,
 * plus the source-stamped Night Watch handler under an unpredictable seed.
 * Historical v0/v1/v2/v3 and their raw results stay unchanged.
 *
 * @param {{
 *   runner?:(options:object)=>object,
 *   layers?:Record<string,Function>,
 *   attackLayer?:(next:Function)=>{result:unknown,audit:object}
 * }} [deps]
 * @returns {{manifest:object,diagnostic:object,rawDevelopment:object|null}}
 */
function runJoinedIssue25V4(deps = {}) {
  const attackLayer = deps.attackLayer ?? withJoinedOwnerAttackFrontier;
  assert.equal(typeof attackLayer, 'function');
  const selected = runSymmetricIssue25V1({
    runner: deps.runner ?? runDevelopment,
    layers: {...deps.layers, firstBlockedPromptEnvelope: attackLayer}
  });
  const attack = selected.diagnostic.audit?.firstBlockedPromptEnvelope ?? null;
  const manifest = {
    ...selected.manifest,
    version: VERSION,
    profile: 'historical-four-original-arms-48root-joined-two-seat-development-v4',
    policyEntryPoint: EXTRA_HASH_PATHS[0],
    selectedOuterToInner: [
      ...selected.manifest.selectedOuterToInner.slice(0, -1),
      'sourcePrintedAttackOriginObserver',
      'sourceStampedFutureSightNeutralOwnerOrder',
      'sourceStampedNightWatchPrivateCampaignSeed',
      'canonicalActorCommonRunner'
    ],
    sourceIndependentCommonPolicy: true,
    sourceSpecificResourceScriptsSelected: false,
    sourceStampedFutureSightSelected: true,
    sourceStampedNightWatchSelected: true,
    nightWatchPublicFixedSeedSelected: false,
    nightWatchPrivateSeedCommitmentSha256:
      attack?.preRunUnpredictableSeedCommitmentSha256 ?? null,
    nightWatchSeedScope:
      'one private campaign seed; unique HMAC subkey per native Store; paper randomness not certified',
    selectedSourcePromptPolicySymmetricByPhysicalSeat: true,
    knownStructuralVetoes: {
      ...selected.manifest.knownStructuralVetoes,
      completeOwnerInformationNoninterferenceCertified: false,
      completePaperRandomnessCertified: false,
      fullSourceStampedNativeStoreCoverageCertified: false,
      allNativeAttackPromptsHandled: false,
      originalSourceRankScriptsDisabled:
        selected.manifest.originalSourceRankScriptsDisabledByOptIn === true
    },
    resolvedSourceAndPolicyHashes: [
      ...selected.manifest.resolvedSourceAndPolicyHashes,
      ...EXTRA_HASH_PATHS.map(hashRegisteredFile)
    ],
    releaseQualified: false,
    competitiveGamesQualified: 0
  };
  const diagnostic = {
    ...selected.diagnostic,
    schema: VERSION,
    sourceStampedFutureSight: attack?.sourceStampedFutureSight ?? null,
    printedAttackOrigins: attack?.printedAttackOrigins ?? null,
    sourceStampedNightWatch: attack?.sourceStampedNightWatch ?? null,
    nightWatchSeedCommitmentSha256:
      attack?.preRunUnpredictableSeedCommitmentSha256 ?? null,
    joinedAttackWrapperObserved: attack !== null,
    verdict: 'FAIL-full-paper-owner-policy-and-match-admission-unproven',
    competitiveGamesQualified: 0
  };
  return {manifest, diagnostic, rawDevelopment: selected.rawDevelopment};
}

module.exports = {
  VERSION, EXTRA_HASH_PATHS, withJoinedOwnerAttackFrontier,
  runJoinedIssue25V4
};
