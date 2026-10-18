'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/** @param {string} name @returns {any} */
const load = name => require(path.join(output, name));

/**
 * Narrow, reversible research-side response to a real Koffing CEC Blow-Away Bomb
 * prompt caused by its owner's Roxie discard.
 *
 * The pinned ConfirmPrompt has only a generic WANT_TO_USE_ABILITY message. A
 * message-only override would also accept unrelated Abilities. Instead, mark
 * the exact new prompt object while the printed Koffing's reducer is handling
 * the actual Roxie discard. Its triggering card is public when discarded.
 * Marking uses identity, so speculative states cannot match reused prompt IDs.
 *
 * @template T
 * @param {() => T} run Synchronous experiment.
 * @returns {{value:T, marked:object[], accepted:object[]}}
 */
function withRoxieKoffingConfirmation(run) {
  const {Koffing} = load('sets/08-sun-and-moon/set-cosmic-eclipse/koffing');
  const {DiscardCardsEffect} = load('game/store/effects/attack-effects');
  const {TrainerEffect} = load('game/store/effects/play-card-effects');
  const {ConfirmPrompt} = load('game/store/prompts/confirm-prompt');
  const {ConfirmPromptResolver} =
    load('simple-bot/prompt-resolver/confirm-prompt-resolver');
  const {ResolvePromptAction} =
    load('game/store/actions/resolve-prompt-action');
  const {GameMessage} = load('game/game-message');

  const originalReduce = Koffing.prototype.reduceEffect;
  const originalResolve = ConfirmPromptResolver.prototype.resolvePrompt;
  const eligible = new WeakSet();
  const marked = [];
  const accepted = [];

  Koffing.prototype.reduceEffect = function observedKoffing(store, state, effect) {
    const trigger = effect instanceof DiscardCardsEffect &&
      effect.cards.includes(this) &&
      effect.attackEffect instanceof TrainerEffect &&
      effect.attackEffect.trainerCard.name === 'Roxie' &&
      this.fullName === 'Koffing CEC';
    const existing = trigger ? new Set(state.prompts) : null;
    const result = originalReduce.call(this, store, state, effect);

    if (trigger) {
      for (const prompt of state.prompts) {
        if (existing.has(prompt) || !(prompt instanceof ConfirmPrompt) ||
            prompt.playerId !== effect.player.id ||
            prompt.message !== GameMessage.WANT_TO_USE_ABILITY) {
          continue;
        }
        eligible.add(prompt);
        marked.push({promptId:prompt.id, playerId:prompt.playerId,
          turn:state.turn, source:'Koffing CEC / Roxie'});
      }
    }
    return result;
  };

  ConfirmPromptResolver.prototype.resolvePrompt =
    function resolveObservedKoffing(state, player, prompt) {
      if (prompt instanceof ConfirmPrompt && eligible.has(prompt) &&
          prompt.playerId === player.id &&
          prompt.message === GameMessage.WANT_TO_USE_ABILITY) {
        accepted.push({promptId:prompt.id, playerId:player.id,
          turn:state.turn, source:'Koffing CEC / Roxie'});
        return new ResolvePromptAction(prompt.id, true);
      }
      return originalResolve.call(this, state, player, prompt);
    };

  try {
    return {value:run(), marked, accepted};
  } finally {
    ConfirmPromptResolver.prototype.resolvePrompt = originalResolve;
    Koffing.prototype.reduceEffect = originalReduce;
  }
}

module.exports = {withRoxieKoffingConfirmation};
