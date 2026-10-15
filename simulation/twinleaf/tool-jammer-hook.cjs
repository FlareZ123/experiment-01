'use strict';

const path = require('node:path');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
let installed = null;

/**
 * Install a narrow research-side correction for the pinned Twinleaf Tool Jammer
 * implementation, whose reduceEffect currently ignores ToolEffect entirely.
 *
 * Card text: if the attached Pokémon is Active, the opponent's Active
 * Pokémon's Tools have no effect, except Tool Jammer itself.
 *
 * @returns {() => void} Idempotent restoration to the exact upstream method.
 */
function installToolJammerHook() {
  if (installed) return () => {};
  const { ToolJammer } = require(path.join(
    output, 'sets/09-sword-and-shield/set-battle-styles/tool-jammer'
  ));
  const { ToolEffect } = require(path.join(output, 'game/store/effects/play-card-effects'));
  const { StateUtils } = require(path.join(output, 'game/store/state-utils'));
  const { GameError } = require(path.join(output, 'game/game-error'));
  const { GameMessage } = require(path.join(output, 'game/game-message'));
  const original = ToolJammer.prototype.reduceEffect;

  function patchedReduceEffect(store, state, effect) {
    if (effect instanceof ToolEffect && effect.card.name !== 'Tool Jammer') {
      for (const wearer of state.players) {
        if (!wearer.active.tools.includes(this)) continue;
        const opponent = StateUtils.getOpponent(state, wearer);
        if (effect.player === opponent && opponent.active.tools.includes(effect.card)) {
          throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
        }
      }
    }
    return original.call(this, store, state, effect);
  }

  ToolJammer.prototype.reduceEffect = patchedReduceEffect;
  installed = { original, patched: patchedReduceEffect };

  return function restoreToolJammerHook() {
    if (!installed || ToolJammer.prototype.reduceEffect !== installed.patched) return;
    ToolJammer.prototype.reduceEffect = installed.original;
    installed = null;
  };
}

module.exports = { installToolJammerHook };
