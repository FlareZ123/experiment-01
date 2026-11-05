'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {auditOriginalSourceHandCrossRunParity:audit}=
  require('../simulation/evaluation/agent18-cross-run-original-owner-hand-parity.cjs');
const sha=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const hand=['Tool Jammer BST','Tag Call CEC'];
const first=()=>({opportunities:[{id:'6:101:B:champion-reference',
  sourceSeat:0,globalTurn:2,passRootOrdinal:17,
  sourceDealMatched:true,fullDealMatched:true,rootTapeMatched:true,
  exactHistoricRootReproduced:true,actualPassAccepted:true,
  ownerActorObservationVerified:true,
  ownerVisibleBeforeChoice:{actorSeat:0,globalTurn:2,ownHand:hand}}]});
const second=()=>({attempts:[{id:'6:101:B:champion-reference',
  sourceSeat:0,completeNativeOwnerPassCoverage:true,
  ownerPassObservations:[{ordinal:17,turn:2,ownerHandAtPass:hand,
    ownerHandSha256:sha(hand)}]}]});
test('exact original root independently observed twice has matching hand',()=>{
  const x=audit(first(),second());
  assert.equal(x.verifiedUnchangedHands,1);
  assert.equal(x.changedOrUnverifiedHands,0);
  assert.equal(x.noPrivateHandHashesExposed,true);
  assert.ok(!JSON.stringify(x).includes('Tool Jammer'));
  assert.equal(x.competitivelyQualifiedGames,0);
});
test('post-choice mutation is visible with a valid receipt checksum',()=>{
  const b=second();
  b.attempts[0].ownerPassObservations[0].ownerHandAtPass=['Tag Call CEC'];
  b.attempts[0].ownerPassObservations[0].ownerHandSha256=sha(['Tag Call CEC']);
  assert.equal(audit(first(),b).rows[0].status,
    'INDEPENDENT_PREPOST_SOURCE_HAND_CHANGED');
});
test('counterfeit postchoice digest fails instead of claiming equality',()=>{
  const b=second();b.attempts[0].ownerPassObservations[0].ownerHandSha256='0'.repeat(64);
  assert.equal(audit(first(),b).rows[0].status,
    'OWNER_PREPOST_HAND_OR_SEAT_UNVERIFIED');
});
test('different source owner is a custody failure',()=>{
  const b=second();b.attempts[0].sourceSeat=1;
  assert.equal(audit(first(),b).rows[0].status,
    'OWNER_PREPOST_HAND_OR_SEAT_UNVERIFIED');
});
test('different native root or missing complete coverage is rejected',()=>{
  const b=second();b.attempts[0].ownerPassObservations[0].ordinal=18;
  assert.equal(audit(first(),b).rows[0].status,
    'POSTCHOICE_SOURCE_ROOT_UNVERIFIED');
  const c=second();c.attempts[0].completeNativeOwnerPassCoverage=false;
  assert.equal(audit(first(),c).rows[0].status,
    'POSTCHOICE_RUN_OR_COVERAGE_UNVERIFIED');
});
test('postchoice hand cannot turn unverified prechoice deal into certainty',()=>{
  const a=first();a.opportunities[0].fullDealMatched=false;
  assert.equal(audit(a,second()).rows[0].status,
    'PRECHOICE_SOURCE_OR_ROOT_UNVERIFIED');
});
