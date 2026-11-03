'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {inspectAbortSource,auditAbortedOriginalSourcePair}=
  require('../simulation/evaluation/agent48-aborted-source-pair-posthoc.cjs');

/** @param {string} value */
const hash=value=>createHash('sha256').update(value).digest('hex');

/** Construct a detached native-shaped postgame receipt, never a game. */
function archived(mode='baseline'){
  const roots=[
    {actionOrdinal:0,action:'ResolvePromptAction'},
    {actionOrdinal:1,action:'ResolvePromptAction'},
    {actionOrdinal:2,action:'PassTurnAction'}
  ];
  const sourceDeal=hash('physical-original-source-deal');
  return {
    trial:{id:'6:300:A:champion-reference',rank:6,repeat:300,
      candidateSlot:'A',candidateId:'champion-reference',seed:3738819225},
    status:'engine-error',error:'native Store UNKNOWN_POWER '+mode,
    nativeAbortEvidence:{
      schema:'headless-native-abort-public-v1',
      failureStage:'store-dispatch',actionName:'UseAbilityAction',
      actionOrdinal:3,rootActionCount:3,rootActionLedger:roots,
      rootActionLedgerSha256:hash(JSON.stringify(roots)),
      sourceDealFingerprint:{seat:1,digestSha256:sourceDeal}
    },
    nativeSetupCoinChoiceReceipt:{
      status:'consistent-accepted-native-setup-and-first-draw',
      firstSetupOnly:true,nativeFirstDrawVerified:true,
      firstSeatFromVerifiedDraw:0,firstSeatFromAcceptedSetup:0
    }
  };
}

test('same native abort-side physical deal and real starter establish posthoc pair only',()=>{
  const result=auditAbortedOriginalSourcePair(
    archived('baseline'),archived('selected'));
  assert.equal(result.posthocPairParityCertified,true);
  assert.equal(result.originalReleaseAcceptanceUnchanged,true);
  assert.equal(result.nativeGameReplayed,false);
  assert.equal(result.competitiveGameQualified,false);
});

test('identical action/seed but different original source deal fails pair',()=>{
  const b=archived('selected');
  b.nativeAbortEvidence.sourceDealFingerprint.digestSha256=hash('different');
  const result=auditAbortedOriginalSourcePair(archived(),b);
  assert.equal(result.sameInitialSourcePhysicalDeal,false);
  assert.equal(result.sourceDigestEvidenceKnown,true);
  assert.equal(result.posthocPairParityCertified,false);
});

test('absent source or wrong original seat never counts as a matching deal',()=>{
  const missing=archived('selected');
  missing.nativeAbortEvidence.sourceDealFingerprint=null;
  const result=auditAbortedOriginalSourcePair(archived(),missing);
  assert.equal(result.selectedStatus,'MISSING_OR_WRONG_SEAT_SOURCE_DEAL');
  assert.equal(result.sourceDigestEvidenceKnown,false);
  assert.equal(result.posthocPairParityCertified,false);
  const wrong=archived();
  wrong.nativeAbortEvidence.sourceDealFingerprint.seat=0;
  assert.equal(inspectAbortSource(wrong,1).digest,null);
});

test('native action clock and root ledger SHA must match',()=>{
  const row=archived();
  row.nativeAbortEvidence.rootActionCount=2;
  assert.equal(inspectAbortSource(row,1).status,
    'UNVERIFIED_NATIVE_ABORT_ROOT_LEDGER');
  const tampered=archived();
  tampered.nativeAbortEvidence.rootActionLedger[2].action='AttackAction';
  assert.equal(inspectAbortSource(tampered,1).status,
    'UNVERIFIED_NATIVE_ABORT_ROOT_LEDGER');
});

test('a valid source digest cannot independently establish first native turn',()=>{
  const row=archived();
  row.nativeSetupCoinChoiceReceipt.status='native-first-draw-unverified';
  const result=auditAbortedOriginalSourcePair(archived(),row);
  assert.equal(result.sameInitialSourcePhysicalDeal,true);
  assert.equal(result.nativeStarterEvidenceKnown,false);
  assert.equal(result.posthocPairParityCertified,false);
});

test('different physical starting seats veto pair despite matching source digest',()=>{
  const row=archived();
  row.nativeSetupCoinChoiceReceipt.firstSeatFromVerifiedDraw=1;
  row.nativeSetupCoinChoiceReceipt.firstSeatFromAcceptedSetup=1;
  const result=auditAbortedOriginalSourcePair(archived(),row);
  assert.equal(result.sameInitialSourcePhysicalDeal,true);
  assert.equal(result.sameVerifiedNativeStarter,false);
  assert.equal(result.posthocPairParityCertified,false);
});

test('never pair unlike registered trial identities or silently reinterpret success',()=>{
  const b=archived();
  b.trial.seed+=1;
  assert.throws(()=>auditAbortedOriginalSourcePair(archived(),b),
    /Different registered native attempts/);
  const successful=archived();
  successful.status=undefined;
  const result=auditAbortedOriginalSourcePair(archived(),successful);
  assert.equal(result.selectedStatus,'NOT_A_NATIVE_ABORT');
  assert.equal(result.posthocPairParityCertified,false);
});

test('disagreeing top-level and native abort digest vetoes recovery',()=>{
  const b=archived();
  b.sourceDealFingerprint=hash('inconsistent');
  const result=auditAbortedOriginalSourcePair(archived(),b);
  assert.equal(result.selectedStatus,'CONFLICTING_SUCCESS_AND_ABORT_DIGEST');
  assert.equal(result.posthocPairParityCertified,false);
});
