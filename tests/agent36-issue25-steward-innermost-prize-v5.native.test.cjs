'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {runStewardSelectedIssue25V4}=
  require('../simulation/evaluation/agent36-issue25-steward-selected-v4.cjs');
const {runStewardInnermostPrizeV5}=
  require('../simulation/evaluation/agent36-issue25-steward-innermost-prize-v5.cjs');
const {writeReceipt}=
  require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

/** Complete original case IDs and physical opening for the same fixed 60 only. */
test('retrospective owner Prize/Promotion v5 versus frozen v4 native same-deal eight',()=>{
  const control=runStewardSelectedIssue25V4();
  const treatment=runStewardInnermostPrizeV5();
  const initial=control.diagnostic.selectedNativeAttempts;
  const updated=treatment.diagnostic.selectedNativeAttempts;
  const original=new Map(initial.map(row=>[row.id,row]));
  const pairs=updated.map(row=>{
    const other=original.get(row.id);
    return {
      id:row.id,
      controlStatus:other?.status??null,
      treatmentStatus:row.status,
      controlRoots:other?.rootCount??null,
      treatmentRoots:row.rootCount??null,
      sourceSeat:row.sourceSeat??null,
      matchingOriginalPhysicalDeal:!!other?.sourcePhysicalDealFingerprint&&
        other.sourcePhysicalDealFingerprint===row.sourcePhysicalDealFingerprint,
      matchingEntirePhysicalDeal:!!other?.fullPhysicalDealFingerprint&&
        other.fullPhysicalDealFingerprint===row.fullPhysicalDealFingerprint,
      nativeAbortRootLedgerStatus:row.abortRootLedgerStatus,
      sourceAttackSettlementCount:row.sourceAttackCount
    };
  });
  // Only original accepted public native roots and redacted failure metadata.
  // Do not reveal an owner's hand, deck search choices, or pending hidden cards.
  const failingId='11:102:A:new-moon-lockbreaker-v1';
  const failing=treatment.rawDevelopment?.rows?.find(row=>
    (row.trial?.id??row.id)===failingId);
  const publicRoots=failing?.rootActionLedger??
    failing?.nativeAbortEvidence?.rootActionLedger??[];
  const root14PublicWitness={
    id:failingId,status:failing?.status??null,
    verifiedRootLedgerStatus:
      failing?.nativeAbortProvenance?.acceptedRootLedgerStatus??null,
    pendingPrompt:failing?.nativeAbortEvidence?.pendingPrompt??null,
    decoderFailureStage:
      failing?.nativeAbortEvidence?.failureStage??null,
    publicLastRoots:publicRoots.slice(-10).map(row=>({
      ordinal:row.actionOrdinal??null,
      turn:row.turnBefore??null,
      seat:row.playerSlot??null,
      action:row.action??null,
      card:row.card??null,
      attack:row.attack??null,
      pendingPrompt:row.pendingPrompt??null
    })),
    ownerPromptPrintingOriginCertified:false,
    competitiveGameQualified:false
  };
  const archiveDir=process.env.ISSUE25_STEWARD_V5_DIR;
  const artifacts=archiveDir?{
    control:writeReceipt(control,archiveDir,{
      prefix:'issue25-steward-v4',
      policyEntryPoint:control.manifest.policyEntryPoint
    }),
    treatment:writeReceipt(treatment,archiveDir,{
      prefix:'issue25-steward-v5',
      policyEntryPoint:treatment.manifest.policyEntryPoint
    })
  }:null;
  const receipt={
    schema:'agent36-issue25-steward-v5-innermost-prize-promotion-native-v1',
    preexistingTreatmentComponents:[
      'owner-first-occupied-ordinary-KO-prize',
      'owner-visible-choose-pokemon-with-charged-order'
    ],
    registrationIDs:control.diagnostic.registered,
    actualCompiledSourceIdentity:treatment.manifest.runtimeGitAttestationStatus,
    observedPinnedTwinleafCommit:treatment.manifest.observedTwinleafGitCommit,
    selectedNativeCodeAndDataHashes:
      treatment.manifest.resolvedSourceAndPolicyHashes,
    controlVersion:control.manifest.version,
    treatmentVersion:treatment.manifest.version,
    sameIDs:pairs.length===8&&
      pairs.every(row=>original.has(row.id)),
    allEightInitialSourcePhysicalDealsMatched:pairs.every(row=>
      row.matchingOriginalPhysicalDeal),
    allEightFullPhysicalDealsMatched:pairs.every(row=>
      row.matchingEntirePhysicalDeal),
    ownerNativePromptAudit:treatment.diagnostic.innerNativeOwnerPromptAudit,
    captureAudit:treatment.diagnostic.sourceIndependentCaptureEnergySearch,
    pairs,
    root14PublicWitness,
    completeRawNativeArchives:artifacts,
    competitiveGamesQualified:0,
    releaseStatus:'FAIL-retrospective-native-source-policy-only'
  };
  console.log('AGENT36_ISSUE25_STEWARD_V5',JSON.stringify(receipt));
  assert.equal(initial.length,8);
  assert.equal(updated.length,8);
  assert.equal(new Set(updated.map(row=>row.id)).size,8);
  assert.equal(receipt.sameIDs,true);
  assert.equal(receipt.allEightInitialSourcePhysicalDealsMatched,true);
  assert.equal(receipt.allEightFullPhysicalDealsMatched,true);
  assert.equal(treatment.diagnostic.completeRegisteredAttemptReconciliation,true);
  assert.equal(treatment.diagnostic.actualBilateralEnergyOptIn,true);
  assert.equal(receipt.ownerNativePromptAudit.nativeMatchCalls,8);
  assert.equal(treatment.manifest.releaseQualified,false);
  assert.equal(treatment.diagnostic.competitiveGamesQualified,0);
});
