'use strict';

/**
 * Capture only the acting player's hand before an engine action is dispatched.
 * This is post-policy-decision telemetry, never an input to a bot policy.
 * Preserve physical printings so a later replay can distinguish variants.
 *
 * @param {object} state Pinned Twinleaf Store state.
 * @param {number} seat Zero-based acting player slot.
 * @returns {object|null} Detached perspective-limited snapshot.
 */
function decisionHandEvidence(state, seat) {
  if (!Number.isInteger(seat) || seat < 0 || seat >= state.players.length) return null;
  const player = state.players[seat];
  return {
    perspectiveSeat: seat,
    ownHandPrintings: player.hand.cards.map(card => card.fullName),
    opponentHandSize: state.players[1 - seat].hand.cards.length
  };
}

module.exports = { decisionHandEvidence };
