'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {runMirroredIssue25V6}=
  require('../simulation/evaluation/agent1-issue25-mirrored-r6-r11-v6.cjs');
const {writeReceipt}=
  require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

test('freshly preregistered original rank6/rank11 per-rank mirrored source seats execute on one common policy',()=>{
  const execution=runMirroredIssue25V6();
  const {manifest,diagnostic}=execution;
  const dir=process.env.ISSUE25_V6_RECEIPT_DIR;
  const receipt=dir?writeReceipt(execution,dir,{
    prefix:'issue25-mirrored-v6',
    policyEntryPoint:
      'simulation/evaluation/agent1-issue25-mirrored-r6-r11-v6.cjs'
  }):null;
  console.log('AGENT1_ISSUE25_MIRRORED_V6_NATIVE',JSON.stringify({
    version:manifest.version,policyEntry:manifest.policyEntryPoint,
    historical:false,actualSourceIndependent:manifest.actualRunnerConfirmedOption,
    codeIdentity:manifest.runtimeGitAttestationStatus,
    intendedRankAndSeatCoverage:diagnostic.designedSourceSeatCrossTab,
    observedRankAndSeatCoverage:diagnostic.observedSourceSeatCrossTab,
    rankSeatCoverageObserved:diagnostic.bothSourceSeatsObservedPerRank,
    expectedRegisteredIDs:diagnostic.registered,
    returnedRegisteredAttempts:diagnostic.attemptedRows,
    threePrintedAttackAudits:{
      getLost:diagnostic.sourceStampedGetLost,
      nightWatch:diagnostic.sourceStampedNightWatch?{
        storeCount:diagnostic.sourceStampedNightWatch.registeredNativeStoreCount,
        accepted:diagnostic.sourceStampedNightWatch.acceptedDispatches,
        physicalVerified:diagnostic.sourceStampedNightWatch
          .verifiedPhysicalHandDeckMovements,
        detachedDelegations:diagnostic.sourceStampedNightWatch
          .delegatedDetachedStates
      }:null,
      futureSight:diagnostic.sourceStampedFutureSight
    },
    nativeRawStateDecoderExecuted:diagnostic.rawDecoderExecuted,
    rawRowReconciliation:diagnostic.rawRowIdentityReconciliation,
    verdict:diagnostic.verdict,receipt
  }));
  assert.equal(manifest.historicalOnly,false);
  assert.equal(manifest.developmentTrialCount,8);
  assert.equal(manifest.actualRunnerConfirmedOption,true);
  assert.equal(diagnostic.registered.length,8);
  assert.equal(diagnostic.attemptedRows.length,8);
  assert.equal(diagnostic.registeredAttemptReconciliation.exactUniqueMatch,true);
  assert.equal(diagnostic.rawRowIdentityReconciliation.exactlyReconciled,true);
  assert.equal(manifest.runtimeGitAttestationStatus,'VERIFIED');
  assert.equal(manifest.observedTwinleafGitCommit,
    manifest.expectedPinnedTwinleafGitlink);
  assert.equal(diagnostic.rawDecoderExecuted,false);
  assert.equal(manifest.fullDecisionPolicySymmetryCertified,false);
  assert.equal(manifest.releaseQualified,false);
  assert.equal(diagnostic.competitiveGamesQualified,0);
});
