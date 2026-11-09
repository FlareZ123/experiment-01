'use strict';

const {sameTarget}=require('../attach-energy-targets.cjs');
const VERSION='agent7-owner-squawkabilly-motivate-energy-v1';

/**
 * Select a paper-eligible original owner's Basic Energy in a genuine native
 * Motivate prompt. The prompt opens the source's own public discard pile.
 * No unopened deck, Prize card, or opponent-hand information is consulted.
 *
 * @param {object} state Pinned native Store state.
 * @param {object} prompt Pending native AttachEnergyPrompt.
 * @param {number} seat Acting physical seat.
 * @param {{PlayerType:object,SlotType:object}} types Native target enums.
 * @returns {null|{assignments:object[],recipientPrinting:string,recipientIndex:number}}
 */
function chooseOwnerMotivateEnergy(state,prompt,seat,types){
  const owner=state?.players?.[seat];
  if(state?.activePlayer!==seat||owner?.id!==prompt?.playerId||
     prompt?.constructor?.name!=='AttachEnergyPrompt'||
     prompt.message!=='ATTACH_ENERGY_TO_BENCH'||
     prompt.cardList!==owner?.discard||
     owner.active?.getPokemonCard?.()?.fullName!=='Squawkabilly ex PAL'||
     ![types.PlayerType.BOTTOM_PLAYER,types.PlayerType.ANY]
       .includes(prompt.playerType)||
     !prompt.slots.includes(types.SlotType.BENCH)||
     prompt.options?.min!==0||prompt.options.max!==2||
     prompt.options.sameTarget!==true||
     prompt.options.differentTargets===true||
     typeof prompt.validate!=='function')return null;

  const blocked=prompt.options.blocked??[];
  const energies=owner.discard.filter(prompt.filter).filter(card=>
    owner.discard.cards.includes(card)&&
    !blocked.includes(owner.discard.cards.indexOf(card))).slice(0,2);
  if(energies.length===0)return null;

  const recipients=owner.bench.flatMap((list,index)=>{
    const pokemon=list.getPokemonCard?.();
    if(!pokemon)return [];
    const target={player:types.PlayerType.BOTTOM_PLAYER,
      slot:types.SlotType.BENCH,index};
    if((prompt.options.blockedTo??[]).some(t=>sameTarget(t,target)))
      return [];
    const name=pokemon.fullName;
    const priority=name==='Regidrago VSTAR SIT'?0:
      name==='Regidrago V SIT'?1:
      name==='Dedenne GX UNB'?3:2;
    return [{target,name,priority,index}];
  }).sort((a,b)=>a.priority-b.priority||a.index-b.index);

  for(const recipient of recipients){
    for(let count=energies.length;count>=1;count--){
      const assignments=energies.slice(0,count).map(card=>({
        card,to:recipient.target
      }));
      if(prompt.validate(assignments))
        return {assignments,recipientPrinting:recipient.name,
          recipientIndex:recipient.index};
    }
  }
  return null;
}

module.exports={VERSION,chooseOwnerMotivateEnergy};
