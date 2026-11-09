'use strict';

const VERSION='agent9-owner-dedechange-confirm-v1';

/** Known high-impact card names are a conservative preservation veto. */
const PROTECTED=new Set([
  'Computer Search','Dowsing Machine','Secret Box','Brilliant Blender',
  'Prime Catcher','Scramble Switch','Life Dew','Master Ball','Legacy Energy',
  'Maximum Belt','Unfair Stamp','Hero\'s Cape','Reset Stamp'
]);

/**
 * Decide an *already offered and attributed* native Dedechange ConfirmPrompt.
 * The caller must independently prove physical Dedenne entry, live prompt
 * ownership, native ability eligibility, and post-action Store settlement.
 * This only considers the acting owner's current hand and DECK SIZE.
 *
 * Choosing true discards the remaining hand and draws up to six. The rule is
 * intentionally conservative; a card's strategic discardability varies by
 * matchup, so larger hands must be evaluated by a stronger stateful policy.
 *
 * @param {{owner:object}} args
 * @returns {{decision:boolean,reason:string,details:object}}
 */
function chooseDedechangeConfirm({owner}){
  const hand=owner?.hand?.cards;
  const deck=owner?.deck?.cards;
  if(!Array.isArray(hand)||!Array.isArray(deck)){
    return {decision:false,reason:'owner-zones-unavailable',details:{}};
  }
  const details={handCount:hand.length,deckCount:deck.length};
  if(deck.length<=6){
    return {decision:false,reason:'conserve-deck-near-deckout',details};
  }
  if(hand.length>2){
    return {decision:false,reason:'hand-discard-cost-unassessed',details};
  }
  if(hand.some(card=>card?.aceSpec===true||
      card?.isAceSpec===true||PROTECTED.has(card?.name))){
    return {decision:false,reason:'protected-resource-in-hand',details};
  }
  return {decision:true,reason:'low-hand-six-card-refill',details};
}

module.exports={VERSION,chooseDedechangeConfirm};
