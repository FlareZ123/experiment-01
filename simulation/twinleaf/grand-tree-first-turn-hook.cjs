'use strict';

const path = require('node:path');
const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
let installed = null;

/**
 * Correct the pinned Grand Tree Stadium's missing first-player-turn guard.
 * Printed Grand Tree forbids its search-evolution effect on the first turn
 * of either player, including an opening Basic which has been in play
 * since setup. This is a reversible research adapter, never a vendor edit.
 * @returns {() => void} Restore the original pinned reducer.
 */
function installGrandTreeFirstTurnHook() {
  if (installed) return () => {};
  const {GreatTree} = require(path.join(root,
    'sets/10-scarlet-and-violet/set-stellar-crown/grand-tree'));
  const {UseStadiumEffect} = require(path.join(root,
    'game/store/effects/game-effects'));
  const {GameError} = require(path.join(root, 'game/game-error'));
  const {GameMessage} = require(path.join(root, 'game/game-message'));
  const original = GreatTree.prototype.reduceEffect;
  /** @param {object} store @param {object} state @param {object} effect */
  function correctedReduceEffect(store, state, effect) {
    if (effect instanceof UseStadiumEffect && effect.stadium === this &&
        state.turn <= 2) {
      throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
    }
    return original.call(this, store, state, effect);
  }
  GreatTree.prototype.reduceEffect = correctedReduceEffect;
  installed = {original, correctedReduceEffect};
  return function restore() {
    if (!installed || GreatTree.prototype.reduceEffect !== installed.correctedReduceEffect) return;
    GreatTree.prototype.reduceEffect = installed.original;
    installed = null;
  };
}
module.exports = {installGrandTreeFirstTurnHook};
