'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {censusCrossCandidateSourceDeals}=
  require('../simulation/evaluation/agent48-archive-selected-v2-census.cjs');

/** @param {string} label */
const digest=label=>createHash('sha256').update(label).digest('hex');

/** @param {string} candidateId @param {string} [source] */
function row(candidateId,source='physical-A'){
  return {
    trial:{
      id:'5:0:A:'+candidateId,rank:5,repeat:0,candidateSlot:'A',
      seed:3423099534,candidateId
    },
    sourceDealFingerprint:digest(source),
    verifiedFirstTurn:true,actualStarterSeat:0
  };
}
const a='champion-reference',b='new-moon-lockbreaker-v1';

test('same registered seed cannot be interpreted as source physical parity',()=>{
  const census=censusCrossCandidateSourceDeals([row(a),row(b,'physical-B')]);
  assert.equal(census.groups,1);
  assert.equal(census.sourceDigestCompared,1);
  assert.equal(census.sourceDigestMismatched,1);
  assert.equal(census.sourceDigestMatched,0);
  assert.equal(census.starterMatched,1);
  assert.equal(census.pairedCandidatePhysicalContrastSupported,false);
  assert.equal(census.competitiveGameQualified,false);
});

test('exact source digest and independently verified native starter can match',()=>{
  const census=censusCrossCandidateSourceDeals([row(a),row(b)]);
  assert.equal(census.sourceDigestMatched,1);
  assert.equal(census.starterMatched,1);
  assert.equal(census.pairedCandidatePhysicalContrastSupported,true);
  assert.equal(census.records[0].sameSeed,true);
});

test('equal source deal alone cannot erase a different real first player',()=>{
  const other=row(b);other.actualStarterSeat=1;
  const census=censusCrossCandidateSourceDeals([row(a),other]);
  assert.equal(census.sourceDigestMatched,1);
  assert.equal(census.starterMatched,0);
  assert.equal(census.pairedCandidatePhysicalContrastSupported,false);
});

test('source digest or native starter absent keeps physical contrast unverified',()=>{
  const other=row(b);other.sourceDealFingerprint=null;
  other.verifiedFirstTurn=false;
  const census=censusCrossCandidateSourceDeals([row(a),other]);
  assert.equal(census.sourceDigestUnknown,1);
  assert.equal(census.starterCompared,0);
  assert.equal(census.pairedCandidatePhysicalContrastSupported,false);
});

test('a source group requires exactly two distinct fixed candidates and equal seeds',()=>{
  assert.throws(()=>censusCrossCandidateSourceDeals([row(a)]),
    /missing its second fixed candidate/);
  assert.throws(()=>censusCrossCandidateSourceDeals([row(a),row(a)]),
    /Duplicate candidate/);
  const other=row(b);other.trial.seed++;
  assert.throws(()=>censusCrossCandidateSourceDeals([row(a),other]),
    /Seed changed/);
});

test('trials must agree with claimed registered IDs',()=>{
  const other=row(b);other.trial.id='malformed-id';
  assert.throws(()=>censusCrossCandidateSourceDeals([row(a),other]));
});


/** Read-only native exception evidence in the same shape as the pinned Store. */
function aborted(candidateId){
  const x=row(candidateId);
  x.status='engine-error';
  x.sourceDealFingerprint=null;
  x.verifiedFirstTurn=undefined;
  x.actualStarterSeat=null;
  const roots=[{actionOrdinal:0,action:'ResolvePromptAction'}];
  x.nativeAbortEvidence={
    schema:'headless-native-abort-public-v1',
    failureStage:'store-dispatch',
    sourceDealFingerprint:{seat:1,digestSha256:digest('physical-A')},
    rootActionCount:1,actionOrdinal:1,rootActionLedger:roots,
    rootActionLedgerSha256:digest(JSON.stringify(roots))
  };
  x.nativeSetupCoinChoiceReceipt={
    status:'consistent-accepted-native-setup-and-first-draw',
    firstSetupOnly:true,nativeFirstDrawVerified:true,
    firstSeatFromVerifiedDraw:0,firstSeatFromAcceptedSetup:0
  };
  return x;
}

test('read-only abort evidence can separately recover censored cross-candidate source and starter parity',()=>{
  const plain=censusCrossCandidateSourceDeals([aborted(a),row(b)]);
  assert.equal(plain.sourceDigestUnknown,1);
  assert.equal(plain.pairedCandidatePhysicalContrastSupported,false);
  const recovered=censusCrossCandidateSourceDeals(
    [aborted(a),row(b)],{recoverNativeAborts:true});
  assert.equal(recovered.sourceDigestCompared,1);
  assert.equal(recovered.sourceDigestMatched,1);
  assert.equal(recovered.groupsWithRecoveredAbortSideDigest,1);
  assert.equal(recovered.starterMatched,1);
  assert.equal(recovered.pairedCandidatePhysicalContrastSupported,true);
});

test('invalid archived abort Store root ledger cannot create a synthetic source pair',()=>{
  const x=aborted(a);
  x.nativeAbortEvidence.rootActionLedgerSha256=digest('tampered');
  const recovered=censusCrossCandidateSourceDeals(
    [x,row(b)],{recoverNativeAborts:true});
  assert.equal(recovered.sourceDigestUnknown,1);
  assert.equal(recovered.groupsWithRecoveredAbortSideDigest,0);
  assert.equal(recovered.pairedCandidatePhysicalContrastSupported,false);
});
