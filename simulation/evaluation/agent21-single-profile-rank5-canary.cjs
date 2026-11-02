'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {gitBlobHash, assertExternallyPinnedSelectedProfile} =
  require('./agent36-profile-provenance-gate.cjs');
const frozen = require('./agent41-frozen-bilateral-development-v1.cjs');

const ROOT = path.resolve(__dirname, '../..');
const VERSION = 'agent21-one-selected-rank5-bilateral-canary-v1';
const PROFILE_PATH = 'simulation/evaluation/agent21-selected-rank5-canary-profile-20261102.json';
const PROFILE_BLOB = '841b1bc65584c0cf2643c679e5ceffa204263a25';
const REGISTRATION_BLOB = '268023063cfcd1af2312b892e7a1eefd04e28c49';

/**
 * Fail closed before importing any experimental policy or native engine.
 * Checks the selected bytes and a limited explicit source-code closure.
 * A successful preflight does not certify every dynamic native dependency.
 * @param {{pinNative?:boolean}} [options]
 * @returns {{profile:object,registration:object,trials:object[]}}
 */
function preflight({pinNative = true} = {}) {
  const profile = JSON.parse(fs.readFileSync(path.join(ROOT, PROFILE_PATH), 'utf8'));
  assertExternallyPinnedSelectedProfile(ROOT, PROFILE_PATH, profile, PROFILE_BLOB);
  frozen.assertNoUnreviewedAmbientAgentEnvironment(process.env, profile);
  const regBytes = fs.readFileSync(path.join(ROOT, profile.registeredFile));
  assert.equal(gitBlobHash(regBytes), REGISTRATION_BLOB,
    'Changed preregistered seeds');
  assert.equal(profile.registrationGitBlobSha, REGISTRATION_BLOB);
  const registration = JSON.parse(regBytes.toString('utf8'));
  assert.equal(registration.sourceRank, 5);
  assert.equal(registration.sourcePrinted60Sha256, profile.sourcePrinted60Sha256);
  assert.equal(registration.sourceRosterGitBlobSha, profile.originalRosterGitBlobSha);
  for (const [file, hash] of Object.entries(profile.selectedCodeGitBlobShas)) {
    assert.equal(gitBlobHash(fs.readFileSync(path.join(ROOT, file))), hash,
      'Selected policy source drift: ' + file);
  }
  for (const [file, hash] of [
    [profile.originalRoster, profile.originalRosterGitBlobSha],
    [profile.sourceAdmissionLedger, profile.originalAdmissionLedgerGitBlobSha],
    [profile.candidatePrinted60Evidence.newMoonProxyPath,
      profile.candidatePrinted60Evidence.newMoonProxyGitBlobSha],
    [profile.candidatePrinted60Evidence.newMoonOriginalJapanesePrintPath,
      profile.candidatePrinted60Evidence.newMoonOriginalJapaneseGitBlobSha]
  ]) {
    assert.equal(gitBlobHash(fs.readFileSync(path.join(ROOT, file))), hash,
      'Source or candidate printed-60 evidence drift: ' + file);
  }
  const admission = JSON.parse(fs.readFileSync(
    path.join(ROOT, profile.sourceAdmissionLedger), 'utf8'));
  const source = admission.rows.find(row => row.rank === 5);
  assert.equal(source.printed60Sha256, profile.sourcePrinted60Sha256);
  assert.equal(source.physicalCards, 60);
  assert.equal(profile.expectedNativeArms, 8);
  assert.deepEqual(registration.candidateIds,
    ['champion-reference', 'new-moon-lockbreaker-v1']);
  assert.deepEqual(registration.registeredGroups.map(g => g.candidateSlot),
    ['A', 'B', 'A', 'B']);
  assert.equal(new Set(registration.registeredGroups.map(g => g.seed)).size, 4);
  assert.ok(profile.selectedPolicyOptions.actorOnlyComposition);
  assert.ok(profile.selectedPolicyOptions.paperSecretBoxPayment);
  assert.ok(profile.selectedPolicyOptions.paperQuickBallPayment);
  assert.ok(profile.selectedPolicyOptions.sharedPaperPaymentPortfolio);
  const trials = registration.registeredGroups.flatMap(group =>
    registration.candidateIds.map(candidateId => ({
      ...group, candidateId,
      id: [group.rank, group.repeat, group.candidateSlot, candidateId].join(':')
    })));
  assert.equal(trials.length, 8);
  if (pinNative) frozen.assertPinnedNativeStore(ROOT, profile);
  return {profile, registration, trials};
}

/**
 * Qualified-state flags are intentionally fail-closed. An accepted native
 * Store terminal and an enabled guard never establish paper validity alone.
 * @param {object|null} row
 * @returns {string}
 */
function disposition(row) {
  if (!row) return 'MISSING_NATIVE_ROW';
  if (row.status === 'engine-physical-invalid') return 'PHYSICAL_ZONE_INVALID';
  if (row.status === 'paper-supporter-quota-veto') return 'PAPER_VETO';
  if (typeof row.error === 'string' && row.error.length) return 'NATIVE_ERROR';
  if (row.finished === true) return 'ENGINE_TERMINAL_UNQUALIFIED';
  if (row.status === 'engine-error') return 'NATIVE_ERROR';
  if (row.finished === false) return 'CENSORED_OR_UNFINISHED';
  return 'UNVERIFIED_NATIVE_DISPOSITION';
}

/**
 * @param {{runDevelopment?:Function,skipNativePin?:boolean}} [deps]
 * @returns {object} Complete preregistered canary disposition.
 */
function runCanary({runDevelopment, skipNativePin = false} = {}) {
  assert.ok(!skipNativePin || typeof runDevelopment === 'function',
    'Native pin bypass is allowed only with an injected test runner');
  const {profile, registration, trials} = preflight({pinNative: !skipNativePin});
  const testInjected = typeof runDevelopment === 'function';
  const run = runDevelopment ||
    require('./agent41-bilateral-v2-development.cjs').runDevelopment;
  let output = null;
  let batchError = null;
  try {
    output = run({
      ...profile.selectedPolicyOptions,
      registeredTrials: trials,
      registeredFrameName: VERSION,
      allowAdditionalOriginalSourceRanks: profile.allowAdditionalOriginalSourceRanks
    });
    assert.equal(output.attempted, trials.length,
      'All registered arms must be attempted');
    assert.deepEqual(output.rows.map(row => row.trial.id),
      trials.map(trial => trial.id),
      'Native row order/identity diverged from registration');
  } catch (error) {
    batchError = String(error && error.stack || error);
    output = null;
  }
  const attempts = trials.map((trial, i) => {
    const row = output ? output.rows[i] : null;
    const sourceSeat = trial.candidateSlot === 'A' ? 1 : 0;
    return {
      trial, sourceSeat,
      status: batchError ? 'BATCH_ABORT_UNEXECUTED_OR_UNKNOWN' : disposition(row),
      sourceDealFingerprint: row?.sourceDealFingerprint ?? null,
      actualStarterSeat: row?.actualStarterSeat ?? null,
      verifiedFirstTurn: row?.verifiedFirstTurn === true,
      sourceAttackDeclarations: row?.attackDeclarations?.source ?? null,
      sourceAttackSettlement: row?.sourceAttackSettlement ?? null,
      sourceRootLedger: row?.rootActionLedger ?? null,
      opponentContinuation: row?.candidateRepliesAfterSourceAttacks ?? null,
      nativePaperPaymentReceipts: {
        quickBall: row?.paperQuickBallPaymentAudit ?? null,
        secretBox: row?.paperSecretBoxPaymentAudit ?? null,
        sharedPortfolio: row?.sharedPaperPaymentPortfolioAudit ?? null
      },
      paperPaymentVerified: false,
      sourcePayoffPaperVerified: false,
      opponentContinuationCompetent: false,
      competitiveGameQualified: false,
      rawNativeRow: row
    };
  });
  const groups = registration.registeredGroups.map(group => {
    const paired = attempts.filter(a =>
      a.trial.repeat === group.repeat &&
      a.trial.candidateSlot === group.candidateSlot);
    const [a, b] = paired;
    const sameDeal = a.sourceDealFingerprint && b.sourceDealFingerprint ?
      (a.sourceDealFingerprint === b.sourceDealFingerprint ?
        'EXACT_SOURCE_DEAL_MATCH' : 'SOURCE_DEAL_DIFFERENT') : 'UNVERIFIED';
    return {rank: group.rank, repeat: group.repeat,
      candidateSlot: group.candidateSlot, seed: group.seed,
      sourcePhysicalDealPairStatus: sameDeal};
  });
  const actualSourceSeats = new Set(attempts.filter(a =>
    a.verifiedFirstTurn && !batchError).map(a => a.sourceSeat));
  return {
    schema: VERSION, profileGitBlobSha: PROFILE_BLOB,
    registrationGitBlobSha: REGISTRATION_BLOB,
    sourcePrinted60Sha256: profile.sourcePrinted60Sha256,
    selectedPolicyOptions: profile.selectedPolicyOptions,
    selectedNativeVendorRevision: profile.pinnedVendorRevision,
    testRunnerInjected: testInjected, nativeExecutionAttempted: !testInjected,
    registeredArms: trials.length, retainedArms: attempts.length,
    preregisteredBeforeExecution: true, batchError,
    gates: {
      CONFIG_FROZEN: true,
      BOTH_SEATS_EXECUTED: !testInjected && !batchError &&
        actualSourceSeats.size === 2,
      PAPER_PAYMENT_VERIFIED: false,
      SOURCE_PAYOFF_WITNESSED: false,
      OPPONENT_CONTINUATION_WITNESSED: false,
      OWNER_INFORMATION_CERTIFIED: false,
      PAPER_MATCH_CLOCK_CERTIFIED: false,
      COMPLETE_32_ORIGINAL_SOURCES: false
    },
    sourcePhysicalDealPairs: groups, attempts,
    competitiveQualifiedGames: 0, certifiedWinRate: null,
    remainingVetoes: profile.knownUnresolvedDependencyClosure
  };
}

if (require.main === module) {
  const result = process.argv.includes('--inspect-only') ?
    {schema: VERSION, ...preflight({pinNative: false}),
      nativeExecutionAttempted: false, competitiveQualifiedGames: 0} :
    runCanary();
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}

module.exports = {VERSION, PROFILE_BLOB, REGISTRATION_BLOB,
  preflight, disposition, runCanary};
