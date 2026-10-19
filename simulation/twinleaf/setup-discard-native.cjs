'use strict';
const assert=require('node:assert/strict');
const {stageSourceDeck}=require('./setup-discard-stage.cjs');
const {chooseSetupDeckDiscards}=require('./setup-discard-prompt-planner.cjs');
const {installBattleCompressorMinimumHook}=require('./battle-compressor-minimum-hook.cjs');
/**
 * Source-inventory-locked Store fixture: actual Item, selection, shuffle and
 * animation prompts. No sampled game or tactical performance inference.
 * @param {'rank26'|'newmoon'} kind
 * @returns {object}
 */
function nativeSetupDiscard(kind){
 const {store,state,owner,goals,load}=stageSourceDeck(kind);
 const {PlayCardAction,PlayerType,SlotType}=load('game/store/actions/play-card-action');
 const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
 const pending=()=>state.prompts.filter(p=>p.result===undefined);
 const restore=installBattleCompressorMinimumHook();
 try {
  store.dispatch(new PlayCardAction(owner.id,0,{player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
  const prompt=pending().find(p=>p.constructor.name==='ChooseCardsPrompt');
  assert.ok(prompt);assert.equal(prompt.options.min,1);
  const decision=chooseSetupDeckDiscards(prompt,owner,goals,-100);
  assert.ok(decision && decision.selectedGoals>0);
  assert.equal(prompt.validate(decision.cards),true);
  store.dispatch(new ResolvePromptAction(prompt.id,decision.cards));
  const shuffle=pending().find(p=>p.constructor.name==='ShuffleDeckPrompt');
  assert.ok(shuffle);
  const permutation=Array.from({length:owner.deck.cards.length},(_,i)=>i);
  assert.equal(shuffle.validate(permutation,state),true);
  store.dispatch(new ResolvePromptAction(shuffle.id,permutation));
  const wait=pending().find(p=>p.constructor.name==='WaitPrompt');
  assert.ok(wait);store.dispatch(new ResolvePromptAction(wait.id,null));
  assert.deepEqual(pending(),[]);
  assert.ok(owner.discard.cards.some(c=>c.fullName==='Battle Compressor PHF'));
  for(const n of decision.printings)
   assert.ok(owner.discard.cards.some(c=>c.fullName===n));
  return {kind,physicalRegistered60:true,discarded:decision.printings,
   nativeStoreAccepted:true,pendingPromptCount:pending().length,
   constructedMechanicalFixture:true,qualifiedCompetitiveGames:0};
 }finally{restore()}
}
if(require.main===module)console.log(JSON.stringify({
 rank26:nativeSetupDiscard('rank26'),newmoon:nativeSetupDiscard('newmoon')},null,2));
module.exports={nativeSetupDiscard};
