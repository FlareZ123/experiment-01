'use strict';

/**
 * Choose the held supporter for an opt-in, owner-information-only response
 * when a separate live Store guard has already identified a forbidden
 * Stadium or Special Energy proposal.
 *
 * @param {object} player Actor's own live Player state
 * @param {number} turn Real Store turn
 * @returns {number} Legal-looking own-hand index, or -1 to decline
 */
function heldLillieResponseIndex(player,turn) {
  if (player.supporterTurn === turn ||
      player.cannotPlaySupporterCards === true) return -1;
  return player.hand.cards.findIndex(card =>
    card.name === "Lillie's Determination");
}

module.exports={heldLillieResponseIndex};
