'use strict';

/** @param {object} state */
function queuedPaleMoon(state) {
  return (state.players || []).flatMap(player =>
    (player.pendingEndOfTurnEffects || []).filter(effect =>
      effect.type === 'knock_out' && effect.attack?.name === 'Pale Moon-GX'));
}
module.exports={queuedPaleMoon};
