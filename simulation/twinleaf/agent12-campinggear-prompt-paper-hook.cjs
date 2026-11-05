'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent12-paper-camping-gear-choose-one-v3-physical-search-settlement';
const PRINTING='Camping Gear BST';

/**
 * Inspect a real pending source-stamped native ChooseCardsPrompt without
 * changing state or supplying private cards to an actor's decision policy.
 * A printed unrestricted one-card search must select exactly one own-deck
 * card. Native validation is an additional, independent predicate.
 *
 * @param {object} state The real Store state, exclusively in this guard.
 * @param {object} action Proposed native dispatch action.
 * @returns {object} Narrow paper contract verdict.
 */
function campingGearPaperVerdict(state,action){
  if(action?.constructor?.name!=='ResolvePromptAction')
    return {applicable:false};
  const prompt=state.prompts?.find(x=>
    x.id===action.id&&x.result===undefined);
  if(prompt?.constructor?.name!=='ChooseCardsPrompt'||
     prompt.sourceCard?.fullName!==PRINTING)
    return {applicable:false};
  const cards=action.result;
  const one=Array.isArray(cards)&&cards.length===1;
  const ownDeck=prompt.cards===prompt.player?.deck;
  const physicalCardInDeck=one&&Array.isArray(prompt.player?.deck?.cards)&&
    prompt.player.deck.cards.includes(cards[0]);
  const nativeValid=typeof prompt.validate==='function'&&
    prompt.validate(cards)===true;
  return {applicable:true,printing:PRINTING,
    cardCount:Array.isArray(cards)?cards.length:null,
    ownDeck,one,physicalCardInDeck,nativeValid,
    paperValid:one&&ownDeck&&physicalCardInDeck};
}

/**
 * Fail-closed, reversible research-only Store dispatch guard.
 * It affects precisely source-stamped Camping Gear's own deck search.
 * No other trainer/card prompt is generalized from this narrow evidence.
 * @template T
 * @param {()=>T} run Real Store run or staged dispatch.
 * @param {{Store?:Function}} [deps] Optional constructor for pure regression.
 * @returns {{result:T,audit:object}}
 */
function withPaperCampingGearPromptGuard(run,deps={}){
  assert.equal(typeof run,'function');
  const Store=deps.Store??require(path.join(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const before=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof before?.value,'function');
  const audit={version:VERSION,printing:PRINTING,
    inspected:0,paperValidAccepted:0,paperInvalidVetoed:0,
    nativeReturnedWithoutThrow:0,nativePromptSettled:0,
    nativeSilentNoop:0,paperValidEffectUnverified:0,
    nativeRejectedAfterGuard:0,examples:[]};
  function dispatch(action,...args){
    const verdict=campingGearPaperVerdict(this.state,action);
    if(!verdict.applicable)
      return before.value.apply(this,[action,...args]);
    audit.inspected++;
    if(!verdict.paperValid){
      if(audit.examples.length<8)audit.examples.push(verdict);
      audit.paperInvalidVetoed++;
      throw new Error('PAPER_PROMPT_INVALID: '+PRINTING+
        ' requires exactly one original physical card from its own deck');
    }
    // Preserve exact source prompt and owner-owned card custody before Store
    // callback. Native reducePrompt may return normally on a stale callback
    // without setting a result or moving this selected card.
    const pending=this.state.prompts.find(p=>
      p.id===action.id&&p.result===undefined);
    const owner=pending.player;
    const card=action.result[0];
    const beforeDeckCount=owner.deck.cards.length;
    const beforeHandCount=owner.hand?.cards?.length??null;
    const previouslyInHand=owner.hand?.cards?.includes(card)??false;
    const receipt={...verdict,
      nativeReturnedWithoutThrow:false,nativePromptSettled:false,
      physicalSearchVerified:false};
    if(audit.examples.length<8)audit.examples.push(receipt);
    try{
      const value=before.value.apply(this,[action,...args]);
      audit.nativeReturnedWithoutThrow++;
      receipt.nativeReturnedWithoutThrow=true;
      receipt.nativePromptSettled=pending.result!==undefined&&
        Object.is(pending.result,action.result);
      if(receipt.nativePromptSettled)audit.nativePromptSettled++;
      else audit.nativeSilentNoop++;
      receipt.physicalSearchVerified=!!(receipt.nativePromptSettled&&
        beforeHandCount!==null&&!previouslyInHand&&
        owner.deck.cards.length===beforeDeckCount-1&&
        owner.hand.cards.length===beforeHandCount+1&&
        !owner.deck.cards.includes(card)&&owner.hand.cards.includes(card));
      if(receipt.physicalSearchVerified)audit.paperValidAccepted++;
      else audit.paperValidEffectUnverified++;
      return value;
    }catch(error){
      audit.nativeRejectedAfterGuard++;
      throw error;
    }
  }
  Object.defineProperty(Store.prototype,'dispatch',{...before,value:dispatch});
  try{
    return {result:run(),audit};
  }catch(error){
    if(error&&typeof error==='object')
      error.agent12PaperPromptAudit=audit;
    throw error;
  }finally{
    assert.equal(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',before);
  }
}

module.exports={VERSION,PRINTING,campingGearPaperVerdict,
  withPaperCampingGearPromptGuard};
