'use strict';

const {sameTarget}=require('../attach-energy-targets.cjs');
const VERSION='agent7-owner-regidrago-celestial-roar-energy-v1';

/**
 * Resolve genuine Regidrago V Celestial Roar's revealed top-three temporary
 * pile. The attacking player's opened prompt is visible to that player.
 * Never inspect an unopened deck or an unknown Prize card.
 *
 * @param {object} state Actual pinned native State.
 * @param {object} prompt Pending native AttachEnergyPrompt from the attack.
 * @param {number} seat Actual acting player physical seat.
 * @param {{PlayerType:object,SlotType:object}} types Native targeting enums.
 * @returns {null|{assignments:object[],sourceCount:number,selectedPrintings:string[]}}
 */
function chooseOwnerCelestialRoarEnergy(state,prompt,seat,types){
  const owner=state?.players?.[seat];
  const options=prompt?.options;
  if(state?.activePlayer!==seat||
     prompt?.constructor?.name!=='AttachEnergyPrompt'||
     prompt.playerId!==owner?.id||
     prompt.message!=='ATTACH_ENERGY_CARDS'||
     owner.active?.getPokemonCard?.()?.fullName!=='Regidrago V SIT'||
     prompt.cardList===owner.deck||
     prompt.cardList===owner.hand||
     prompt.cardList===owner.discard||
     !Array.isArray(prompt.cardList?.cards)||
     prompt.cardList.cards.length<1||prompt.cardList.cards.length>3||
     prompt.playerType!==types.PlayerType.BOTTOM_PLAYER||
     !prompt.slots?.includes(types.SlotType.ACTIVE)||
     options?.allowCancel!==false||
     !Number.isInteger(options?.min)||options.min<1||
     options.min!==options.max||options.max>3||
     typeof prompt.cardList.filter!=='function'||
     typeof prompt.validate!=='function')return null;
  const eligible=prompt.cardList.filter(prompt.filter).filter(card=>{
    const i=prompt.cardList.cards.indexOf(card);
    return i>=0&&!(options.blocked??[]).includes(i);
  });
  if(eligible.length!==options.min)return null;
  const target={player:types.PlayerType.BOTTOM_PLAYER,
    slot:types.SlotType.ACTIVE,index:0};
  if((options.blockedTo??[]).some(block=>sameTarget(block,target)))
    return null;
  const assignments=eligible.map(card=>({card,to:target}));
  if(!prompt.validate(assignments))return null;
  return {assignments,sourceCount:prompt.cardList.cards.length,
    selectedPrintings:eligible.map(card=>card.fullName)};
}

module.exports={VERSION,chooseOwnerCelestialRoarEnergy};
