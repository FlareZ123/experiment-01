'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {runJoinedIssue25V4} =
  require('../simulation/evaluation/agent1-issue25-joined-two-seat-attacks-v4.cjs');
const {writeReceipt} =
  require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

test('actual selected joint-v4 four-arm native Store development run', () => {
  const execution = runJoinedIssue25V4();
  const {manifest,diagnostic} = execution;
  const directory = process.env.ISSUE25_V4_RECEIPT_DIR;
  const receipt = directory ? writeReceipt(execution,directory) : null;
  console.log('AGENT1_ISSUE25_JOINED_V4_NATIVE',JSON.stringify({
    version:manifest.version,policyEntry:manifest.policyEntryPoint,
    actualSourceIndependentOptIn:manifest.actualRunnerConfirmedOption,
    commonSeatsConfirmed:manifest.knownStructuralVetoes
      .actualTwoSeatResourceVersionConfirmedByNativeRows,
    seedCommitment:diagnostic.nightWatchSeedCommitmentSha256,
    codeIdentity:manifest.runtimeGitAttestationStatus,
    expected:diagnostic.registered,actual:diagnostic.attemptedRows,
    firstBlockedPromptKinds:diagnostic.fallbackPromptEnvelopes
      ?.map(x=>x.type??x.promptType??x.kind??null).slice(0,12)??null,
    printedFutureSight:diagnostic.sourceStampedFutureSight??null,
    printedNightWatch:diagnostic.sourceStampedNightWatch??null,
    sourcePrinter:diagnostic.printedAttackOrigins??null,
    rawDecoderExecuted:diagnostic.rawDecoderExecuted,
    reconciliation:diagnostic.rawRowIdentityReconciliation,
    verdict:diagnostic.verdict,publicReceipt:receipt
  }));
  assert.equal(manifest.sourceIndependentCommonPolicy,true);
  assert.equal(manifest.actualRunnerConfirmedOption,true);
  assert.equal(manifest.originalSourceRankScriptsDisabledByOptIn,true);
  assert.equal(diagnostic.attemptedRows.length,4);
  assert.equal(diagnostic.registeredAttemptReconciliation.exactUniqueMatch,true);
  assert.equal(diagnostic.rawRowIdentityReconciliation.exactlyReconciled,true);
  assert.equal(diagnostic.rawDecoderExecuted,false);
  assert.equal(manifest.runtimeGitAttestationStatus,'VERIFIED');
  assert.equal(manifest.observedTwinleafGitCommit,
    manifest.expectedPinnedTwinleafGitlink);
  assert.ok(/^[a-f0-9]{64}$/.test(diagnostic.nightWatchSeedCommitmentSha256));
  assert.equal(manifest.fullDecisionPolicySymmetryCertified,false);
  assert.equal(manifest.releaseQualified,false);
  assert.equal(diagnostic.competitiveGamesQualified,0);
  assert.ok(manifest.resolvedSourceAndPolicyHashes.every(row =>
    /^[a-f0-9]{64}$/.test(row.sha256)));
});
