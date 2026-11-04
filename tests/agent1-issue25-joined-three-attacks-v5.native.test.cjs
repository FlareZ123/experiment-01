'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {runJoinedIssue25V5}=
  require('../simulation/evaluation/agent1-issue25-joined-three-attacks-v5.cjs');
const {writeReceipt}=
  require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

test('actual four-arm source-independent three-attack Store execution, zero qualified games',()=>{
  const executed=runJoinedIssue25V5();
  const {manifest,diagnostic}=executed;
  const dir=process.env.ISSUE25_V5_RECEIPT_DIR;
  const receipt=dir?writeReceipt(executed,dir,{
    prefix:'issue25-joined-v5',
    policyEntryPoint:
      'simulation/evaluation/agent1-issue25-joined-three-attacks-v5.cjs'
  }):null;
  console.log('AGENT1_ISSUE25_JOINED_V5_NATIVE',JSON.stringify({
    policy:manifest.version,executingEntry:manifest.policyEntryPoint,
    codeIdentity:manifest.runtimeGitAttestationStatus,
    sourceIndependent:manifest.actualRunnerConfirmedOption,
    twoSeatResourceVersionsConfirmed:manifest.knownStructuralVetoes
      .actualTwoSeatResourceVersionConfirmedByNativeRows,
    sourceRankScriptsDisabled:manifest.originalSourceRankScriptsDisabledByOptIn,
    registered:diagnostic.registered,
    actual:diagnostic.attemptedRows,
    getLost:diagnostic.sourceStampedGetLost,
    nightWatch:diagnostic.sourceStampedNightWatch?{
      nativeStores:diagnostic.sourceStampedNightWatch.registeredNativeStoreCount,
      sourcePromptMarks:diagnostic.sourceStampedNightWatch.sourcePromptMarks,
      nativeAccepted:diagnostic.sourceStampedNightWatch.acceptedDispatches,
      physicalMovements:diagnostic.sourceStampedNightWatch
        .verifiedPhysicalHandDeckMovements,
      delegatedDetachedStates:diagnostic.sourceStampedNightWatch
        .delegatedDetachedStates
    }:null,
    futureSight:diagnostic.sourceStampedFutureSight,
    printedSources:diagnostic.printedAttackOrigins,
    rawDecoderExecuted:diagnostic.rawDecoderExecuted,
    reconciliation:diagnostic.rawRowIdentityReconciliation,
    verdict:diagnostic.verdict,receipt
  }));
  assert.equal(manifest.sourceIndependentCommonPolicy,true);
  assert.equal(manifest.actualRunnerConfirmedOption,true);
  assert.equal(manifest.sourceStampedGetLostSelected,true);
  assert.equal(diagnostic.attemptedRows.length,4);
  assert.equal(diagnostic.registeredAttemptReconciliation.exactUniqueMatch,true);
  assert.equal(diagnostic.rawRowIdentityReconciliation.exactlyReconciled,true);
  assert.equal(manifest.runtimeGitAttestationStatus,'VERIFIED');
  assert.equal(manifest.observedTwinleafGitCommit,
    manifest.expectedPinnedTwinleafGitlink);
  assert.equal(diagnostic.rawDecoderExecuted,false);
  assert.equal(diagnostic.sourceStampedNightWatch?.registeredNativeStoreCount,4);
  assert.equal(diagnostic.sourceStampedNightWatch?.delegatedDetachedStates,0);
  assert.equal(manifest.fullDecisionPolicySymmetryCertified,false);
  assert.equal(manifest.releaseQualified,false);
  assert.equal(diagnostic.competitiveGamesQualified,0);
});
