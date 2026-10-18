'use strict';

/**
 * Detach both players' zones at the first actual game turn. The source game
 * may have included opponent mulligan bonus draws or other setup effects, so
 * these zones are not asserted to reconstruct either original seven.
 * This read-only researcher telemetry includes hidden Prizes and must never
 * be supplied to a player decision policy.
 *
 * @param {object} state Actual pinned Store state, after setup.
 * @returns {object|null}
 */
function openingSetupZones(state) {
  if (state?.turn !== 1) return null;
  if (!Array.isArray(state.players) || state.players.length !== 2 ||
      ![0,1].includes(state.activePlayer)) {
    throw new Error('Unexpected first-turn Store layout.');
  }
  /** @param {{cards:Array<{fullName:string}>}} zone @returns {string[]} */
  const names = zone => {
    if (!zone || !Array.isArray(zone.cards)) {
      throw new Error('Unexpected opening card zone.');
    }
    return zone.cards.map(card => {
      if (typeof card?.fullName !== 'string' || !card.fullName) {
        throw new Error('Opening card lacks resolved printing.');
      }
      return card.fullName;
    });
  };
  return {
    schema:'pinned-root-postsetup-zones-v1',
    turn:state.turn,firstTurnSlot:state.activePlayer,
    containsUnrevealedPrizeIdentities:true,
    originalStartingSevenReconstructed:false,
    seats:state.players.map(player => ({
      playerId:player.id,
      hand:names(player.hand),
      active:names(player.active),
      bench:player.bench.map(names),
      prizes:player.prizes.map(names),
      deckRemaining:names(player.deck).length
    }))
  };
}

module.exports={openingSetupZones};
