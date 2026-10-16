'use strict';

const path = require('node:path');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
let restoreInstalled = null;

/**
 * Research-only, narrowly scoped repair for asynchronous Mimikyu Copycat.
 *
 * The pinned player-turn reducer initially records the printed Copycat attack.
 * During a subsequent ChooseAttackPrompt resolution, copied-attack delegation
 * overwrites playerLastAttack with the chosen payload's attack. Restore the
 * original declaration so later turns and copy-sensitive cards see Copycat.
 *
 * This patch is deliberately restricted to the original GRI Mimikyu, an active
 * ATTACK phase, and a pending prompt that belongs to its currently declared
 * Copycat. It does not change cloned attack effects or engine vendor sources.
 *
 * @returns {() => void} Restore the unpatched Store dispatch.
 */
function installMimikyuDeclaredHistoryHook() {
  if (restoreInstalled) return restoreInstalled;

  const {Store} = require(path.join(output, 'game/store/store'));
  const {ResolvePromptAction} =
    require(path.join(output, 'game/store/actions/resolve-prompt-action'));
  const {GamePhase} = require(path.join(output, 'game/store/state/state'));
  const original = Store.prototype.dispatch;

  /** @param {any} action @param {number} [clientRoleId] */
  function correctedDispatch(action, clientRoleId) {
    const state = this.state;
    const player = state.players?.[state.activePlayer];
    const previous = player && state.playerLastAttack?.[player.id];
    const source = previous?.sourceCard;
    const targetPrompt = action instanceof ResolvePromptAction &&
      state.prompts?.find(prompt => prompt.id === action.id &&
        prompt.result === undefined && prompt.playerId === player?.id &&
        prompt.constructor.name === 'ChooseAttackPrompt');

    const restoreDeclared = state.phase === GamePhase.ATTACK &&
      targetPrompt && source?.fullName === 'Mimikyu GRI' &&
      player?.active.getPokemonCard() === source &&
      previous.attack?.name === 'Copycat';

    const result = original.call(this, action, clientRoleId);
    if (restoreDeclared && result.playerLastAttack?.[player.id]) {
      result.playerLastAttack[player.id] = previous;
    }
    return result;
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

module.exports = {installMimikyuDeclaredHistoryHook};
