'use strict';

const assert=require('node:assert/strict');
const {collectSpecialAttachmentEffectAxes}=
  require('./agent50-special-attachment-effect-axes.cjs');
const {potentialPrintedPrizeFinisher}=
  require('./agent42-visible-printed-prize-finisher.cjs');

const VERSION='agent50-owner-preterminal-speed-draw-offer-v1';

/**
 * Offer a real native-neutral nonterminal Energy attachment to the current
 * owner-root arbiter when a known payable attack would otherwise close the
 * turn. A Speed Lightning attachment to the same Active Lightning Pokémon
 * retains the attacking Pokémon and offers a printed draw-two trigger.
 *
 * This is only an ALTERNATIVE: no competitiveness, native action acceptance,
 * safety from opponent reactive effects, or strategic domination is implied.
 * Restrict to early/middle games with at least three cards remaining in deck
 * AFTER the printed draw, and avoid possible 1-3 Prize terminal attacks.
 * All decisions use only the actor's own hand and public board.
 *
 * @param {object} view Detached actorObservation for the acting owner
 * @param {object} catalog Public exact-printing metadata
 * @param {{kind:string,attackName?:string}} first Already proposed root
 * @returns {{version:string,intent:object,reason:string,
 *  potentialDrawCap:2,attackName:string}|null}
 */
function offerSpeedDrawBeforeAttack(view,catalog,first){
  assert.equal(view?.decisionKind,'owner-root');
  if(first?.kind!=='attack'||typeof first.attackName!=='string')
    return null;
  const own=view.ownPublic,r=view.ownTurnResources;
  if(!own?.active||!Array.isArray(own.active.attacks)||
      !own.active.attacks.some(a=>a.name===first.attackName)||
      !Number.isSafeInteger(own.deckCount)||own.deckCount<5||
      !Number.isSafeInteger(own.prizeCount)||own.prizeCount<4||
      !Number.isSafeInteger(view.globalTurn)||
      !Number.isSafeInteger(r?.energyPlayedTurn)||
      r.energyPlayedTurn===view.globalTurn||
      r.energyPlayLocked===true||r.specialEnergyPlayLocked===true||
      own.publicTurnRestrictions?.energyPlayLocked===true||
      own.publicTurnRestrictions?.specialEnergyPlayLocked===true)
    return null;
  if(potentialPrintedPrizeFinisher(view,first,catalog).protect)
    return null;
  const {offers}=collectSpecialAttachmentEffectAxes(view,catalog);
  const offer=offers.find(x=>
    x.onAttachChannel==='on-attach-draw-two'&&
    x.slot==='active'&&x.index===0&&
    x.publicEffectOpportunity===true&&x.potentialDrawCap===2&&
    view.ownHand?.[x.handIndex]===x.printing);
  if(!offer)return null;
  return {
    version:VERSION,
    intent:{kind:'attach-special-energy',printing:offer.printing,
      handIndex:offer.handIndex,slot:'active',index:0},
    reason:'owner-visible-Speed-draw-before-payable-attack-offer',
    potentialDrawCap:2,
    attackName:first.attackName
  };
}

module.exports={VERSION,offerSpeedDrawBeforeAttack};
