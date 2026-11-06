'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {runStewardBroaderV8,VERSION,ROOT_LIMIT}=
  require('../simulation/evaluation/agent36-issue25-common-v8.cjs');
const {writeReceipt}=
  require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

test('eight new pre-registered original ranks6/11/1/3 native 128-root both-owner policies',()=>{
  const selected=runStewardBroaderV8();
  const archiveDir=process.env.ISSUE25_STEWARD_V8_DIR;
  const archive=archiveDir?writeReceipt(selected,archiveDir,{
    prefix:'issue25-steward-v8',
    policyEntryPoint:selected.manifest.policyEntryPoint
  }):null;
  const d=selected.diagnostic;
  const status={
    schema:'agent36-issue25-v8-prospective-four-rank-eight-native',
    version:selected.manifest.version,
    sourceRegistration:d.preregistration,
    nativeRootHorizon:selected.manifest.nativeRootActionLimit,
    executingSourceIndependentBothSeatPolicy:
      selected.manifest.selectedSourceIndependentCommonPolicy,
    nativeOwnerVoltTransfer:d.nativeOwnerVoltMatchAudit,
    ownerPrizePokemonPrompt:d.innerOwnerPrizePokemonMatchAudit,
    originalNativeAttempts:d.actualAttemptRows,
    registeredTrialIDs:d.registered,
    registrationReconciliation:d.registeredAttemptReconciliation,
    // The selected-v0 outer catch can preserve exceptions both before and
    // after native attempts. Preserve their cause without inferring phase.
    outerCaughtErrorCode:d.thrownCode??null,
    outerCaughtErrorMessage:d.thrownMessage??null,
    actualOriginalVendorRevision:selected.manifest.observedTwinleafGitCommit,
    observedCurrentGit:selected.manifest.observedRepositoryGitCommit,
    provenanceHashes:selected.manifest.resolvedSourceAndPolicyHashes,
    archive,
    qualifiedPaperGames:0,winRateEstimate:null,
    releaseVerdict:d.verdict
  };
  console.log('AGENT36_ISSUE25_V8_NATIVE',JSON.stringify(status));
  assert.equal(selected.manifest.version,VERSION);
  assert.equal(selected.manifest.nativeRootActionLimit,ROOT_LIMIT);
  assert.equal(d.actualAttemptRows.length,8);
  assert.equal(new Set(d.actualAttemptRows.map(x=>x.id)).size,8);
  assert.deepEqual(d.actualAttemptRows.map(x=>x.id).sort(),
    [...d.registered].sort());
  assert.equal(d.registeredAttemptReconciliation.exactUniqueMatch,true);
  assert.equal(selected.manifest.releaseQualified,false);
  assert.equal(d.competitiveGamesQualified,0);
});
