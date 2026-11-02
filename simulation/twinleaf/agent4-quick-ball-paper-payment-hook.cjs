'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent4-quick-ball-printed-mandatory-payment-v2-search-is-distinct';
const PRINTINGS=new Set(['Quick Ball FST','Quick Ball SSH']);
const PAYMENT_MESSAGE='CHOOSE_CARD_TO_DISCARD';

/**
 * Printed Quick Ball discards exactly one OTHER owner-hand card. The engine
 * also has an entirely different, optional own-deck Basic search prompt.
 * Only the mandatory payment prompt may be checked by this predicate.
 *
 * @param {object} prompt Actual native CHOOSE_CARD_TO_DISCARD prompt
 * @param {unknown} answer Original physical cards selected for discard
 * @param {object} owner Original physical owner, read only for payment validation
 * @returns {string|null} A proved invalid physical payment or no invalidity
 */
function quickBallPaymentNegative(prompt,answer,owner){
  if(!Array.isArray(answer)||answer.length!==1)
    return 'QUICK_BALL_PRINTED_PAYMENT_REQUIRES_EXACTLY_ONE';
  const offered=prompt?.cards?.cards;
  const hand=owner?.hand?.cards;
  if(!Array.isArray(offered)||!Array.isArray(hand)||
      !offered.includes(answer[0])||!hand.includes(answer[0]))
    return 'QUICK_BALL_PAYMENT_OUTSIDE_PHYSICAL_OWNER_HAND';
  return null;
}

/**
 * Reversible research-only native Store guard for genuine printed Quick Ball.
 * The pinned engine can pay one unambiguous cost automatically at root,
 * before its later optional Basic search prompt. Never intercept the search.
 * Does not select any cards for the actor or certify competent decisions.
 *
 * @template T
 * @param {()=>T} execute Synchronous actual Store workload
 * @param {{Store?:Function}} [deps] Native test injection
 * @returns {{result:T,audit:object}}
 */
function withPaperQuickBallMandatoryPayment(execute,deps={}){
  assert.equal(typeof execute,'function');
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(output,
    'game/store/store')).Store;
  const previous=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof previous?.value,'function');
  const audit={version:VERSION,inspectedRoots:0,inspectedPayments:0,
    ignoredOptionalSearchPrompts:0,vetoedRoots:0,vetoedPayments:0,
    paperQualifiedGames:0,decisionsChanged:false};
  function dispatch(action,...args){
    const state=this.state;
    const actionName=action?.constructor?.name;
    if(actionName==='PlayCardAction'){
      const owner=state.players?.find(p=>p.id===action.id);
      const held=owner?.hand?.cards;
      const played=held?.[action.handIndex];
      if(PRINTINGS.has(played?.fullName)){
        audit.inspectedRoots++;
        if(held.filter(card=>card!==played).length<1){
          audit.vetoedRoots++;
          throw Error('PAPER_QUICK_BALL_ROOT_INVALID:ONE_OTHER_CARD_REQUIRED');
        }
      }
    }
    if(actionName==='ResolvePromptAction'){
      const prompt=state.prompts?.find(p=>
        p.id===action.id&&p.result===undefined);
      if(prompt?.constructor?.name==='ChooseCardsPrompt'&&
          PRINTINGS.has(prompt.sourceCard?.fullName)){
        if(prompt.message===PAYMENT_MESSAGE){
          audit.inspectedPayments++;
          const owner=state.players?.find(p=>p.id===prompt.playerId);
          const violation=quickBallPaymentNegative(prompt,action.result,owner);
          if(violation){
            audit.vetoedPayments++;
            throw Error('PAPER_QUICK_BALL_PAYMENT_INVALID:'+violation);
          }
        }else if(prompt.message==='CHOOSE_CARD_TO_HAND'){
          audit.ignoredOptionalSearchPrompts++;
        }
      }
    }
    return previous.value.call(this,action,...args);
  }
  Object.defineProperty(Store.prototype,'dispatch',
    {...previous,value:dispatch});
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',previous);
  }
}
module.exports={VERSION,quickBallPaymentNegative,
  withPaperQuickBallMandatoryPayment};
