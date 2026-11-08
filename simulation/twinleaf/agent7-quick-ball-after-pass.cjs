'use strict';

const VERSION='agent7-quick-ball-vip-payment-owner-after-pass-v1';
const QUICK_BALL=new Set(['Quick Ball FST','Quick Ball SSH']);
const DEAD_VIP='Battle VIP Pass FST';

/**
 * Owner-information-only Quick Ball opportunity. Preserve future-use cards;
 * spend only a physically held, genuinely expired Battle VIP Pass. In a
 * separate native prompt, the Store validates the mandatory one-card payment.
 * @param {object} view Frozen detached owner observation.
 * @returns {object|null} Candidate native play and exact owner cost.
 */
function chooseQuickBallAfterPass(view){
  if(view?.decisionKind!=='owner-root'||
     !Array.isArray(view.ownHand)||
     !Number.isSafeInteger(view.globalTurn)||view.globalTurn<=2)
    return null;
  const own=view.ownPublic,r=view.ownTurnResources;
  if(!own?.active||!r||!(own.deckCount>0)||
     r.itemPlayLocked!==false||
     own.publicTurnRestrictions?.itemPlayLocked===true)return null;
  const occupied=(own.bench??[]).filter(Boolean).length;
  if(occupied>=5)return null;
  const handIndex=view.ownHand.findIndex(x=>QUICK_BALL.has(x));
  const deadVipIndex=view.ownHand.findIndex((x,i)=>i!==handIndex&&
    x===DEAD_VIP);
  if(handIndex<0||deadVipIndex<0)return null;
  return {
    kind:'play-quick-ball-after-pass',
    handIndex,printing:view.ownHand[handIndex],
    paymentPrinting:DEAD_VIP,
    reason:'genuine-expired-vip-for-owner-basic-search'
  };
}

/**
 * Native printed Quick Ball has two disjoint owner-controlled card prompts:
 * exact one-card hand discard, then optional Basic from the own deck. Never
 * inspect a rival's hidden zones or invent card choices absent in the prompt.
 * @param {object} state Genuine native current State for validation.
 * @param {object} pending Native ChooseCardsPrompt from the Store.
 * @param {object} owner Physically owning player.
 * @returns {{step:string,cards:object[]}|null}
 */
function chooseQuickBallPrompt(state,pending,owner){
  if(pending?.constructor?.name!=='ChooseCardsPrompt'||
     pending.playerId!==owner?.id||
     !QUICK_BALL.has(pending.sourceCard?.fullName))return null;
  const offered=pending.cards?.cards;
  if(!Array.isArray(offered))return null;
  if(pending.cards===owner.hand&&
     pending.message==='CHOOSE_CARD_TO_DISCARD'&&
     pending.options?.min===1&&pending.options?.max===1){
    const selected=offered.find(x=>x.fullName===DEAD_VIP);
    if(!selected)return null;
    const cards=[selected];
    if(pending.validate(cards,state)!==true)return null;
    return {step:'mandatory-discard-dead-vip',cards};
  }
  if(pending.cards===owner.deck&&
     pending.message==='CHOOSE_CARD_TO_HAND'&&
     pending.options?.min===0&&pending.options?.max===1){
    const priority=[
      'Regidrago V SIT','Shadow Rider Calyrex V CRE',
      'Genesect V FST','Mew V FST','Mewtwo & Mew-GX UNM'
    ];
    const allowed=offered.filter(x=>pending.validate([x],state)===true);
    let selected=null;
    for(const name of priority){
      selected=allowed.find(x=>x.fullName===name);
      if(selected)break;
    }
    selected??=allowed[0]??null;
    if(selected)return {step:'own-deck-basic-search',cards:[selected]};
    if(pending.validate([],state)===true)
      return {step:'own-deck-basic-search-empty',cards:[]};
  }
  return null;
}

module.exports={
  VERSION,QUICK_BALL,DEAD_VIP,chooseQuickBallAfterPass,
  chooseQuickBallPrompt
};
