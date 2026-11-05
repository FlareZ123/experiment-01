'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {evaluate,VERSION}=require('../simulation/evaluation/agent4-rank6-original-mail-pass14-fork.cjs');
const frozen=require('../results/aichi-2026/registrations/agent4-rank6-trainers-mail-pass14-20261105.json');
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');

function fixture(){
  const prefix=Array.from({length:14},(_,actionOrdinal)=>({
    actionOrdinal,action:'ResolvePromptAction',turnBefore:1,playerSlot:0
  }));
  const hand=["Trainers' Mail ROS", "Trainers' Mail ROS"];
  const reg={...frozen,beforePassRootPrefixLedgerSha256:sha(prefix),
    sourceOwnedHandAtPassSha256:sha(hand)};
  const rows=[
    '6:100:A:champion-reference','6:100:A:new-moon-lockbreaker-v1',
    '6:101:B:champion-reference','6:101:B:new-moon-lockbreaker-v1',
    '11:102:A:champion-reference','11:102:A:new-moon-lockbreaker-v1',
    '11:103:B:champion-reference','11:103:B:new-moon-lockbreaker-v1'
  ].map(id=>({trial:{id},status:'root-cap-censored',rootActionLedger:[]}));
  rows[0]={trial:{id:reg.selectedOriginalId},status:'engine-error',
    sourceDealFingerprint:reg.originalSourceDealSha256,
    fullPhysicalDealFingerprint:reg.originalWholePhysicalDealSha256,
    rootActionLedger:[...prefix,{actionOrdinal:14,turnBefore:1,
      playerSlot:1,action:'PlayCardAction',card:"Trainers' Mail"}]};
  return {reg,observed:{result:{rawDevelopment:{rows}},audit:{
    actorSnapshot:{ownHand:hand},proposedAction:'PlayCardAction'
  }}};
}
test('frozen authentic source identity and both held copies',()=>{
  assert.equal(frozen.originalSourceSeat,1);
  assert.equal(frozen.originalFirstPlayerSeat,1);
  assert.equal(frozen.originalSourceHeldCopiesAtPass,2);
  assert.equal(frozen.sourcePassRootOrdinal,14);
  assert.equal(frozen.preregisteredNativeAttempts,8);
});
test('Store result, deal, hand, and root prefix have independent certificates',()=>{
  const {reg,observed}=fixture();
  const result=evaluate(observed,reg);
  assert.equal(result.schema,VERSION);
  assert.equal(result.completePreTreatmentIdentityProven,true);
  assert.equal(result.physicallyHeldItemAcceptedByStore,true);
  assert.equal(result.competitivelyQualifiedGames,0);
  assert.equal(result.originalAttemptsRetained,8);
});
test('a proposed Item without accepted Store root is a negative outcome',()=>{
  const {reg,observed}=fixture();
  observed.result.rawDevelopment.rows[0].rootActionLedger.pop();
  assert.equal(evaluate(observed,reg).physicallyHeldItemAcceptedByStore,false);
});
test('a changed physical start disqualifies comparison without altering native status',()=>{
  const {reg,observed}=fixture();
  observed.result.rawDevelopment.rows[0].sourceDealFingerprint='different';
  const result=evaluate(observed,reg);
  assert.equal(result.completePreTreatmentIdentityProven,false);
  assert.equal(result.physicallyHeldItemAcceptedByStore,true);
  assert.equal(result.targetNativeStatus,'engine-error');
});
test('a changed root prefix or owner hand fails the matching check',()=>{
  const {reg,observed}=fixture();
  observed.result.rawDevelopment.rows[0].rootActionLedger[5].turnBefore=9;
  observed.audit.actorSnapshot.ownHand.pop();
  const result=evaluate(observed,reg);
  assert.equal(result.originalNativeRootPrefixMatched,false);
  assert.equal(result.sourceOwnerHandMatched,false);
  assert.equal(result.completePreTreatmentIdentityProven,false);
});
test('another Item cannot be misclassified as the original Mail',()=>{
  const {reg,observed}=fixture();
  observed.result.rawDevelopment.rows[0].rootActionLedger[14].card='Ultra Ball';
  assert.equal(evaluate(observed,reg).physicallyHeldItemAcceptedByStore,false);
});
