'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {runProtectedOpeningMirroredV7}=
  require('../simulation/evaluation/agent1-issue25-protected-opening-v7.cjs');
const {writeReceipt}=
  require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

test('same eight actual original source rank-seat stores with entry-support-preserving native validated opening',()=>{
  const execution=runProtectedOpeningMirroredV7();
  const {manifest,diagnostic}=execution;
  const directory=process.env.ISSUE25_V7_RECEIPT_DIR;
  const receipt=directory?writeReceipt(execution,directory,{
    prefix:'issue25-protected-opening-v7',
    policyEntryPoint:
      'simulation/evaluation/agent1-issue25-protected-opening-v7.cjs'
  }):null;
  const opening=diagnostic.protectedOpeningAudit??null;
  console.log('AGENT1_ISSUE25_PROTECTED_OPENING_V7_NATIVE',JSON.stringify({
    version:manifest.version,policyEntry:manifest.policyEntryPoint,
    selectedOpening:manifest.selectedOpening,
    sourceIndependent:manifest.actualRunnerConfirmedOption,
    observedCommit:manifest.observedRepositoryGitCommit,
    observedTwinleaf:manifest.observedTwinleafGitCommit,
    sourceRankSeatCrossTab:diagnostic.observedSourceSeatCrossTab,
    registered:diagnostic.registered,
    attempts:diagnostic.attemptedRows,
    setupNativeReceipt:opening?{
      stores:opening.stores,
      selected:opening.selected,
      initialAccepted:opening.initialAccepted,
      bonusAccepted:opening.bonusAccepted,
      activePhysicalConfirmed:opening.physicalActiveConfirmed,
      benchPhysicalConfirmed:opening.physicalBenchConfirmed,
      supportsRetainedPhysically:opening.allEligibleProtectedSupportsRetained,
      missingPhysicalPlacements:opening.missingPhysicalPlacements,
      events:opening.events?.slice(0,16)
    }:null,
    getLost:diagnostic.sourceStampedGetLost,
    nightWatch:diagnostic.sourceStampedNightWatch?{
      accepted:diagnostic.sourceStampedNightWatch.acceptedDispatches,
      physicalMoves:diagnostic.sourceStampedNightWatch
        .verifiedPhysicalHandDeckMovements,
      nativeStores:diagnostic.sourceStampedNightWatch.registeredNativeStoreCount,
      detachedDelegations:diagnostic.sourceStampedNightWatch.delegatedDetachedStates
    }:null,
    nativeRawDecoderExecuted:diagnostic.rawDecoderExecuted,
    receipt,verdict:diagnostic.verdict
  }));
  assert.equal(manifest.selectedOpening,'agent50OwnerProtectedMultiBasicStore');
  assert.equal(manifest.sourceIndependentCommonPolicy,true);
  assert.equal(manifest.actualRunnerConfirmedOption,true);
  assert.equal(manifest.runtimeGitAttestationStatus,'VERIFIED');
  assert.equal(manifest.observedTwinleafGitCommit,
    manifest.expectedPinnedTwinleafGitlink);
  assert.equal(diagnostic.registered.length,8);
  assert.equal(diagnostic.attemptedRows.length,8);
  assert.equal(diagnostic.registeredAttemptReconciliation.exactUniqueMatch,true);
  assert.equal(diagnostic.rawRowIdentityReconciliation.exactlyReconciled,true);
  assert.equal(diagnostic.rawDecoderExecuted,false);
  assert.ok(opening&&opening.initialAccepted>=8,
    'All eight native matches must demonstrate actual owner opening handling');
  assert.equal(opening.missingPhysicalPlacements,0);
  assert.equal(manifest.fullDecisionPolicySymmetryCertified,false);
  assert.equal(manifest.releaseQualified,false);
  assert.equal(diagnostic.competitiveGamesQualified,0);
});
