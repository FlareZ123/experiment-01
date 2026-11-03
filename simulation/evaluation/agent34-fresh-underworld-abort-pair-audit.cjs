'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');

const VERSION='agent34-fresh-underworld-abort-pair-audit-v1';
const REGISTRATION_BLOB='1af4f729c0101483a2295e0df22b9070a8510417';
const SHA256=/^[a-f0-9]{64}$/;

/** @param {unknown} value @returns {boolean} */
const validHash=value=>typeof value==='string'&&SHA256.test(value);

/**
 * Recover only the original source's authentic opening digest from the native
 * error receipt. This validates the live root ledger so that arbitrary error
 * strings cannot become deal evidence. It never constructs full-deal or
 * first-player claims from a matching random seed.
 * @param {object} row One archived actual native run.
 * @param {0|1} sourceSeat Original source's registered physical seat.
 * @returns {{digest:string|null,reason:string}}
 */
function auditedSourceDigest(row,sourceSeat){
  if(validHash(row?.sourceDealFingerprint))return {
    digest:row.sourceDealFingerprint,reason:'successful-native-row'
  };
  if(row?.status!=='engine-error')return {
    digest:null,reason:'no-success-or-native-error-source-digest'
  };
  const e=row.nativeAbortEvidence;
  if(e?.schema!=='headless-native-abort-public-v1'||
     e.sourceDealFingerprint?.seat!==sourceSeat||
     !validHash(e.sourceDealFingerprint?.digestSha256))return {
    digest:null,reason:'unauthenticated-error-source-digest'
  };
  const roots=e.rootActionLedger;
  if(!Array.isArray(roots))return {
    digest:null,reason:'native-error-root-integrity-failure'
  };
  const expected=createHash('sha256')
    .update(JSON.stringify(roots)).digest('hex');
  if(
     !Number.isSafeInteger(e.actionOrdinal)||
     roots.length!==e.rootActionCount||
     roots.length!==e.actionOrdinal||
     !validHash(e.rootActionLedgerSha256)||
     expected!==e.rootActionLedgerSha256)return {
    digest:null,reason:'native-error-root-integrity-failure'
  };
  return {digest:e.sourceDealFingerprint.digestSha256,
    reason:'native-abort-root-ledger-verified'};
}

/**
 * Read-only independent audit of the preserved failed 32-attempt archive.
 * Fail closed when a complete physical pair or a first-player receipt is
 * missing. Recovered source-only error digests cannot retroactively satisfy
 * the preregistered complete-deal acceptance test.
 * @param {object} archive Complete originally archived JSON.
 * @returns {object} Detached posthoc assessment.
 */
function auditFreshUnderworldArchive(archive){
  assert.equal(archive?.schema,
    'agent34-fresh-rank1-underworld-paper-hook-source-paired-v1');
  assert.equal(archive.preregistrationGitBlob,REGISTRATION_BLOB);
  assert.equal(archive.originalRank,1);
  assert.equal(archive.gamesPerArm,16);
  assert.equal(archive.actualControl,16);
  assert.equal(archive.actualTreatment,16);
  const controls=archive.control?.rows,treatments=archive.treatment?.rows;
  assert.equal(controls?.length,16);
  assert.equal(treatments?.length,16);
  assert.equal(archive.pairs?.length,16);
  const seen=new Set(),rows=[];
  for(let i=0;i<controls.length;i++){
    const control=controls[i],treatment=treatments[i],pair=archive.pairs[i];
    const trial=control?.trial,other=treatment?.trial;
    assert.equal(typeof trial?.id,'string');
    assert.ok(trial.id.length>0&&!seen.has(trial.id));
    seen.add(trial.id);
    assert.equal(trial.id,other?.id);
    assert.equal(trial.id,pair.trialId);
    assert.equal(trial.seed,other.seed);
    assert.equal(trial.rank,1);
    assert.ok(['A','B'].includes(trial.candidateSlot));
    assert.equal(trial.candidateSlot,other.candidateSlot);
    assert.equal(trial.candidateId,other.candidateId);
    const sourceSeat=trial.candidateSlot==='A'?1:0;
    const a=auditedSourceDigest(control,sourceSeat);
    const b=auditedSourceDigest(treatment,sourceSeat);
    const sourceKnown=a.digest!==null&&b.digest!==null;
    const sourceSame=sourceKnown&&a.digest===b.digest;
    const completeKnown=validHash(control.fullPhysicalDealFingerprint)&&
      validHash(treatment.fullPhysicalDealFingerprint);
    const completeSame=completeKnown&&
      control.fullPhysicalDealFingerprint===treatment.fullPhysicalDealFingerprint;
    const startKnown=[0,1].includes(control.actualStarterSeat)&&
      [0,1].includes(treatment.actualStarterSeat);
    const startSame=startKnown&&
      control.actualStarterSeat===treatment.actualStarterSeat;
    const strictPair=sourceSame&&completeSame&&startSame;
    const treatmentNativeError=treatment.status==='engine-error';
    const status=strictPair?'STRICT_FULL_PAIR_MATCH':
      sourceKnown&&!sourceSame?'VERIFIED_SOURCE_DEAL_MISMATCH':
      sourceSame&&treatmentNativeError&&!completeKnown?
        'SOURCE_ONLY_NATIVE_ABORT_MATCH':
      sourceSame?'SOURCE_MATCH_FULL_OR_START_UNVERIFIED':
        'SOURCE_DEAL_UNVERIFIED';
    assert.ok(Number.isSafeInteger(pair.fullySettledSourceEffects)&&
      pair.fullySettledSourceEffects>=0);
    rows.push({trialId:trial.id,sourceSeat,status,
      controlStatus:control.status??(control.finished?'native-terminal':'censored'),
      treatmentStatus:treatment.status??
        (treatment.finished?'native-terminal':'censored'),
      sourceDigestVerified:sourceKnown,sourceDigestMatched:sourceSame,
      controlSourceDigestOrigin:a.reason,treatmentSourceDigestOrigin:b.reason,
      fullPhysicalPairVerified:completeKnown,fullPhysicalPairMatched:completeSame,
      firstPlayerBothVerified:startKnown,firstPlayerMatched:startSame,
      strictPairCertified:strictPair,
      nativeTreatmentError:treatmentNativeError,
      errorPrompt:treatmentNativeError?
        treatment.nativeAbortEvidence?.pendingPrompt??null:null,
      errorStage:treatmentNativeError?
        treatment.nativeAbortEvidence?.failureStage??null:null,
      fullySettledSourceAbilityEffects:pair.fullySettledSourceEffects,
      competitivelyQualified:false});
  }
  const count=predicate=>rows.filter(predicate).length;
  const totals={
    registeredTrials:16,actualNativeAttempts:controls.length+treatments.length,
    strictFullPairMatches:count(row=>row.strictPairCertified),
    verifiedOriginalSourcePairs:count(row=>row.sourceDigestMatched),
    verifiedSourceMismatches:count(row=>row.status==='VERIFIED_SOURCE_DEAL_MISMATCH'),
    sourceOnlyAbortMatches:count(row=>row.status==='SOURCE_ONLY_NATIVE_ABORT_MATCH'),
    unverifiedSourcePairs:count(row=>!row.sourceDigestVerified),
    treatmentNativeErrors:count(row=>row.nativeTreatmentError),
    fullySettledOriginalSourceEffects:rows.reduce((n,row)=>
      n+row.fullySettledSourceAbilityEffects,0),
    sourceEffectsInAbortedRows:rows.filter(row=>row.nativeTreatmentError)
      .reduce((n,row)=>n+row.fullySettledSourceAbilityEffects,0),
    competitivelyQualifiedGames:0
  };
  assert.equal(totals.fullySettledOriginalSourceEffects,
    archive.completeOriginalSourceAbilityEffects);
  return {version:VERSION,registrationBlob:REGISTRATION_BLOB,
    status:totals.strictFullPairMatches===16&&
      totals.treatmentNativeErrors===0?'ARCHIVE_STRICT_PAIR_GATE_PASSED':
      'ARCHIVE_STRICT_PAIR_GATE_FAILED',
    originalRunAcceptanceUnchanged:true,
    sourceAbortPairingIsPosthocOnly:true,
    fullDealAndStarterNotInferredFromRandomSeed:true,
    nativeActionsAreNotCompetitivePaperGames:true,
    totals,rows};
}

module.exports={VERSION,REGISTRATION_BLOB,auditedSourceDigest,
  auditFreshUnderworldArchive};
