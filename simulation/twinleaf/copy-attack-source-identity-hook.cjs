'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
let restoreActive;

/** @returns {() => void} Restores the pinned Store prompt method. */
function installCopyAttackSourceIdentityHook() {
  if (restoreActive) return restoreActive;
  const {Store} = require(path.join(output, 'game/store/store'));
  const {ChooseAttackPrompt} = require(path.join(output, 'game/store/prompts/choose-attack-prompt'));
  const {GameMessage} = require(path.join(output, 'game/game-message'));
  const original = Store.prototype.prompt;
  function correctedPrompt(state, prompts, then) {
    if (!(prompts instanceof ChooseAttackPrompt) ||
        prompts.message !== GameMessage.CHOOSE_ATTACK_TO_COPY) {
      return original.call(this, state, prompts, then);
    }
    return original.call(this, state, prompts, result => {
      if (result === null) return then(result);
      const cards = prompts.cards;
      const source = cards.findIndex(card => card.attacks?.includes(result));
      if (source < 0) throw new Error('Selected attack lacks a live donor');
      const collision = cards.slice(0, source).some(card =>
        card.attacks?.some(attack => attack.name === result.name));
      if (!collision) return then(result);
      const saved = cards.slice();
      cards.splice(0, cards.length, cards[source],
        ...cards.slice(0, source), ...cards.slice(source + 1));
      try {
        return then(result);
      } finally {
        cards.splice(0, cards.length, ...saved);
      }
    });
  }
  Store.prototype.prompt = correctedPrompt;
  restoreActive = () => {
    if (Store.prototype.prompt !== correctedPrompt) throw new Error('Prompt owner changed');
    Store.prototype.prompt = original;
    restoreActive = null;
  };
  return restoreActive;
}
module.exports = {installCopyAttackSourceIdentityHook};
