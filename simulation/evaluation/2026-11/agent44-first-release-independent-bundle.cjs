'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {MANIFEST,sha256:unused,evidenceBundleSha256,bundleFailures,
  evaluateCompetitiveAdmission}=
  require('../agent45-independent-competitive-admission.cjs');
const {createHash}=require('node:crypto');

const REFERENCE='agent44-first-independent-rank5-newmoon-case-v1.json';
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const SECTION_KEYS={
  'registration':'registration',
  'original-printed-60':'originalSixties',
  'contender-printed-60':'originalSixties',
  'full-physical-deal':'physicalInitialPartition',
  'accepted-native-root-ledger':'accepted-native-root-ledger',
  'owner-payment-and-targets':'owner-payment-and-targets',
  'paper-rules':'paper-rules',
  'clock-continuity':'officialClockAndNoCall',
  'policy-and-counterplay':'sourceReplyAndNextOriginalTurn'
};

/**
 * Build the exact nine-object downstream admission envelope from one already
 * generated immutable native artifact, never inventing independent reviews.
 * Hashes use the production gate's canonical JSON serializer.
 * @param {object} original Parsed native artifact.
 */
function build(original){
  assert.equal(original.schema,'agent44-first-independent-original-source-case-intake-v1');
  assert.equal(original.registration.preRegisteredTrials.length,1);
  assert.equal(original.intake.releaseStatus.competitiveAdmission,false);
  const src=original.nativeDevelopmentRow;
  const recorded=original.intake.nineEvidenceObjects;
  const content={
    registration:original.registration,
    'original-printed-60':{
      manifest:'results/aichi-2026/full-decklists.json',
      authenticatedSourceRank:5,
      original60Sha256:original.intake.sourcePrintedSha256,
      nativeSourceManifestSha256:original.intake.sourcePrintedInventorySha256,
      independentlyVerifiedJapanesePrintingIdentity:false
    },
    'contender-printed-60':{
      manifest:'results/als/new-moon-perfection-source-60.json',
      candidateId:'new-moon-lockbreaker-v1',
      published60Sha256:original.intake.candidatePrintedInventorySha256,
      independentlyVerifiedJapanesePrintingIdentity:false
    },
    'full-physical-deal':{
      nativeDigest:src.fullPhysicalDealFingerprint??null,
      firstStableAfterSetup:original.postStoreZoneTape.initialStablePhysicalDeal??null,
      observedPhysicalStoreRootCount:
        original.postStoreZoneTape.postAcceptedRootCount,
      physicalIntegrity:src.physicalZoneQualification??null
    },
    'accepted-native-root-ledger':{
      registeredTrial:src.trial,
      nativeRootActionLedger:src.rootActionLedger??[],
      nativeEndReason:src.endReason??null,
      nativeFinished:src.finished===true,
      nativeWinner:src.finished===true?src.winner??null:null,
      perOwnerFullPhysicalZoneTapeSha256:
        original.postStoreZoneTape.allRootPhysicalZonesSha256
    },
    'owner-payment-and-targets':{
      nativeTargetSidecar:src.nativeAcceptedTargetSidecar??null,
      ownerPromptSidecar:src.paperPromptPortfolioAudit??null,
      sourceQuickBallPayment:src.nativeQuickBallOwnerTransactions??null,
      independentPaperPaymentReviewComplete:false,
      fullPostStorePhysicalZonesExternalRef:REFERENCE+
        '#/postStoreZoneTape/postAcceptedRoots',
      postStorePhysicalZonesSha256:
        original.postStoreZoneTape.allRootPhysicalZonesSha256
    },
    'paper-rules':{
      review:'missing-external-independent-complete-action-rule-review',
      nativeGameRulesDoNotCertifyPaperLegality:true,
      independentReviewerSignature:null
    },
    'clock-continuity':recorded.officialClockAndNoCall,
    'policy-and-counterplay':{
      originalSourceResponseWindow:
        recorded.sourceReplyAndNextOriginalTurn.replyWindow,
      nativeSourceAttackCount:original.intake.native.sourceAttacks,
      nativeCandidateAttackCount:original.intake.native.candidateAttacks,
      independentlyReviewed:false,independentReviewerSignature:null
    }
  };
  assert.deepEqual(Object.keys(content).sort(),MANIFEST.slice().sort());
  const manifest=MANIFEST.map(kind=>({
    kind,ref:REFERENCE+'#/releaseNineObjects/'+SECTION_KEYS[kind],
    sha256:evidenceBundleSha256(content[kind])
  }));
  const bundle={schema:'aichi-complete-game-bundle-v1',
    producerId:'Agent44',trialId:original.intake.trial.id,
    trial:{
      trialId:original.intake.trial.id,
      originalRank:5,
      sourceSeat:original.intake.sourceSeat,
      candidateSeat:original.intake.candidateSeat,
      nativeTerminal:original.intake.native.completed,
      ownerNativeFinalPrizes:original.intake.native.physicalPrizesAfter,
      originallyNativeWinner:original.intake.native.nativeWinner,
      firstPlayerSeat:original.intake.native.actualFirstSeat,
      nativeAcceptedRootLedgerSha256:
        original.intake.native.acceptedRootLedgerSha256,
      nativePhysicalZoneQualified:
        src.physicalZoneQualification?.physicalIntegrityQualified===true,
      releaseReviewFlags:original.intake.releaseStatus
    },
    evidenceManifest:manifest};
  assert.deepEqual(bundleFailures(bundle),[]);
  const admission=evaluateCompetitiveAdmission(bundle,[]);
  assert.equal(admission.competitiveAdmission,false);
  assert.equal(admission.acceptanceReady,false);
  return {schema:'agent44-first-release-nine-object-bundle-intake-v1',
    caseId:original.intake.caseId,
    originalSourceArtifact:REFERENCE,
    originalRegistrationSha256:original.registrationSha256,
    bundle,bundleSha256:evidenceBundleSha256(bundle),
    releaseNineObjects:content,
    signedReviewerPackets:[],
    independentAdmissionGate:admission,
    captureStatus:original.intake.releaseStatus,
    nativeGameRetainedAsDevelopmentOnly:true,
    exactOriginalGameArchiveNeverRerun:true};
}

/** Atomic, exclusively locked small output. */
function save(output,data){
  fs.mkdirSync(path.dirname(output),{recursive:true});
  const lock=output+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const temp=output+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
    const fp=fs.openSync(temp,'r');
    try{fs.fsyncSync(fp);}finally{fs.closeSync(fp);}
    fs.renameSync(temp,output);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
if(require.main===module){
  assert.ok(process.argv[2],'Supply previously archived case JSON');
  const raw=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const result=build(raw);
  const output=process.argv[3]??path.resolve('artifacts/agent44-first-release-nine-object-intake-v1.json');
  save(output,result);
  console.log('AGENT44_FIRST_RELEASE_NINE_OBJECTS',JSON.stringify({
    caseId:result.caseId,bundleSha256:result.bundleSha256,
    nativeTerminal:raw.intake.native.completed,
    nativeSourceWin:raw.intake.native.sourceNativeWin,
    rootCount:raw.intake.native.acceptedNativeRootCount,
    physicalIntegrity:raw.intake.native.physicalZoneQualification?.status??null,
    firstMissing:raw.intake.releaseStatus.firstMissingEvidence,
    admission:result.independentAdmissionGate,
    allManifestKinds:result.bundle.evidenceManifest.map(x=>x.kind)
  }));
}
module.exports={build,save};
