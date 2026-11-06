'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {runStewardCommonV6,ROOT_LIMIT,VERSION}=
  require('../simulation/evaluation/agent36-issue25-common-v6.cjs');
const {writeReceipt}=
  require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

test('fresh registered 96-root original-source two-seat v6 native Store',()=>{
  const selected=runStewardCommonV6();
  const dir=process.env.ISSUE25_STEWARD_V6_DIR;
  const archive=dir?writeReceipt(selected,dir,{
    prefix:'issue25-steward-v6',
    policyEntryPoint:selected.manifest.policyEntryPoint
  }):null;
  const attempts=selected.diagnostic.actualNativeAttempts;
  const expected=selected.diagnostic.registered;
  const receipt={
    schema:'agent36-issue25-v6-prospective-common-original-eight-native',
    preregistration:selected.diagnostic.preregistration,
    executingPolicyVersion:selected.manifest.version,
    actualNativeRootLimit:selected.manifest.nativeRootActionLimit,
    sourceIndependentPolicy:selected.manifest.selectedSourceIndependentCommonPolicy,
    bothSeatEnergy:selected.manifest.selectedBilateralSpecialEnergy,
    nativeTargetObservation:selected.manifest.selectedNativeAcceptedTargets,
    scopedThornsDirectRoot:selected.manifest.selectedActorRootFeature,
    sameSelectedOwnerPromptPolicyBothSeats:
      selected.manifest.selectedInnermostPromptContinuation,
    nativePromptAudit:selected.diagnostic.innerNativeOwnerPromptAudit,
    registeredIDs:expected,
    registrationReconciled:selected.diagnostic.registeredReconciliation,
    originalSourceSeats:attempts.map(row=>({
      id:row.id,sourceSeat:row.sourceSeat,candidateSeat:row.candidateSeat,
      status:row.status,rootCount:row.rootCount,
      sourceDealSha:row.sourcePhysicalDealFingerprint,
      wholeInitialDealSha:row.fullPhysicalDealFingerprint,
      settledSourceAttacks:row.settledSourceAttacks
    })),
    physicalVendorRevision:selected.manifest.observedTwinleafGitCommit,
    runtimeGitAttestation:selected.manifest.runtimeGitAttestationStatus,
    loadedCodeHash:selected.manifest.observedLoadedResearchModuleDigest,
    sourceCodeAndDeckHashes:selected.manifest.resolvedSourceAndPolicyHashes,
    completeNativeArchive:archive,
    qualifiedGames:0,winRateEstimate:null,
    verdict:'FAIL-paper-policy-and-official-clock-unverified'
  };
  console.log('AGENT36_ISSUE25_V6_NATIVE',JSON.stringify(receipt));
  assert.equal(selected.manifest.version,VERSION);
  assert.equal(selected.manifest.nativeRootActionLimit,ROOT_LIMIT);
  assert.equal(attempts.length,8);
  assert.deepEqual(attempts.map(x=>x.id).sort(),[...expected].sort());
  assert.equal(new Set(attempts.map(x=>x.id)).size,8);
  assert.equal(selected.diagnostic.registeredReconciliation.exactUniqueMatch,true);
  assert.equal(selected.manifest.releaseQualified,false);
  assert.equal(selected.diagnostic.competitiveGamesQualified,0);
});
