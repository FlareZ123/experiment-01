'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {auditFirstSourcePassPrechoiceHand:audit}=
  require('../simulation/evaluation/agent18-first-source-pass-prechoice-hand-contract.cjs');
const digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const hand=['Iron Thorns ex TWM 77','Guzma BUS 115'];
const pass=()=>({actionOrdinal:17,role:'source',actorSeat:0,
  ownerHandAtChosenPass:hand,ownerHandSha256:digest(hand)});
const row=()=>({trial:{id:'6:101:B:champion-reference'},
  sourceSeat:0,sourceFirstOwnHandProtocol:'first-live-owner-hand-prebot-v1',
  sourceFirstOwnHandFirstActionOrdinal:17,
  sourceFirstOwnHandSha256:digest(hand),nativeAllOwnerPassFrontier:{
    sourceSeat:0,completeNativePassCoverage:true,receipts:[pass()]}});
test('same first-action source hand is attested without exposing it',()=>{
  const result=audit(row());
  assert.equal(result.status,'FIRST_SOURCE_PASS_HAND_PRECHOICE_EQUALS_POSTCHOICE');
  assert.equal(result.exposedHandHashes,false);
  assert.ok(!JSON.stringify(result).includes('Iron Thorns'));
});
test('post-choice changes in the same first action are detected',()=>{
  const input=row();input.nativeAllOwnerPassFrontier.receipts[0]
    ={...pass(),ownerHandAtChosenPass:['Guzma BUS 115'],
      ownerHandSha256:digest(['Guzma BUS 115'])};
  assert.equal(audit(input).status,'FIRST_SOURCE_PASS_HAND_CHANGED_DURING_DECISION');
});
test('mid-turn Pass cannot be confused with a first pre-bot action',()=>{
  const input=row();input.sourceFirstOwnHandFirstActionOrdinal=13;
  assert.equal(audit(input).status,'FIRST_SOURCE_ACTION_NOT_OBSERVED_AS_PASS');
});
test('forged hash, duplicate Pass, missing all-owner receipt fail closed',()=>{
  const bad=row();bad.nativeAllOwnerPassFrontier.receipts[0].ownerHandSha256='0'.repeat(64);
  assert.equal(audit(bad).status,'INVALID_POSTCHOICE_OWNER_PASS_RECEIPT');
  const dup=row();dup.nativeAllOwnerPassFrontier.receipts.push(pass());
  assert.equal(audit(dup).status,'DUPLICATE_FIRST_SOURCE_PASS_RECEIPTS');
  const gone=row();delete gone.nativeAllOwnerPassFrontier;
  assert.equal(audit(gone).status,'UNVERIFIED_SOURCE_HAND_CUSTODY');
});
test('source seat mismatch fails closed',()=>{
  const mismatch=row();mismatch.nativeAllOwnerPassFrontier.sourceSeat=1;
  assert.equal(audit(mismatch).status,'UNVERIFIED_SOURCE_HAND_CUSTODY');
});
