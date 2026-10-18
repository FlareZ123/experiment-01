'use strict';

/** Snapshot attached printed Energy after real root action selection. */
function beforeAction(state) {
  return state.players.map((player,seat)=>({
    seat,active:player.active.getPokemonCard()?.name??null,
    energy:player.active.energies.cards.map(card=>card.name),
    hand:player.hand.cards.length,
    // Private original-own-hand inventory for retrospective analysis only.
    // Captured after root choice and never passed into either bot policy.
    ownHandKinds:player.hand.cards.map(card=>({
      name:card.name,superType:card.superType,trainerType:card.trainerType??null
    })),
    usedGX:player.usedGX,
    itemLocked:player.cannotPlayItemCards===true,
    prizes:player.prizes.filter(p=>p.cards.length>0).length
  }));
}

/** Retain only Store-log authenticated Horror House declarations. */
function rootHorrorHouseEvents(before,after,declared) {
  return declared.filter(x=>x.attackName==='Horror House-GX').map(x=>({
    actionOrdinal:x.actionOrdinal,turnBefore:x.turnBefore,
    playerSlot:x.playerSlot,triggerAction:x.triggerAction,
    before,after,resolutionVerified:false
  }));
}

/**
 * Evaluate Item cards physically present in the defender's hand at the
 * actual attack root. This is a retrospective inventory ceiling, not a
 * proof any Item was otherwise playable or that a lock changed a decision.
 * @param {object} event Root observed Horror House attack.
 * @param {{SuperType:object,TrainerType:object}} types Engine type enums.
 * @returns {string[]}
 */
function defendingHeldItems(event,types) {
  if(![0,1].includes(event.playerSlot)) {
    throw new Error('Need authenticated attacker seat for defender inventory');
  }
  return event.before[1-event.playerSlot].ownHandKinds.filter(card=>
    card.superType===types.SuperType.TRAINER &&
    card.trainerType===types.TrainerType.ITEM).map(card=>card.name);
}

module.exports={beforeAction,rootHorrorHouseEvents,defendingHeldItems};
