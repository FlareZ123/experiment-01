'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent12-bellelba-optional-three-other-payment-v1';
const PRINTING='Bellelba & Brycen-Man CEC';

/**
 * Optional TAG TEAM Supporter branch requires exactly three distinct other
 * physical cards currently in the owner's hand.
 * @param {unknown} selected Native ResolvePromptAction result.
 * @param {object} hand Owner's physical hand.
 * @param {object} prompt Native hand-selection prompt.
 * @returns {string|null} Fail-closed paper violation.
 */
function paperOptionalPaymentNegative(selected,hand,prompt){
  if(!Array.isArray(selected)||selected.length!==3)
    return 'REQUIRES_THREE_OTHER_CARDS';
  if(new Set(selected).size!==3)
    return 'CARDS_MUST_BE_DISTINCT_PHYSICAL_OBJECTS';
  if(!Array.isArray(hand?.cards)||!Array.isArray(prompt?.cards?.cards)||
    selected.some(c=>!hand.cards.includes(c)||!prompt.cards.cards.includes(c)))
    return 'CARDS_OUTSIDE_OWNER_HAND_OR_OFFERED_PROMPT';
  return null;
}

/**
 * Reversible, default-off guard for Bellelba's optional three-card cost.
 * A failed optional choice does not invalidate the legal base mill-three
 * Supporter effect; the owner may choose "no" to the optional ConfirmPrompt.
 * Does not claim source-dealt full game support or paper certification.
 *
 * @template T
 * @param {()=>T} execute Synchronous real Store transaction or test.
 * @param {{Store?:Function}} [deps] Dependency injection for pure tests.
 * @returns {{result:T,audit:object}}
 */
function withPaperBellelbaOptionalPayment(execute,deps={}){
  assert.equal(typeof execute,'function');
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(output,'game/store/store')).Store;
  const prior=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof prior?.value,'function');
  const audit={version:VERSION,optionalConfirms:0,optionalCostReplies:0,
    rejectedUnaffordableConfirm:0,rejectedShortOrAlienPayments:0,
    acceptedPayments:0,qualifiedGames:0};

  function nativeDispatch(action,...args){
    if(action?.constructor?.name==='ResolvePromptAction'){
      const prompt=this.state?.prompts?.find(p=>
        p.id===action.id&&p.result===undefined);
      const owner=this.state?.players?.find(p=>p.id===prompt?.playerId);
      const isBellelba=owner?.supporter?.cards?.some(
        c=>c.fullName===PRINTING);
      if(isBellelba&&prompt?.constructor?.name==='ConfirmPrompt'&&
         prompt.message==='WANT_TO_DISCARD_CARDS'){
        audit.optionalConfirms++;
        if(action.result===true&&owner.hand.cards.length<3){
          audit.rejectedUnaffordableConfirm++;
          throw Error('PAPER_BELLELBA_OPTION_REQUIRES_THREE_OTHER_CARDS');
        }
      }
      if(isBellelba&&prompt?.constructor?.name==='ChooseCardsPrompt'&&
         prompt.message==='CHOOSE_CARD_TO_DISCARD'&&
         prompt.options?.min===3&&prompt.options?.max===3&&
         prompt.cards===owner.hand){
        audit.optionalCostReplies++;
        const violation=paperOptionalPaymentNegative(
          action.result,owner.hand,prompt);
        if(violation){
          audit.rejectedShortOrAlienPayments++;
          throw Error('PAPER_BELLELBA_OPTION_PAYMENT_INVALID:'+violation);
        }
        audit.acceptedPayments++;
      }
    }
    return prior.value.call(this,action,...args);
  }
  Object.defineProperty(Store.prototype,'dispatch',{...prior,value:nativeDispatch});
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,nativeDispatch);
    Object.defineProperty(Store.prototype,'dispatch',prior);
  }
}

module.exports={VERSION,PRINTING,paperOptionalPaymentNegative,
  withPaperBellelbaOptionalPayment};
