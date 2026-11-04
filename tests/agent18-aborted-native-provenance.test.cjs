'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {createHash} = require('node:crypto');
const {extractNativeAbortProvenance} =
  require('../simulation/evaluation/agent18-aborted-native-provenance.cjs');

const h = c => c.repeat(64);
function witness(seat = 1) {
  const roots = [{action:'PlayCardAction',seat:1},{action:'PassTurnAction',seat:0}];
  return {
    schema:'headless-native-abort-public-v1',
    sourceDealFingerprint:{seat,digestSha256:h('a')},
    fullPhysicalDealFingerprint:{
      schema:'initial-full-physical-deal-sha256-v1',digestSha256:h('b')
    },
    rootActionLedger:roots,
    rootActionCount:roots.length,
    rootActionLedgerSha256:createHash('sha256')
      .update(JSON.stringify(roots)).digest('hex')
  };
}

test('aborted seat-A has source seat one and retains verified provenance',()=>{
  const a = extractNativeAbortProvenance({candidateSlot:'A'},witness(1));
  assert.equal(a.sourceDealFingerprint,h('a'));
  assert.equal(a.fullPhysicalDealFingerprint,h('b'));
  assert.equal(a.nativeRootActionCount,2);
  assert.equal(a.nativeAbortProvenance.sourceDealStatus,'VERIFIED');
  assert.equal(a.nativeAbortProvenance.acceptedRootLedgerStatus,'VERIFIED');
  assert.equal(a.nativeAbortProvenance.competitiveGameQualified,false);
});
test('seat-B requires source seat zero',()=>{
  const a=extractNativeAbortProvenance({candidateSlot:'B'},witness(0));
  assert.equal(a.sourceDealFingerprint,h('a'));
  assert.equal(a.nativeAbortProvenance.sourceSeat,0);
});
test('wrong physical source seat never yields a comparison fingerprint',()=>{
  const a=extractNativeAbortProvenance({candidateSlot:'B'},witness(1));
  assert.equal(a.sourceDealFingerprint,null);
  assert.equal(a.fullPhysicalDealFingerprint,h('b'));
  assert.equal(a.nativeAbortProvenance.sourceDealStatus,'SOURCE_SEAT_MISMATCH');
});
test('no abort receipt cannot synthesize physical deals from registration',()=>{
  const a=extractNativeAbortProvenance({candidateSlot:'A',seed:123},null);
  assert.equal(a.sourceDealFingerprint,null);
  assert.equal(a.fullPhysicalDealFingerprint,null);
  assert.equal(a.nativeRootActionCount,null);
  assert.equal(a.nativeAbortProvenance.sourceDealStatus,'NO_VERIFIED_RECEIPT');
});
test('invalid digest, full-deal schema and ledger count each fail closed',()=>{
  const receipt=witness();
  receipt.sourceDealFingerprint.digestSha256='bad';
  receipt.fullPhysicalDealFingerprint.schema='fake';
  receipt.rootActionCount=3;
  const a=extractNativeAbortProvenance({candidateSlot:'A'},receipt);
  assert.equal(a.sourceDealFingerprint,null);
  assert.equal(a.fullPhysicalDealFingerprint,null);
  assert.equal(a.nativeRootActionCount,null);
  assert.equal(a.nativeAbortProvenance.sourceDealStatus,'INVALID_SOURCE_DIGEST');
  assert.equal(a.nativeAbortProvenance.fullPhysicalDealStatus,'INVALID_FULL_DEAL');
  assert.equal(a.nativeAbortProvenance.acceptedRootLedgerStatus,'INVALID_LEDGER');
});
test('mutating ledger after digesting it invalidates accepted root count',()=>{
  const receipt=witness();
  receipt.rootActionLedger[0].action='fake';
  const a=extractNativeAbortProvenance({candidateSlot:'A'},receipt);
  assert.equal(a.nativeRootActionCount,null);
  assert.equal(a.nativeAbortProvenance.acceptedRootLedgerStatus,'INVALID_LEDGER');
});
test('unrecognized receipt schema is not trusted',()=>{
  const receipt=witness();
  receipt.schema='future-v999';
  const a=extractNativeAbortProvenance({candidateSlot:'A'},receipt);
  assert.equal(a.sourceDealFingerprint,null);
  assert.equal(a.fullPhysicalDealFingerprint,null);
  assert.equal(a.nativeRootActionCount,null);
});
test('reject unregistered physical slot',()=>{
  assert.throws(()=>extractNativeAbortProvenance({candidateSlot:'X'},witness()),
    /Registered trial/);
});

test('first-turn custody requires verified native first draw',()=>{
  const good=witness();
  good.initialTurnOrderEvidence={firstTurnSlot:0,verifiedByDrawLog:true};
  const matched=extractNativeAbortProvenance({candidateSlot:'A'},good);
  assert.equal(matched.actualStarterSeat,0);
  assert.equal(matched.verifiedFirstTurn,true);
  assert.equal(matched.nativeAbortProvenance.firstTurnStatus,'VERIFIED');
  good.initialTurnOrderEvidence.verifiedByDrawLog=false;
  const failed=extractNativeAbortProvenance({candidateSlot:'A'},good);
  assert.equal(failed.actualStarterSeat,null);
  assert.equal(failed.verifiedFirstTurn,false);
  assert.equal(failed.nativeAbortProvenance.firstTurnStatus,'UNVERIFIED');
});
