'use strict';

const path = require('node:path');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
let restoreInstalled = null;

/**
 * Opt-in research-side repair for temporal semantics of playerLastAttack.
 * Twinleaf keeps the previous attack even after a subsequent PassTurnAction,
 * allowing Mimikyu GRI Copycat to copy an attack that did not occur during
 * the opponent's immediately preceding turn.
 *
 * Clear the active player's stale record just before processing a valid Pass,
 * so EndTurnEffect observers cannot mistake an earlier attack for this turn.
 * The original record is restored if dispatch rejects the action.
 *
 * @returns {() => void} Uninstall the compatibility hook.
 */
function installPassClearsLastAttackHook() {
  if (restoreInstalled) return restoreInstalled;
  const {Store} = require(path.join(output, 'game/store/store'));
  const {PassTurnAction} =
    require(path.join(output, 'game/store/actions/game-actions'));
  const {GamePhase} = require(path.join(output, 'game/store/state/state'));
  const original = Store.prototype.dispatch;

  /** @param {any} action @param {number} [clientRoleId] */
  function correctedDispatch(action, clientRoleId) {
    const state = this.state;
    const player = state.players?.[state.activePlayer];
    const clear = action instanceof PassTurnAction &&
      state.phase === GamePhase.PLAYER_TURN &&
      player?.id === action.clientId &&
      state.playerLastAttack?.[player.id] !== undefined;
    if (!clear) return original.call(this, action, clientRoleId);

    const prior = state.playerLastAttack[player.id];
    delete state.playerLastAttack[player.id];
    try {
      return original.call(this, action, clientRoleId);
    } catch (error) {
      state.playerLastAttack[player.id] = prior;
      throw error;
    }
  }

  Store.prototype.dispatch = correctedDispatch;
  restoreInstalled = () => {
    if (Store.prototype.dispatch === correctedDispatch) {
      Store.prototype.dispatch = original;
    }
    restoreInstalled = null;
  };
  return restoreInstalled;
}

module.exports = {installPassClearsLastAttackHook};
