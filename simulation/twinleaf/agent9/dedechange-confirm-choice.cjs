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
 * @param {{owner:object,globalTurn?:number}} args
 * @returns {{decision:boolean,reason:string,details:object}}
 */
function chooseDedechangeConfirm({owner,globalTurn}){
  const hand=owner?.hand?.cards;
  const deck=owner?.deck?.cards;
  if(!Array.isArray(hand)||!Array.isArray(deck)){
    return {decision:false,reason:'owner-zones-unavailable',details:{}};
  }
  // Both players' first turns have ended once the global turn exceeds 2.
  // Battle VIP Pass is then an already-spent opening-only Item, so dropping
  // it does not consume an equivalent live hand resource.
  const expiredVip=Number.isInteger(globalTurn)&&globalTurn>2?
    hand.filter(card=>card?.name==='Battle VIP Pass').length:0;
  const liveHandCost=hand.length-expiredVip;
  const details={handCount:hand.length,deckCount:deck.length,
    expiredVipCount:expiredVip,liveHandCost};
  if(deck.length<=6){
    return {decision:false,reason:'conserve-deck-near-deckout',details};
  }
  if(liveHandCost>2){
    return {decision:false,reason:'hand-discard-cost-unassessed',details};
  }
  if(hand.some(card=>card?.aceSpec===true||
      card?.isAceSpec===true||PROTECTED.has(card?.name)||
      card?.name?.includes(' Prism Star'))){
    return {decision:false,reason:'protected-resource-in-hand',details};
  }
  return {decision:true,reason:expiredVip>0?
    'expired-opening-items-six-card-refill':'low-hand-six-card-refill',details};
}

/**
 * Paper destination-custody check for a native Dedechange confirmation.
 * Ordinary cards enter discard. A Prism Star replacement can instead send
 * a card to the Lost Zone; this counts as a legitimate payment destination.
 * Reads only owner's physically held, discarded and Lost Zone cards, plus
 * deck length. No unopened deck identities or opponent private zones.
 *
 * @param {{hand:object[],discard:object[],lostzone:object[],deckCount:number}} before
 * @param {{hand:{cards:object[]},discard:{cards:object[]},lostzone:{cards:object[]},deck:{cards:object[]}}} after
 * @returns {{settled:boolean,discardedCount:number,lostZoneCount:number,drawnCount:number,deckDelta:number,handPhysicallyDiscarded:boolean}}
 */
function verifyDedechangeSettlement(before,after){
  const original=before.hand;
  const now=after.hand.cards;
  const trash=after.discard.cards;
  const lost=after.lostzone.cards;
  const expectedDraw=Math.min(6,before.deckCount);
  const sentToDiscard=original.filter(card=>
    trash.includes(card)&&!before.discard.includes(card));
  const sentToLost=original.filter(card=>
    lost.includes(card)&&!before.lostzone.includes(card));
  const handPhysicallyDiscarded=original.every(card=>
    !now.includes(card)&&
    ((sentToDiscard.includes(card)?1:0)+(sentToLost.includes(card)?1:0))===1);
  const noOriginalSurvived=now.every(card=>!original.includes(card));
  const deckDelta=before.deckCount-after.deck.cards.length;
  const settled=handPhysicallyDiscarded&&noOriginalSurvived&&
    deckDelta===expectedDraw&&now.length===expectedDraw;
  return {settled,discardedCount:sentToDiscard.length,
    lostZoneCount:sentToLost.length,drawnCount:now.length,deckDelta,
    handPhysicallyDiscarded};
}

module.exports={VERSION,chooseDedechangeConfirm,verifyDedechangeSettlement};
