'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {runFutureSightIssue25V2}=
  require('../simulation/evaluation/agent36-issue25-printed-futuresight-v2.cjs');

test('Issue25 v2 source-stamped genuine Future Sight owner-native action frontier',()=>{
  const {manifest,diagnostic}=runFutureSightIssue25V2();
  console.log('AGENT36_ISSUE25_SOURCE_STAMPED_FUTURESIGHT_V2',
    JSON.stringify({manifest,diagnostic}));
  assert.equal(diagnostic.registeredAttemptReconciliation.exactUniqueMatch,true);
  assert.equal(diagnostic.rawRowIdentityReconciliation.exactlyReconciled,true);
  assert.deepEqual(diagnostic.rawRowIdentityReconciliation.conflictingRowIdentifiers,[]);
  assert.equal(diagnostic.attemptedRows.length,4);
  assert.equal(manifest.runtimeGitAttestationStatus,'VERIFIED');
  assert.equal(manifest.observedTwinleafGitCommit,
    manifest.expectedPinnedTwinleafGitlink);
  assert.equal(diagnostic.rawDecoderExecuted,false);
  assert.ok(diagnostic.sourceStampedFutureSight?.markedOrderPrompts>=1);
  assert.ok(diagnostic.sourceStampedFutureSight?.ownerPromptSelections>=1);
  assert.equal(diagnostic.sourceStampedFutureSight?.cardIdentitiesInspected,false);
  assert.equal(diagnostic.printedAttackOrigins?.decisionActionsIssuedByObserver,0);
  assert.equal(manifest.fullDecisionPolicySymmetryCertified,false);
  assert.equal(diagnostic.competitiveGamesQualified,0);
});
