'use strict';

/**
 * Pinned Twinleaf's PlaySupporterEffect increments supporterTurn as a count
 * during the current owner's turn. PlayCardReducer records energyPlayedTurn
 * as a global turn number. Mixing those clock domains silently misreports
 * a used Supporter and can propose an illegal second one.
 *
 * Sources at Twinleaf a9905a76:
 * ptcg-server/src/game/store/effect-reducers/play-trainer-effect.ts
 * ptcg-server/src/game/store/reducers/play-card-reducer.ts
 *
 * @param {{supporterTurn:number}} owner Genuine owner player or detached owner quota.
 * @returns {boolean}
 */
function supporterAlreadyUsed(owner) {
  return owner.supporterTurn >= 1;
}

/**
 * Read-only source-owner turn-resource witness for live native Store policies.
 * Values describe separate quota domains and should not be compared with
 * one another. The corresponding paper rule permits one ordinary Supporter
 * and one normal hand Energy attachment during the player's turn.
 *
 * @param {{turn:number}} state Genuine native State.
 * @param {{supporterTurn:number,energyPlayedTurn:number}} owner Actor player.
 * @returns {{ownerSupporterUsed:boolean,ownerManualEnergyAttachmentUsed:boolean}}
 */
function ownerTurnResourceUsage(state,owner) {
  return {
    ownerSupporterUsed: supporterAlreadyUsed(owner),
    ownerManualEnergyAttachmentUsed: owner.energyPlayedTurn===state.turn
  };
}

module.exports={supporterAlreadyUsed,ownerTurnResourceUsage};
