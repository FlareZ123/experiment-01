'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {runNightWatchFutureSightIssue25V3}=
  require('../simulation/evaluation/agent36-issue25-nightwatch-futuresight-v3.cjs');

test('selected v3 genuine source-stamped opaque Night Watch and Future Sight Store actions',()=>{
  const {manifest,diagnostic}=runNightWatchFutureSightIssue25V3();
  console.log('AGENT36_ISSUE25_TWO_SOURCE_STAMPED_ATTACKS_V3',
    JSON.stringify({manifest,diagnostic}));
  assert.equal(manifest.runtimeGitAttestationStatus,'VERIFIED');
  assert.equal(manifest.observedTwinleafGitCommit,
    manifest.expectedPinnedTwinleafGitlink);
  assert.equal(diagnostic.registeredAttemptReconciliation.exactUniqueMatch,true);
  assert.equal(diagnostic.rawRowIdentityReconciliation.exactlyReconciled,true);
  assert.deepEqual(diagnostic.rawRowIdentityReconciliation.conflictingRowIdentifiers,[]);
  assert.equal(diagnostic.attemptedRows.length,4);
  assert.equal(diagnostic.rawDecoderExecuted,false);
  assert.ok(diagnostic.sourceStampedNightWatch?.sourcePromptMarks>=1);
  assert.ok(diagnostic.sourceStampedNightWatch?.realStoreSelectedActions>=1);
  assert.ok(diagnostic.sourceStampedNightWatch?.acceptedDispatches>=1);
  assert.ok(diagnostic.sourceStampedNightWatch?.verifiedPhysicalHandDeckMovements>=1);
  assert.equal(diagnostic.sourceStampedNightWatch?.policyCardIdentityReads,0);
  assert.ok(diagnostic.sourceStampedFutureSight?.ownerPromptSelections>=1);
  assert.equal(diagnostic.printedAttackOrigins?.decisionActionsIssuedByObserver,0);
  assert.equal(manifest.fullDecisionPolicySymmetryCertified,false);
  assert.equal(diagnostic.competitiveGamesQualified,0);
});
