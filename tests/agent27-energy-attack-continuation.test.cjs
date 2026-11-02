'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {joinSourceEnergyAttackContinuation}=require(
  '../simulation/evaluation/agent27-energy-attack-continuation.cjs');

const settledReceipt={
  promptId:57,actorSeat:0,globalTurn:20,
  nativeStoreActionAccepted:true,twoDistinctPhysicalCards:true,
  bothOriginalSourceCards:true,bothAttachedToOriginalActive:true
};

function nativeMatch(){
  return {
    publicAttackTransitions:[{
      actionOrdinal:48,turnBefore:20,triggerPlayerSlot:0,
      declarations:[{attackName:'Celestial Roar'}],
      beforePrizesRemaining:[6,6],before:{sentinel:'before'},
      settled:{completionRootActionOrdinal:57,
        prizesRemaining:[6,6],after:{sentinel:'after'}}
    }],
    rootActionLedger:[
      {actionOrdinal:55,turnBefore:20,playerSlot:0,action:'ResolvePromptAction',pendingPrompt:'AttachEnergyPrompt'},
      {actionOrdinal:57,turnBefore:20,playerSlot:0,action:'ResolvePromptAction',pendingPrompt:'AttachEnergyPrompt'},
      {actionOrdinal:58,turnBefore:21,playerSlot:1,action:'PlayCardAction',card:'Quick Ball',pendingPrompt:null},
      {actionOrdinal:59,turnBefore:21,playerSlot:1,action:'ResolvePromptAction',pendingPrompt:'ChooseCardsPrompt'},
      {actionOrdinal:60,turnBefore:21,playerSlot:1,action:'AttackAction',attack:'Claw',pendingPrompt:null},
      {actionOrdinal:61,turnBefore:22,playerSlot:0,action:'PlayCardAction',pendingPrompt:null}
    ]
  };
}

test('requires accepted physical two-energy transfer before an attack can be linked',()=>{
  const match=nativeMatch();
  const x=joinSourceEnergyAttackContinuation(match,[
    {...settledReceipt,nativeStoreActionAccepted:false}],0);
  assert.equal(x.promptEpisodes[0].status,'physical-attachment-unverified');
  assert.equal(x.promptEpisodes[0].opponentReply,null);
});

test('only accepted settled same-turn Celestial Roar and actual next opponent roots count',()=>{
  const x=joinSourceEnergyAttackContinuation(nativeMatch(),[settledReceipt],0);
  const row=x.promptEpisodes[0];
  assert.equal(row.status,'native-settled-source-attack-with-opponent-root');
  assert.equal(row.sourceAttack.settledRootOrdinal,57);
  assert.deepEqual(row.sourceAttack.afterPrizesRemaining,[6,6]);
  assert.equal(row.opponentReply.turn,21);
  assert.deepEqual(row.opponentReply.actions.map(a=>a.action),
    ['PlayCardAction','AttackAction']);
  assert.equal(x.qualifiedCompetitiveGames,0);
});

test('failed and ambiguous attack matches cannot silently count as completed',()=>{
  const original=nativeMatch();
  const none=joinSourceEnergyAttackContinuation({
    ...original,publicAttackTransitions:[]},[settledReceipt],0);
  assert.equal(none.promptEpisodes[0].status,'source-attack-not-bound');
  const multiple=joinSourceEnergyAttackContinuation({
    ...original,publicAttackTransitions:[...original.publicAttackTransitions,
      {...original.publicAttackTransitions[0],actionOrdinal:49}]},[settledReceipt],0);
  assert.equal(multiple.promptEpisodes[0].status,'ambiguous-source-attack');
});

test('source after attack with no owner-opponent response remains censored',()=>{
  const match=nativeMatch();
  match.rootActionLedger.length=2;
  const x=joinSourceEnergyAttackContinuation(match,[settledReceipt],0);
  assert.equal(x.promptEpisodes[0].status,
    'native-settled-source-attack-no-opponent-root');
  assert.equal(x.promptEpisodes[0].opponentReply,null);
});
