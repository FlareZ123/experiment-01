'use strict';
const assert=require('node:assert/strict');
const VERSION='agent7-native-own-playcard-boundary-audit-v1';

/**
 * Observe only printed cards which are actually publicly played from an
 * acting player's hand and the structural prompt that follows.
 * No other player's hand, deck content, or face-down Prize identities read.
 * @template T
 * @param {()=>T} run Native synchronous runner.
 * @param {{headless:object,Store:Function,trialIds:string[]}} deps
 * @returns {{result:T,events:object[]}}
 */
function withOwnPlayCardBoundary(run,{headless,Store,trialIds}){
  assert.equal(typeof run,'function');
  const oldRun=headless.runMatch;
  const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof oldRun,'function');
  assert.equal(typeof oldDispatch?.value,'function');
  const events=[];
  let trialId=null;
  const known=new Set(trialIds);
  assert.equal(known.size,trialIds.length);
  function observedRun(request){
    const next=[...known].find(id=>
      typeof request?.label==='string'&&request.label.endsWith(id));
    const before=trialId;
    trialId=next??null;
    try{return oldRun.call(this,request);}
    finally{trialId=before;}
  }
  function observedDispatch(action,...args){
    const before=this.state;
    const type=action?.constructor?.name??null;
    const actorSeat=before?.players?.findIndex(p=>p.id===action?.id)??-1;
    const actor=before?.players?.[actorSeat];
    const card=type==='PlayCardAction'&&
      (actorSeat===0||actorSeat===1)?
      actor?.hand?.cards?.[action.handIndex]:null;
    const event=trialId&&card?.fullName?{
      trialId,seat:actorSeat,turnBefore:before.turn,
      action:'PlayCardAction',
      publiclyPlayedPrinting:card.fullName,
      nativeAccepted:false,
      subsequentPrompt:null
    }:null;
    let value;
    try{value=oldDispatch.value.call(this,action,...args);}
    catch(error){
      if(event)events.push({...event,dispatchErrorCode:error?.code??null});
      throw error;
    }
    if(event){
      const next=this.state;
      const prompt=next.prompts?.find(p=>p.result===undefined)??null;
      const owner=next.players?.[actorSeat];
      const partner=next.players?.[1-actorSeat];
      const promptZone=prompt?.cards===owner?.deck?'acting-owner-deck':
        prompt?.cards===owner?.hand?'acting-owner-hand':
        prompt?.cards===partner?.deck?'opposing-deck':
        prompt?.cards===partner?.hand?'opposing-hand':
        prompt?.cards?'other':'none';
      const target=next.players?.findIndex(p=>p.id===prompt?.playerId)??-1;
      events.push({...event,nativeAccepted:true,
        nextTurn:next.turn,
        subsequentPrompt:prompt?{
          type:prompt.constructor?.name??null,
          message:typeof prompt.message==='string'?prompt.message:null,
          actorSeat:target<0?null:target,
          zone:promptZone,
          min:Number.isSafeInteger(prompt?.options?.min)?
            prompt.options.min:null,
          max:Number.isSafeInteger(prompt?.options?.max)?
            prompt.options.max:null
        }:null});
    }
    return value;
  }
  headless.runMatch=observedRun;
  Object.defineProperty(Store.prototype,'dispatch',{
    ...oldDispatch,value:observedDispatch
  });
  try{return {result:run(),events};}
  finally{
    assert.strictEqual(headless.runMatch,observedRun);
    assert.strictEqual(Store.prototype.dispatch,observedDispatch);
    Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
    headless.runMatch=oldRun;
  }
}

module.exports={VERSION,withOwnPlayCardBoundary};
