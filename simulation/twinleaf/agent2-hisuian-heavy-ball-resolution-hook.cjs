'use strict';
/*
 * Pinned source-owned native bug repair, default OFF. Hisuian Heavy Ball ASR146
 * reduceEffect leaves the ITEM in player.supporter when chosenPrize==[].
 * The printed text requires discarding it in that branch. Native choose-prompt
 * also gathers all Prize cards; selection must be from originally face-down.
 *
 * Wrap the one genuine prompt callback (not generic prompt handling), with
 * only synchronous temporary interception of Store.prompt during reduceEffect.
 * No vendor edits. Shuffling is a separate pinned native-side hook.
 */
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const BLOB='894450a28fe12cb6291b14f301d7ea05e7b1f1b3';
const HOOK_ID='agent2-pinned-asr146-empty-choice-resolution-v1';
const HOOK_MARK=Symbol.for('experiment-01/'+HOOK_ID);
function fail(code,why){throw Object.assign(new Error(why),{code});}
function isExact(CardClass){
 if(typeof CardClass!=='function'||CardClass.name!=='HisuianHeavyBall')return false;
 try{
  const card=new CardClass();
  return card.name==='Hisuian Heavy Ball'&&
    card.fullName==='Hisuian Heavy Ball ASR'&&
    card.set==='ASR'&&String(card.setNumber)==='146';
 }catch{return false;}
}
function installPinnedHeavyBallResolutionHook({
 CardClass,enginePin,moveCards
}={}){
 if(enginePin!==PIN)fail('ASR146_RESOLUTION_WRONG_PIN','Pinned native revision mismatch');
 if(!isExact(CardClass))fail('ASR146_RESOLUTION_WRONG_CLASS','Not source ASR146');
 if(typeof moveCards!=='function')
  fail('ASR146_RESOLUTION_NO_MOVE_API','Require native MOVE_CARDS event hook');
 const proto=CardClass.prototype,prior=proto[HOOK_MARK];
 if(prior){
  if(proto.reduceEffect!==prior.wrapper)
   fail('ASR146_RESOLUTION_CONFLICT','Native source was overwritten after hook');
  return prior.api;
 }
 const desc=Object.getOwnPropertyDescriptor(proto,'reduceEffect'),orig=desc?.value;
 if(typeof orig!=='function'||desc?.writable!==true)
  fail('ASR146_RESOLUTION_NO_REDUCER','Pinned reduceEffect is not patchable');
 const body=Function.prototype.toString.call(orig);
 if(!['store.prompt','chosenPrize','originallyFaceDown',
      'shuffleFaceDownPrizeCards'].every(x=>body.includes(x)))
  fail('ASR146_RESOLUTION_SOURCE_DRIFT','Pinned reduceEffect source changed');
 const wrapper=function(store,state,effect){
  if(effect?.trainerCard!==this)return orig.call(this,store,state,effect);
  const player=effect.player;
  if(!player||!Array.isArray(player.prizes)||
     !Array.isArray(player.supporter?.cards)||
     !Array.isArray(player.discard?.cards)||
     typeof store?.prompt!=='function')
   fail('ASR146_RESOLUTION_BAD_STATE','No player/prizes/actor Store.prompt');
  if(!player.hand||player.prizes.some(p=>!Array.isArray(p.cards)||
      typeof p.isSecret!=='boolean'))
   fail('ASR146_RESOLUTION_BAD_PRIZES','Missing physical Prize containers');
  const originallyFaceDown=new Set(player.prizes.filter(p=>p.isSecret)
    .flatMap(p=>p.cards));
  const previous=store.prompt;
  const ownDesc=Object.getOwnPropertyDescriptor(store,'prompt');
  if(ownDesc&&!ownDesc.writable)
   fail('ASR146_RESOLUTION_STORE_READONLY','Cannot temporarily intercept prompt');
  let wrappedCount=0;
  const sourceCard=this;
  function intercept(promptState,prompt,callback){
   if(prompt?.constructor?.name!=='ChooseCardsPrompt'||
      prompt.playerId!==player.id)
    return previous.call(store,promptState,prompt,callback);
   if(wrappedCount++)
    fail('ASR146_RESOLUTION_DOUBLE_PROMPT','Duplicate source prompt');
   if(typeof callback!=='function'||
      prompt.message!=='CHOOSE_CARD_TO_HAND'||
      !Array.isArray(prompt.cards?.cards)||
      prompt.options?.min!==0||prompt.options?.max!==1)
    fail('ASR146_RESOLUTION_WRONG_PROMPT','Unsupported native prompt shape');
   return previous.call(store,promptState,prompt,function(chosenPrize){
    if(chosenPrize!==undefined&&chosenPrize!==null&&!Array.isArray(chosenPrize))
     fail('ASR146_RESOLUTION_WRONG_RESULT','Native selection is not Card[]');
    const selected=chosenPrize??[];
    if(selected.length>1)
     fail('ASR146_RESOLUTION_TOO_MANY','At most one Basic may be selected');
    if(selected.some(c=>!originallyFaceDown.has(c)))
     fail('ASR146_RESOLUTION_FACEUP_PRIZE','Selection was not originally face-down');
    const result=callback(chosenPrize);
    if(selected.length===0){
     if(!player.supporter.cards.includes(sourceCard))
      fail('ASR146_RESOLUTION_ITEM_MISSING','Item not held in native Supporter slot');
     // MOVE_CARDS maintains native game action effects and card accounting.
     moveCards(store,promptState,player.supporter,player.discard,{
      cards:[sourceCard],sourceCard
     });
     if(player.supporter.cards.includes(sourceCard)||
        !player.discard.cards.includes(sourceCard))
      fail('ASR146_RESOLUTION_MOVE_FAILED','Native discard did not occur');
    }
    return result;
   });
  }
  try{
   store.prompt=intercept;
   const result=orig.call(this,store,state,effect);
   if(wrappedCount!==1)
    fail('ASR146_RESOLUTION_NO_PROMPT','No source ChooseCardsPrompt intercepted');
   return result;
  }finally{
   if(ownDesc)Object.defineProperty(store,'prompt',ownDesc);
   else delete store.prompt;
  }
 };
 Object.defineProperty(proto,'reduceEffect',{...desc,value:wrapper});
 const api=Object.freeze({
  id:HOOK_ID,enginePin:PIN,sourceBlob:BLOB,
  uninstall(){
   if(proto[HOOK_MARK]?.wrapper!==wrapper||proto.reduceEffect!==wrapper)
    fail('ASR146_RESOLUTION_CONFLICT','Cannot safely uninstall after external change');
   Object.defineProperty(proto,'reduceEffect',desc);
   delete proto[HOOK_MARK];
   return true;
  }
 });
 Object.defineProperty(proto,HOOK_MARK,{
  configurable:true,enumerable:false,writable:false,value:{wrapper,api}
 });
 return api;
}
module.exports={PIN,BLOB,HOOK_ID,isExact,installPinnedHeavyBallResolutionHook};
