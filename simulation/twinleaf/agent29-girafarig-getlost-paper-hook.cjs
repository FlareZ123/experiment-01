'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
let installed = null;

/**
 * Match paper Get Lost when the opposing public discard has fewer than two
 * cards. This strictly printing-scoped, opt-in wrapper changes no vendor file.
 * Native Store effects and its real card references still perform the move.
 * @returns {() => void} Restore the original card implementation.
 */
function installGirafarigGetLostPaperHook() {
  if (installed) return installed.restore;
  const {Girafarig} = require(path.join(output,
    'sets/08-sun-and-moon/set-lost-thunder/girafarig'));
  const {ChooseCardsPrompt} = require(path.join(output,
    'game/store/prompts/choose-cards-prompt'));
  const {WAS_ATTACK_USED} = require(path.join(output,
    'game/store/prefabs/prefabs'));
  const {StateUtils, GameMessage} = require(path.join(output, 'game'));
  const previous = Girafarig.prototype.reduceEffect;

  /** @param {object} store @param {object} state @param {object} effect */
  function corrected(store, state, effect) {
    if (!WAS_ATTACK_USED(effect, 0, this)) {
      return previous.call(this, store, state, effect);
    }
    const opponent = StateUtils.getOpponent(state, effect.player);
    const adapter = new Proxy(store, {
      get(target, property) {
        if (property === 'prompt') {
          return (nextState, prompt, callback) => {
            if (prompt instanceof ChooseCardsPrompt &&
                prompt.player === effect.player &&
                prompt.cards === opponent.discard &&
                prompt.message === GameMessage.CHOOSE_CARD_TO_DISCARD &&
                prompt.options.min === 2 && prompt.options.max === 2 &&
                Object.keys(prompt.filter ?? {}).length === 0) {
              const count = Math.min(2, prompt.cards.cards.length);
              prompt.options.min = count;
              prompt.options.max = count;
              prompt.options.allowCancel = false;
              return target.prompt(nextState, prompt, cards => {
                if (!prompt.validate(cards)) {
                  throw new Error('Invalid mandatory Get Lost selection');
                }
                return callback(cards);
              });
            }
            return target.prompt(nextState, prompt, callback);
          };
        }
        const value = Reflect.get(target, property, target);
        return typeof value === 'function' ? value.bind(target) : value;
      }
    });
    return previous.call(this, adapter, state, effect);
  }

  Girafarig.prototype.reduceEffect = corrected;
  const restore = () => {
    if (Girafarig.prototype.reduceEffect === corrected) {
      Girafarig.prototype.reduceEffect = previous;
    }
    installed = null;
  };
  installed = {restore};
  return restore;
}

module.exports = {installGirafarigGetLostPaperHook};
