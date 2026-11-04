'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {auditInitialVsLiveSourceHands}=
  require('../simulation/evaluation/agent16-initial-vs-live-hand-pair-audit.cjs');

const H=x=>x.repeat(64);
/** @param {'a'|'b'} id */
function row(id){
  return {
    trial:{rank:16,repeat:1,candidateSlot:'B',seed:321,
      candidateId:id},
    sourceSeat:0,verifiedFirstTurn:true,actualStarterSeat:1,
    sourceDealFingerprint:H('a'),
    sourceFirstOwnHandProtocol:'first-live-owner-hand-prebot-v1',
    sourceFirstOwnHandSha256:H('b'),
    sourceFirstOwnHandMultisetSha256:H('c'),
    sourceLegacyFirstObservedHandSha256:H('d')
  };
}

test('same genuine initial source deal can have a different later source hand',()=>{
  const a=row('a'),b=row('b');
  b.sourceFirstOwnHandSha256=H('e');
  b.sourceFirstOwnHandMultisetSha256=H('f');
  const result=auditInitialVsLiveSourceHands(a,b);
  assert.equal(result.pairedAtInitialRoot,true);
  assert.equal(result.initialDealStatus,'MATCHED');
  assert.equal(result.orderedLiveStatus,'MISMATCHED');
  assert.equal(result.multisetLiveStatus,'MISMATCHED');
  assert.equal(result.sourceActuallySecond,true);
  assert.equal(result.postStartHandInterpretation,'POSSIBLE_OPPONENT_TURN_EFFECT');
  assert.equal(result.competitiveQualifiedGames,0);
});

test('identical legacy setup hand cannot override different initial deal',()=>{
  const a=row('a'),b=row('b');
  b.sourceDealFingerprint=H('e');
  assert.equal(a.sourceLegacyFirstObservedHandSha256,
    b.sourceLegacyFirstObservedHandSha256);
  const result=auditInitialVsLiveSourceHands(a,b);
  assert.equal(result.pairedAtInitialRoot,false);
  assert.equal(result.postStartHandInterpretation,'NO_VERIFIED_INITIAL_PAIR');
});

test('different live order with matching multisets remains downstream',()=>{
  const a=row('a'),b=row('b');
  b.sourceFirstOwnHandSha256=H('e');
  const result=auditInitialVsLiveSourceHands(a,b);
  assert.equal(result.orderedLiveStatus,'MISMATCHED');
  assert.equal(result.multisetLiveStatus,'MATCHED');
  assert.equal(result.pairedAtInitialRoot,true);
});

test('legacy or absent first-live protocol is UNKNOWN, not treated as equality',()=>{
  const a=row('a'),b=row('b');
  b.sourceFirstOwnHandProtocol=null;
  const result=auditInitialVsLiveSourceHands(a,b);
  assert.equal(result.orderedLiveStatus,'UNKNOWN');
  assert.equal(result.multisetLiveStatus,'UNKNOWN');
  assert.equal(result.pairedAtInitialRoot,true);
});

test('starter and seat mismatches prevent initial-root pairing',()=>{
  const a=row('a'),b=row('b');
  b.actualStarterSeat=0;
  assert.equal(auditInitialVsLiveSourceHands(a,b).pairedAtInitialRoot,false);
  b.actualStarterSeat=1;
  b.sourceSeat=1;
  assert.equal(auditInitialVsLiveSourceHands(a,b).pairedAtInitialRoot,false);
});

test('unverified digest cannot certify initial pair',()=>{
  const a=row('a'),b=row('b');
  b.sourceDealFingerprint='not a sha';
  const result=auditInitialVsLiveSourceHands(a,b);
  assert.equal(result.initialDealStatus,'UNKNOWN');
  assert.equal(result.pairedAtInitialRoot,false);
});

test('different experiment coordinates are rejected',()=>{
  const a=row('a'),b=row('b');
  b.trial.seed=322;
  assert.throws(()=>auditInitialVsLiveSourceHands(a,b));
});
