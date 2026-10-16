'use strict';

const path = require('node:path');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
let restoreInstalled = null;

/**
 * Research-only, narrowly scoped repair for asynchronous copy attacks.
 *
 * The pinned player-turn reducer initially records each printed copy attack.
 * During a subsequent ChooseAttackPrompt resolution, copied-attack delegation
 * overwrites playerLastAttack with the chosen payload's attack. Restore the
 * original declaration so later turns and copy-sensitive cards see the actual\n * attack: Mimikyu Copycat or Regidrago VSTAR Apex Dragon.
 *
 * This patch applies only to explicitly selected printed copy attacks, an\n * active ATTACK phase and the corresponding pending attack-choice prompt.\n * It does not change cloned attack effects or engine vendor sources.
 *
 * @param {{mimikyu?:boolean,regidrago?:boolean}} [targets]
 * @returns {() => void} Restore the unpatched Store dispatch.
 */
function installDeclaredCopyHistoryHook(targets = {mimikyu: true, regidrago: true}) {
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

    const printedCopy =
      (targets.mimikyu === true &&
        source?.fullName === 'Mimikyu GRI' &&
        previous?.attack?.name === 'Copycat') ||
      (targets.regidrago === true &&
        source?.fullName === 'Regidrago VSTAR SIT' &&
        previous?.attack?.name === 'Apex Dragon');
    const restoreDeclared = state.phase === GamePhase.ATTACK &&
      targetPrompt && printedCopy &&
      player?.active.getPokemonCard() === source;

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

/** @returns {() => void} Maintain the original Mimikyu-only opt-in behavior. */
function installMimikyuDeclaredHistoryHook() {
  return installDeclaredCopyHistoryHook({mimikyu: true, regidrago: false});
}

module.exports = {installDeclaredCopyHistoryHook, installMimikyuDeclaredHistoryHook};
