'use strict';

const path = require('node:path');

/**
 * The pinned Damage Pump LOR reducer requests a MoveDamagePrompt with the
 * default singleSourceTarget=false and applies each transfer independently.
 * Printed Damage Pump LOR 156 requires both counters to originate from ONE
 * of your Pokemon. This opt-in adapter fixes that constraint at prompt and
 * reducer-callback boundaries, without modifying the vendor submodule.
 *
 * @returns {() => void} Restore the original pinned card reducer.
 */
function installDamagePumpSingleSourceHook() {
  const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const { DamagePump } = require(path.join(root,
    'sets/09-sword-and-shield/set-lost-origin/damage-pump'));
  const { MoveDamagePrompt } = require(path.join(root,
    'game/store/prompts/move-damage-prompt'));
  const { StateUtils } = require(path.join(root, 'game/store/state-utils'));
  const { GameError } = require(path.join(root, 'game/game-error'));
  const { GameMessage } = require(path.join(root, 'game/game-message'));
  const originalReducer = DamagePump.prototype.reduceEffect;

  DamagePump.prototype.reduceEffect = function correctedDamagePump(store, state, effect) {
    const originalPrompt = store.prompt;
    store.prompt = function captureDamagePumpPrompt(promptState, prompt, resolve) {
      if (!(prompt instanceof MoveDamagePrompt)) {
        return originalPrompt.call(this, promptState, prompt, resolve);
      }
      prompt.options.singleSourceTarget = true;
      return originalPrompt.call(this, promptState, prompt, transfers => {
        if (transfers !== null) {
          const invalid = !Array.isArray(transfers) ||
            transfers.length < 1 || transfers.length > 2 ||
            transfers.some(transfer =>
              !transfer || !transfer.from || !transfer.to ||
              JSON.stringify(transfer.from) === JSON.stringify(transfer.to)) ||
            transfers.some(transfer =>
              JSON.stringify(transfer.from) !== JSON.stringify(transfers[0].from));
          if (invalid) {
            throw new GameError(GameMessage.INVALID_PROMPT_RESULT);
          }
          const player = promptState.players.find(p => p.id === prompt.getPerspectivePlayerId());
          const source = player &&
            StateUtils.getTarget(promptState, player, transfers[0].from);
          if (!source || source.damage < transfers.length * 10) {
            throw new GameError(GameMessage.INVALID_PROMPT_RESULT);
          }
        }
        return resolve(transfers);
      });
    };
    try {
      return originalReducer.call(this, store, state, effect);
    } finally {
      store.prompt = originalPrompt;
    }
  };

  return function restoreDamagePumpReducer() {
    DamagePump.prototype.reduceEffect = originalReducer;
  };
}

module.exports = { installDamagePumpSingleSourceHook };
