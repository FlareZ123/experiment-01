'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {runStewardCommonVoltV7,VERSION}=
  require('../simulation/evaluation/agent36-issue25-common-v7.cjs');
const {writeReceipt}=
  require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

test('all eight exact original v6 native deals with generic mandatory Volt transfer',()=>{
  const selected=runStewardCommonVoltV7();
  const archiveDir=process.env.ISSUE25_STEWARD_V7_DIR;
  const archive=archiveDir?writeReceipt(selected,archiveDir,{
    prefix:'issue25-steward-v7',
    policyEntryPoint:selected.manifest.policyEntryPoint
  }):null;
  const rows=selected.diagnostic.actualNativeAttempts;
  const receipt={
    schema:'agent36-issue25-v7-original-v6-same-deal-volt-prompt-treatment',
    version:selected.manifest.version,
    baselineArtifactSha256:selected.diagnostic.originalV6ArchiveSha256,
    selectedRealNativeRootLimit:selected.manifest.nativeRootActionLimit,
    selectedNativeWrapper:selected.manifest.policyEntryPoint,
    sourceRankIndependentOwnerPolicy:
      selected.manifest.selectedSourceIndependentCommonPolicy,
    registeredIds:selected.diagnostic.registered,
    registrationReconciliation:selected.diagnostic.registeredReconciliation,
    actualNativeAttemptRows:rows,
    allTurnNativeVoltMatchAudit:selected.diagnostic.ownerVoltMatchAudit,
    selectedPhysicalVoltPrompts:
      selected.diagnostic.ownerVoltSelectedPromptCount,
    innerV5NativePromptAudit:
      selected.diagnostic.innerNativeOwnerPromptAudit?.preexistingPrizeAndPromotion??null,
    nativeArtifact:archive,
    currentEnginePin:selected.manifest.observedTwinleafGitCommit,
    currentRuntimeGitAttestation:selected.manifest.runtimeGitAttestationStatus,
    sourceAndPolicyHashes:selected.manifest.resolvedSourceAndPolicyHashes,
    qualifiedCompetitiveGames:0,winRateEstimate:null,
    verdict:selected.diagnostic.verdict
  };
  console.log('AGENT36_ISSUE25_V7_NATIVE',JSON.stringify(receipt));
  assert.equal(selected.manifest.version,VERSION);
  assert.equal(selected.manifest.nativeRootActionLimit,96);
  assert.equal(rows.length,8,'All aborts and caps retained');
  assert.equal(new Set(rows.map(r=>r.id)).size,8);
  assert.deepEqual(rows.map(r=>r.id).sort(),
    [...selected.diagnostic.registered].sort());
  assert.equal(selected.diagnostic.registeredReconciliation.exactUniqueMatch,true);
  assert.equal(selected.manifest.releaseQualified,false);
  assert.equal(selected.diagnostic.competitiveGamesQualified,0);
});
