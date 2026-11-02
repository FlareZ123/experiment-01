'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent4-quick-ball-paper-mandatory-discard-v1';
const PRINTINGS=new Set(['Quick Ball FST','Quick Ball SSH']);

/**
 * An original Sword & Shield Quick Ball requires exactly one OTHER physical
 * card from its owner's hand as payment. This examines the genuine pending
 * payment prompt, never relying on its native validate() implementation.
 * @param {object} prompt Source-marked pending ChooseCardsPrompt
 * @param {unknown} answer Physical cards selected by the native actor
 * @returns {string|null} Independently invalid printed cost, or null
 */
function quickBallPaymentNegative(prompt,answer){
  if(!Array.isArray(answer)||answer.length!==1)
    return 'QUICK_BALL_PRINTED_PAYMENT_REQUIRES_EXACTLY_ONE';
  if(!Array.isArray(prompt?.cards?.cards)||
      !prompt.cards.cards.includes(answer[0]))
    return 'QUICK_BALL_PAYMENT_OUTSIDE_PHYSICAL_OWNER_HAND';
  return null;
}

/**
 * Reversible research-only Store guard. Source printing and actual physical
 * ownership scope both root and prompt checks; it is not automatically
 * integrated into the canonical benchmark.
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
    vetoedRoots:0,vetoedPayments:0,paperQualifiedGames:0,
    ownerInformationLeakIntoPolicy:false};
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
        audit.inspectedPayments++;
        const violation=quickBallPaymentNegative(prompt,action.result);
        if(violation){
          audit.vetoedPayments++;
          throw Error('PAPER_QUICK_BALL_PAYMENT_INVALID:'+violation);
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
