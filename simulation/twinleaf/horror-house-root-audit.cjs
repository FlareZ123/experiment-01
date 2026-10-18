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

module.exports={beforeAction,rootHorrorHouseEvents};
