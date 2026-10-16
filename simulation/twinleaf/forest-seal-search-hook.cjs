'use strict';

const path = require('node:path');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
let installed = null;

/**
 * Enforce the printed unrestricted one-card search for Forest Seal Stone's
 * Star Alchemy. Twinleaf a9905a76 configures its ChooseCardsPrompt with min:0,
 * although deck searches for any card without type restrictions must choose
 * exactly the requested count when available (advanced rulebook, I-H).
 *
 * Only the Stone's own PowerEffect gets an adjusted prompt. The original
 * Store and vendored class are restored unchanged after the experiment.
 * This is opt-in until validated against full game execution.
 *
 * @returns {() => void} Restore original pinned class method.
 */
function installForestSealSearchHook() {
  if (installed) return installed.restore;

  const { ForestSealStone } = require(path.join(output,
    'sets/09-sword-and-shield/set-silver-tempest/forest-seal-stone'));
  const { PowerEffect } = require(path.join(output,
    'game/store/effects/game-effects'));
  const { ChooseCardsPrompt } = require(path.join(output,
    'game/store/prompts/choose-cards-prompt'));
  const { GameError } = require(path.join(output, 'game/game-error'));
  const { GameMessage } = require(path.join(output, 'game/game-message'));
  const previous = ForestSealStone.prototype.reduceEffect;

  /** @param {any} store @param {any} state @param {any} effect */
  function patchedReduceEffect(store, state, effect) {
    if (!(effect instanceof PowerEffect) || effect.power !== this.powers[0]) {
      return previous.call(this, store, state, effect);
    }
    const player = effect.player;
    if (!player.usedVSTAR && player.deck.cards.length === 0) {
      throw new GameError(GameMessage.CANNOT_USE_POWER);
    }

    // The original reducer emits a prompt synchronously but resolves it later.
    // Adjust that prompt object before the real Store retains it. Bind other
    // Store methods to their original receiver to preserve engine state.
    const wrappedStore = new Proxy(store, {
      get(target, property) {
        if (property === 'prompt') {
          return (nextState, prompt, callback) => {
            if (prompt instanceof ChooseCardsPrompt &&
                prompt.player === player && prompt.cards === player.deck &&
                prompt.message === GameMessage.CHOOSE_CARD_TO_HAND &&
                prompt.options.min === 0 && prompt.options.max === 1) {
              prompt.options.min = 1;
              // Store.reducePrompt does not itself call Prompt.validate. This
              // guard rejects invalid bot results rather than recording a
              // simulated match with an illegal zero-card VSTAR search.
              return target.prompt(nextState, prompt, selected => {
                if (!prompt.validate(selected)) {
                  throw new GameError(GameMessage.ILLEGAL_ACTION);
                }
                return callback(selected);
              });
            }
            return target.prompt(nextState, prompt, callback);
          };
        }
        const value = Reflect.get(target, property, target);
        return typeof value === 'function' ? value.bind(target) : value;
      }
    });
    return previous.call(this, wrappedStore, state, effect);
  }

  ForestSealStone.prototype.reduceEffect = patchedReduceEffect;
  const restore = () => {
    if (ForestSealStone.prototype.reduceEffect !== patchedReduceEffect) return;
    ForestSealStone.prototype.reduceEffect = previous;
    installed = null;
  };
  installed = { restore };
  return restore;
}

module.exports = { installForestSealSearchHook };
