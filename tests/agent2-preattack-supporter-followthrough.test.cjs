'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {publicRoot,auditPreAttackSupporterFollowThrough}=
  require('../simulation/evaluation/agent2-preattack-supporter-followthrough.cjs');

/** @param {0|1} seat @param {number} turn */
function selected(seat,turn){
  return [{seat,globalTurn:turn,intent:{
    kind:'play-conservative-shuffle-supporter',
    printing:"Lillie's Determination M1L",family:'lillie',handIndex:0}}];
}

/** @param {number} ordinal @param {number} turn @param {0|1} seat
 *  @param {string} action @param {object} [rest] */
function root(ordinal,turn,seat,action,rest={}){
  return {actionOrdinal:ordinal,turnBefore:turn,turnAfter:turn,
    playerSlot:seat,action,pendingPrompt:null,...rest};
}

for(const seat of [0,1]){
  test('native Lillie resolution followed by own and opponent roots on seat '+seat,()=>{
    const turn=seat===0?2:4;
    const opponent=1-seat;
    const ledger=[
      root(1,turn,seat,'PlayCardAction',{card:"Lillie's Determination",
        privateOpponentHand:['never publish']}),
      root(2,turn,seat,'ResolvePromptAction',{
        pendingPrompt:'ShuffleDeckPrompt'}),
      root(3,turn,seat,'PlayCardAction',{card:'Ultra Ball'}),
      root(4,turn,seat,'AttackAction',{attack:'Test Attack'}),
      root(5,turn+1,opponent,'PlayCardAction',{card:'Guzma'}),
      root(6,turn+1,opponent,'PassTurnAction'),
      root(7,turn+2,seat,'PlayCardAction',{card:'Energy Retrieval'})
    ];
    const before=JSON.stringify(ledger);
    const output=auditPreAttackSupporterFollowThrough(
      {rootActionLedger:ledger},selected(seat,turn));
    assert.equal(output.verifiedPlayedRootCount,1);
    const witness=output.records[0];
    assert.equal(witness.status,'native-play-card-root-verified');
    assert.equal(witness.playedRoot.actionOrdinal,1);
    assert.equal(witness.nextOwnSameTurnRoot.actionOrdinal,3);
    assert.equal(witness.firstOpponentNewTurnRoot.actionOrdinal,5);
    assert.equal(witness.nextOwnAfterOpponentRoot.actionOrdinal,7);
    assert.equal(witness.sameTurnContinuationObserved,true);
    assert.equal(witness.opponentNewTurnContinuationObserved,true);
    assert.equal(witness.nextOwnerTurnContinuationObserved,true);
    assert.equal(JSON.stringify(output).includes('never publish'),false);
    assert.equal(JSON.stringify(ledger),before);
  });
}

test('capped game remains unqualified with missing later opponent return',()=>{
  const out=auditPreAttackSupporterFollowThrough({
    rootActionLedger:[root(2,2,0,'PlayCardAction',{
      card:"Lillie's Determination"}),
      root(3,2,0,'ResolvePromptAction',{pendingPrompt:'ShuffleDeckPrompt'}),
      root(4,2,0,'PassTurnAction')]},selected(0,2));
  assert.equal(out.verifiedPlayedRootCount,1);
  assert.equal(out.records[0].sameTurnContinuationObserved,true);
  assert.equal(out.records[0].opponentNewTurnContinuationObserved,false);
  assert.equal(out.records[0].nextOwnerTurnContinuationObserved,false);
  assert.equal(out.competitiveGameQualified,false);
});
test('reject nonunique or missing native root without synthesizing success',()=>{
  const one=root(1,2,0,'PlayCardAction',{card:"Lillie's Determination"});
  for(const ledger of [[],[one,root(3,2,0,'PlayCardAction',{
    card:"Lillie's Determination"})]]){
    const result=auditPreAttackSupporterFollowThrough({
      rootActionLedger:ledger},selected(0,2));
    assert.equal(result.verifiedPlayedRootCount,0);
    assert.equal(result.records[0].status,'nonunique-native-supporter-root');
  }
});
test('no intent and missing ledger are explicitly distinguished',()=>{
  assert.equal(auditPreAttackSupporterFollowThrough({},[])
    .status,'no-selected-pre-attack-supporter');
  assert.equal(auditPreAttackSupporterFollowThrough({},selected(1,4))
    .status,'source-public-root-ledger-missing');
});
test('native prompts and opponent prompt actions are not ordinary replies',()=>{
  const ledger=[
    root(10,4,1,'PlayCardAction',{card:"Lillie's Determination"}),
    root(11,4,0,'ResolvePromptAction',{pendingPrompt:'ChooseCardsPrompt'}),
    root(12,5,0,'ResolvePromptAction',{pendingPrompt:'ChooseCardsPrompt'}),
    root(13,5,0,'PassTurnAction')];
  const result=auditPreAttackSupporterFollowThrough({
    rootActionLedger:ledger},selected(1,4));
  assert.equal(result.verifiedPlayedRootCount,1);
  assert.equal(result.records[0].firstOpponentNewTurnRoot.actionOrdinal,13);
});
test('invalid intent or printing fails visibly and keeps native count zero',()=>{
  const ledger=[root(1,2,0,'PlayCardAction',{card:'Professor Juniper'})];
  const selectedBad=[{seat:0,globalTurn:2,intent:{
    kind:'play-conservative-shuffle-supporter',printing:'Professor Juniper BLW'}}];
  const result=auditPreAttackSupporterFollowThrough({
    rootActionLedger:ledger},selectedBad);
  assert.equal(result.records[0].status,'unsupported-printed-family');
});
test('publicRoot redacts unrelated hidden fields',()=>{
  const v=publicRoot(root(1,1,0,'PassTurnAction',{
    opponentPrivate:{cards:['hidden']},ownerHand:['other secret']}));
  assert.equal(v.action,'PassTurnAction');
  assert.equal('opponentPrivate' in v,false);
  assert.equal('ownerHand' in v,false);
});
