'use strict';

const path = require('node:path');
const {sampleOpaque} = require('./night-watch-opaque-card-sampler.cjs');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Apply an exact-card, opt-in Night Watch random-hand correction to one
 * synchronous experiment. The pinned card currently asks its attacking bot
 * to CHOOSE opponent hand cards and the generic resolver scores their faces.
 *
 * At attack effect creation, sample opaque positions from the actual game RNG
 * and attach the outcome to the exact prompt object. The bot only submits the
 * precommitted result. This preserves game/policy RNG separation and excludes
 * unrelated opponent-hand choice effects. Never modify vendor source.
 *
 * @template T
 * @param {()=>T} execute Synchronous source-dealt game.
 * @returns {{result:T,audit:object}}
 */
function withUniformNightWatch(execute) {
  if (typeof execute !== 'function') throw new TypeError('execute must be synchronous');
  const load = relative => require(path.join(output, relative));
  const {TrevenantDusknoirGX} =
    load('sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx');
  const {WAS_ATTACK_USED} = load('game/store/prefabs/prefabs');
  const {StateUtils} = load('game/store/state-utils');
  const {ChooseCardsPrompt} = load('game/store/prompts/choose-cards-prompt');
  const {GameMessage} = load('game/game-message');
  const {SimpleTacticsAi} = load('simple-bot/simple-tactics-ai');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');

  const cardProto = TrevenantDusknoirGX.prototype;
  const aiProto = SimpleTacticsAi.prototype;
  const cardDescriptor = Object.getOwnPropertyDescriptor(cardProto, 'reduceEffect');
  const resolverDescriptor = Object.getOwnPropertyDescriptor(aiProto, 'resolvePrompt');
  if (typeof cardDescriptor?.value !== 'function' ||
      typeof resolverDescriptor?.value !== 'function') {
    throw new TypeError('Pinned Night Watch card/bot interfaces changed');
  }
  const choices = new WeakMap();
  const audit = {
    schema:'night-watch-random-prompt-hook-v1',
    created:0, resolved:0, returnedCounts:[], invalid:0,
    note:'Counts may include speculative Stores; independently audit root actions.'
  };

  function correctedCardReducer(store, state, effect) {
    if (!WAS_ATTACK_USED(effect, 0, this)) {
      return cardDescriptor.value.call(this, store, state, effect);
    }
    const opponent = StateUtils.getOpponent(state, effect.player);
    const ownPromptDescriptor = Object.getOwnPropertyDescriptor(store, 'prompt');
    const originalPrompt = store.prompt;
    if (typeof originalPrompt !== 'function') {
      throw new TypeError('Pinned Store.prompt changed');
    }
    Object.defineProperty(store, 'prompt', {
      configurable:true, writable:true,
      value:function nightWatchPrompt(sourceState, givenPrompts, callback) {
        const prompts = Array.isArray(givenPrompts) ? givenPrompts : [givenPrompts];
        const expected = Math.min(2, opponent.hand.cards.length);
        for (const prompt of prompts) {
          if (prompt instanceof ChooseCardsPrompt &&
              prompt.player === effect.player &&
              prompt.cards === opponent.hand &&
              prompt.message === GameMessage.CHOOSE_CARD_TO_DISCARD &&
              prompt.options.isSecret === true &&
              prompt.options.min === expected &&
              prompt.options.max === expected) {
            // Sample the actual game chance event before any bot sees the prompt.
            const selected = sampleOpaque(prompt.cards.cards, expected, Math.random);
            choices.set(prompt, selected);
            audit.created++;
          }
        }
        return originalPrompt.call(this, sourceState, givenPrompts, callback);
      }
    });
    try {
      return cardDescriptor.value.call(this, store, state, effect);
    } finally {
      if (ownPromptDescriptor) {
        Object.defineProperty(store, 'prompt', ownPromptDescriptor);
      } else {
        delete store.prompt;
      }
    }
  }

  function correctedResolver(player, state, prompt) {
    const precommitted = choices.get(prompt);
    if (precommitted !== undefined && prompt.playerId === player.id) {
      if (!prompt.validate(precommitted)) {
        audit.invalid++;
        throw new Error('Precommitted Night Watch selection became invalid');
      }
      audit.resolved++;
      audit.returnedCounts.push(precommitted.length);
      return new ResolvePromptAction(prompt.id, precommitted);
    }
    return resolverDescriptor.value.call(this, player, state, prompt);
  }

  Object.defineProperty(cardProto, 'reduceEffect', {...cardDescriptor, value:correctedCardReducer});
  Object.defineProperty(aiProto, 'resolvePrompt', {...resolverDescriptor, value:correctedResolver});
  try {
    return {result:execute(), audit};
  } finally {
    Object.defineProperty(aiProto, 'resolvePrompt', resolverDescriptor);
    Object.defineProperty(cardProto, 'reduceEffect', cardDescriptor);
  }
}

module.exports = {withUniformNightWatch};
