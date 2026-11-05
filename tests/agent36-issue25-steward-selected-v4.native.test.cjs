'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {runStewardSelectedIssue25V4}=
  require('../simulation/evaluation/agent36-issue25-steward-selected-v4.cjs');
const {writeReceipt}=require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

test('selected Issue25 v4 executes every original rank6/11 seat with native Store',()=>{
  const selected=runStewardSelectedIssue25V4();
  const archiveDir=process.env.ISSUE25_STEWARD_V4_DIR;
  const archive=archiveDir?writeReceipt(selected,archiveDir,{
    prefix:'issue25-steward-v4',policyEntryPoint:selected.manifest.policyEntryPoint
  }):null;
  const rows=selected.diagnostic.selectedNativeAttempts;
  const registered=selected.diagnostic.registered;
  const receipt={
    schema:'agent36-issue25-steward-v4-native-development-receipt',
    selectedPolicyEntryPoint:selected.manifest.policyEntryPoint,
    selectedPolicyVersion:selected.manifest.version,
    completeRawNativeReceipt:archive,
    sourceIndependentCommonPolicy:
      selected.manifest.actualCommonRunnerOptIn,
    selectedBilateralSpecialEnergy:
      selected.diagnostic.actualBilateralEnergyOptIn,
    selectedNativeTargetObserver:
      selected.diagnostic.actualNativeTargetWitnessOptIn,
    selectedAttackAndCaptureFrontierObserved:
      selected.diagnostic.actualPromptFrontierObserved,
    registeredTrialIDs:registered,
    exactNativeRegistration:
      selected.diagnostic.completeRegisteredAttemptReconciliation,
    sourceSeatCrossTab:selected.diagnostic.observedSourceSeatCrossTab,
    nativeAttemptRows:rows,
    ownerCaptureAudit:selected.diagnostic.sourceIndependentCaptureEnergySearch,
    nativePolicyRuntimeAttestation:
      selected.manifest.runtimeGitAttestationStatus,
    runningResearchModuleDigest:
      selected.manifest.observedLoadedResearchModuleDigest,
    declaredSourceHashes:selected.manifest.resolvedSourceAndPolicyHashes,
    paperGamesQualified:0,competitiveGamesQualified:0,
    verdict:selected.diagnostic.developmentalQualificationVerdict
  };
  console.log('AGENT36_ISSUE25_SELECTED_V4',JSON.stringify(receipt));
  assert.equal(registered.length,8);
  assert.equal(rows.length,8,
    'All registered native error/cap rows must be returned');
  assert.equal(new Set(rows.map(row=>row.id)).size,8);
  assert.deepEqual(rows.map(row=>row.id).sort(),[...registered].sort());
  assert.equal(selected.diagnostic.completeRegisteredAttemptReconciliation,true);
  assert.equal(receipt.sourceIndependentCommonPolicy,true);
  assert.equal(receipt.selectedBilateralSpecialEnergy,true);
  assert.equal(receipt.selectedNativeTargetObserver,true);
  assert.equal(selected.manifest.nativeRootActionLimit,48);
  assert.equal(selected.manifest.releaseQualified,false);
  assert.equal(selected.diagnostic.competitiveGamesQualified,0);
});
