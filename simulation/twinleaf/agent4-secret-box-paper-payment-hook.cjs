'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent4-secret-box-twm-paper-mandatory-three-card-cost-v1';
const PRINTING='Secret Box TWM';

/**
 * Source-printed mandatory Secret Box cost: 3 distinct other physical
 * owner-hand cards. Duplicate printing is allowed if physical objects differ.
 * @param {object} prompt Genuine source-stamped native payment prompt
 * @param {unknown} selection Actual ResolvePromptAction card objects
 * @param {object} owner Physical answering player
 * @returns {string|null}
 */
function secretBoxPaymentNegative(prompt,selection,owner){
  if(!Array.isArray(selection)||selection.length!==3)
    return 'SECRET_BOX_REQUIRES_EXACTLY_THREE_OTHER_CARDS';
  if(new Set(selection).size!==3)
    return 'SECRET_BOX_REQUIRES_DISTINCT_PHYSICAL_CARDS';
  const offered=prompt?.cards?.cards;
  const hand=owner?.hand?.cards;
  if(!Array.isArray(offered)||!Array.isArray(hand)||
      selection.some(card=>!offered.includes(card)||!hand.includes(card)))
    return 'SECRET_BOX_PAYMENT_OUTSIDE_PHYSICAL_OWNER_HAND';
  return null;
}

/**
 * Default-off reversible Store cost validation; owner Search category
 * selections are different prompts and are never counted as payment.
 * @template T
 * @param {()=>T} run Synchronous real Store work
 * @param {{Store?:Function,requireLiveStore?:boolean,
 *   currentTrialId?:()=>string|null}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withPaperSecretBoxMandatoryPayment(run,deps={}){
  assert.equal(typeof run,'function');
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(output,
    'game/store/store')).Store;
  const previous=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof previous?.value,'function');
  const liveOnly=deps.requireLiveStore===true;
  const trialKey=()=>deps.currentTrialId?.()??'__single__';
  const liveByTrial=new Map();
  const isLive=store=>!liveOnly||liveByTrial.get(trialKey())===store;
  const audit={version:VERSION,liveStoreRequired:liveOnly,
    liveTrials:0,excludedAuxiliary:0,inspectedRoots:0,
    inspectedPayments:0,optionalSearchPrompts:0,
    vetoedRoots:0,vetoedPayments:0,qualifiedGames:0};
  function dispatch(action,...args){
    const type=action?.constructor?.name;
    if(liveOnly&&type==='AddPlayerAction'&&!liveByTrial.has(trialKey())){
      liveByTrial.set(trialKey(),this);audit.liveTrials++;
    }
    if(!isLive(this)){
      audit.excludedAuxiliary++;
      return previous.value.call(this,action,...args);
    }
    const state=this.state;
    if(type==='PlayCardAction'){
      const owner=state.players?.find(p=>p.id===action.id);
      const selected=owner?.hand?.cards?.[action.handIndex];
      if(selected?.fullName===PRINTING){
        audit.inspectedRoots++;
        if(owner.hand.cards.length<4){
          audit.vetoedRoots++;
          throw Error('PAPER_SECRET_BOX_ROOT_INVALID:THREE_OTHER_CARDS_REQUIRED');
        }
      }
    }
    if(type==='ResolvePromptAction'){
      const prompt=state.prompts?.find(p=>
        p.id===action.id&&p.result===undefined);
      if(prompt?.constructor?.name==='ChooseCardsPrompt'&&
         prompt.sourceCard?.fullName===PRINTING){
        if(prompt.message==='CHOOSE_CARD_TO_DISCARD'){
          audit.inspectedPayments++;
          const owner=state.players.find(p=>p.id===prompt.playerId);
          const violation=secretBoxPaymentNegative(prompt,action.result,owner);
          if(violation){
            audit.vetoedPayments++;
            throw Error('PAPER_SECRET_BOX_PAYMENT_INVALID:'+violation);
          }
        }else if(prompt.message==='CHOOSE_CARD_TO_HAND'){
          audit.optionalSearchPrompts++;
        }
      }
    }
    return previous.value.call(this,action,...args);
  }
  Object.defineProperty(Store.prototype,'dispatch',{...previous,value:dispatch});
  try{return {result:run(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',previous);
  }
}
module.exports={VERSION,secretBoxPaymentNegative,
  withPaperSecretBoxMandatoryPayment};
