'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');

const SHA256=/^[a-f0-9]{64}$/;
const SCHEMA='agent48-aborted-original-source-pair-posthoc-v1';

/**
 * Verify the digest-only identity of an aborted native source deal and
 * the bounded Store root ledger. Never read source hand, Prize or deck cards.
 * @param {object} row Archived native runner error row.
 * @param {0|1} sourceSeat Physically registered original-source seat.
 * @returns {object} Postgame native abort evidence; no game qualification.
 */
function inspectAbortSource(row,sourceSeat){
  assert.ok(sourceSeat===0||sourceSeat===1);
  if(row?.status!=='engine-error'&&
     row?.status!=='engine-physical-invalid'&&
     row?.status!=='paper-supporter-quota-veto'){
    return {status:'NOT_A_NATIVE_ABORT',digest:null,starter:null};
  }
  const e=row.nativeAbortEvidence;
  if(e?.schema!=='headless-native-abort-public-v1'){
    return {status:'NO_AUTHENTICATED_NATIVE_ABORT_RECEIPT',
      digest:null,starter:null};
  }
  const fingerprint=e.sourceDealFingerprint;
  if(fingerprint?.seat!==sourceSeat||
     !SHA256.test(fingerprint?.digestSha256??'')){
    return {status:'MISSING_OR_WRONG_SEAT_SOURCE_DEAL',
      digest:null,starter:null};
  }
  if(row.sourceDealFingerprint!=null&&
     row.sourceDealFingerprint!==fingerprint.digestSha256){
    return {status:'CONFLICTING_SUCCESS_AND_ABORT_DIGEST',
      digest:null,starter:null};
  }
  const roots=e.rootActionLedger;
  if(!Array.isArray(roots)||
     roots.length!==e.rootActionCount||
     roots.length!==e.actionOrdinal||
     !SHA256.test(e.rootActionLedgerSha256??'')||
     createHash('sha256').update(JSON.stringify(roots))
       .digest('hex')!==e.rootActionLedgerSha256){
    return {status:'UNVERIFIED_NATIVE_ABORT_ROOT_LEDGER',
      digest:null,starter:null};
  }
  const setup=row.nativeSetupCoinChoiceReceipt;
  const starter=setup?.status===
      'consistent-accepted-native-setup-and-first-draw'&&
      setup.firstSetupOnly===true&&
      setup.nativeFirstDrawVerified===true&&
      [0,1].includes(setup.firstSeatFromVerifiedDraw)&&
      setup.firstSeatFromVerifiedDraw===setup.firstSeatFromAcceptedSetup?
      setup.firstSeatFromVerifiedDraw:null;
  return {status:starter===null?
      'SOURCE_DEAL_VERIFIED_STARTER_UNVERIFIED':
      'SOURCE_DEAL_AND_STARTER_VERIFIED',
    digest:fingerprint.digestSha256,starter,
    nativeStoreAcceptedRoots:roots.length,
    posthocOnly:true,competitiveGameQualified:false};
}

/**
 * Posthoc assessment of a pair whose normal successful-row source fingerprint
 * was absent after a native abort. This never overwrites original preregistered
 * acceptance counts or repairs the aborted game.
 *
 * @param {object} baseline Native result row for unchanged control policy.
 * @param {object} selected Native result row for selected policy.
 * @returns {object} Pair-level source identity and first starter evidence.
 */
function auditAbortedOriginalSourcePair(baseline,selected){
  for(const row of [baseline,selected]){
    assert.ok(row?.trial&&typeof row.trial==='object');
    assert.ok(typeof row.trial.id==='string'&&row.trial.id.length);
    assert.ok([5,6,11].includes(row.trial.rank));
    assert.ok(['A','B'].includes(row.trial.candidateSlot));
    assert.ok(Number.isSafeInteger(row.trial.seed)&&
      row.trial.seed>=0&&row.trial.seed<=0xffffffff);
    assert.ok(typeof row.trial.candidateId==='string'&&
      row.trial.candidateId.length>0);
  }
  for(const field of ['id','rank','candidateSlot','candidateId','seed']){
    assert.equal(selected.trial[field],baseline.trial[field],
      'Different registered native attempts cannot form a posthoc pair: '+field);
  }
  const sourceSeat=baseline.trial.candidateSlot==='A'?1:0;
  const a=inspectAbortSource(baseline,sourceSeat);
  const b=inspectAbortSource(selected,sourceSeat);
  const digestKnown=a.digest!==null&&b.digest!==null;
  const sourceDealParity=digestKnown?
    a.digest===b.digest:false;
  const starterKnown=a.starter!==null&&b.starter!==null;
  const sameNativeStarter=starterKnown?
    a.starter===b.starter:false;
  return {
    schema:SCHEMA,trialId:baseline.trial.id,sourceSeat,
    baselineStatus:a.status,selectedStatus:b.status,
    sourceDigestEvidenceKnown:digestKnown,
    sameInitialSourcePhysicalDeal:sourceDealParity,
    nativeStarterEvidenceKnown:starterKnown,
    sameVerifiedNativeStarter:sameNativeStarter,
    posthocPairParityCertified:sourceDealParity&&sameNativeStarter,
    originalReleaseAcceptanceUnchanged:true,
    nativeGameReplayed:false,competitiveGameQualified:false
  };
}

module.exports={SCHEMA,inspectAbortSource,auditAbortedOriginalSourcePair};
