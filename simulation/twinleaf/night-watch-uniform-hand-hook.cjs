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
 * @param {{counterfactualFirstRootPair?:[number,number],auditPlanningSamples?:boolean,planningRandomSource?:()=>number}} [options]
 *   Opt-in planning classification or planning-only chance stress intervention.
 * @returns {{result:T,audit:object}}
 */
function withUniformNightWatch(execute,options={}) {
  if (typeof execute !== 'function') throw new TypeError('execute must be synchronous');
  const rootPair=options.counterfactualFirstRootPair;
  if(options.planningRandomSource!==undefined &&
     (options.auditPlanningSamples!==true ||
      typeof options.planningRandomSource!=='function')) {
    throw new TypeError('Planning-only sampler requires active decision-depth audit');
  }
  if (rootPair !== undefined &&
      (!Array.isArray(rootPair) || rootPair.length!==2 ||
       new Set(rootPair).size!==2 ||
       !rootPair.every(position=>Number.isSafeInteger(position)&&position>=0&&position<5))) {
    throw new RangeError('Counterfactual first-root pair must be two distinct positions in [0,4]');
  }
  const load = relative => require(path.join(output, relative));
  const {TrevenantDusknoirGX} =
    load('sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx');
  const {WAS_ATTACK_USED} = load('game/store/prefabs/prefabs');
  const {StateUtils} = load('game/store/state-utils');
  const {ChooseCardsPrompt} = load('game/store/prompts/choose-cards-prompt');
  const {GameMessage} = load('game/game-message');
  const {SimpleTacticsAi} = load('simple-bot/simple-tactics-ai');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const {Store} = load('game/store/store');

  const cardProto = TrevenantDusknoirGX.prototype;
  const aiProto = SimpleTacticsAi.prototype;
  const cardDescriptor = Object.getOwnPropertyDescriptor(cardProto, 'reduceEffect');
  const resolverDescriptor = Object.getOwnPropertyDescriptor(aiProto, 'resolvePrompt');
  const decisionDescriptor=options.auditPlanningSamples===true ?
    Object.getOwnPropertyDescriptor(aiProto,'decodeNextAction') : null;
  if(options.auditPlanningSamples===true &&
     typeof decisionDescriptor?.value!=='function') {
    throw new TypeError('Pinned bot decision interface changed');
  }
  let decisionDepth=0;
  if (typeof cardDescriptor?.value !== 'function' ||
      typeof resolverDescriptor?.value !== 'function') {
    throw new TypeError('Pinned Night Watch card/bot interfaces changed');
  }
  const choices = new WeakMap();
  const dispatchDescriptor=rootPair===undefined?null:
    Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  if(rootPair!==undefined&&typeof dispatchDescriptor?.value!=='function')
    throw new TypeError('Pinned root Store.dispatch is unavailable');
  let rootStore=null;
  const audit = {
    schema:'night-watch-random-prompt-hook-v1',
    created:0, resolved:0, returnedCounts:[], invalid:0,
    precommitsInBotDecision:0, precommitsOutsideBotDecision:0,
    resolutionsInBotDecision:0, resolutionsOutsideBotDecision:0,
    counterfactualApplied:false, counterfactualFirstRootPair:rootPair||null,
    planningRandomOverrideEnabled:options.planningRandomSource!==undefined,
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
            const sampleRandom = decisionDepth>0 && options.planningRandomSource ?
              options.planningRandomSource : Math.random;
            let selected = sampleOpaque(prompt.cards.cards, expected, sampleRandom);
            if(rootPair!==undefined && store===rootStore &&
               audit.counterfactualApplied===false) {
              if(expected!==2 || prompt.cards.cards.length!==5)
                throw new Error('The first true-root Night Watch hand is no longer five cards');
              // Preserve two consumed game-RNG samples even when conditionally
              // enumerating a specified pair, so downstream chance stream is comparable.
              selected=rootPair.map(position=>prompt.cards.cards[position]);
              audit.counterfactualApplied=true;
            }
            choices.set(prompt, selected);
            audit.created++;
            if(decisionDepth>0) audit.precommitsInBotDecision++;
            else audit.precommitsOutsideBotDecision++;
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
      if(decisionDepth>0) audit.resolutionsInBotDecision++;
      else audit.resolutionsOutsideBotDecision++;
      audit.returnedCounts.push(precommitted.length);
      return new ResolvePromptAction(prompt.id, precommitted);
    }
    return resolverDescriptor.value.call(this, player, state, prompt);
  }

  if(dispatchDescriptor) {
    Object.defineProperty(Store.prototype,'dispatch',{
      ...dispatchDescriptor,
      value:function rootStoreDiscovery(action,...args) {
        if(rootStore===null)rootStore=this;
        return dispatchDescriptor.value.call(this,action,...args);
      }
    });
  }
  Object.defineProperty(cardProto, 'reduceEffect', {...cardDescriptor, value:correctedCardReducer});
  Object.defineProperty(aiProto, 'resolvePrompt', {...resolverDescriptor, value:correctedResolver});
  if(decisionDescriptor) Object.defineProperty(aiProto,'decodeNextAction',{
    ...decisionDescriptor,
    value:function observedDecision(...args) {
      decisionDepth++;
      try { return decisionDescriptor.value.call(this,...args); }
      finally { decisionDepth--; }
    }
  });
  try {
    return {result:execute(), audit};
  } finally {
    if(decisionDescriptor)Object.defineProperty(aiProto,'decodeNextAction',decisionDescriptor);
    Object.defineProperty(aiProto, 'resolvePrompt', resolverDescriptor);
    Object.defineProperty(cardProto, 'reduceEffect', cardDescriptor);
    if(dispatchDescriptor)Object.defineProperty(Store.prototype,'dispatch',dispatchDescriptor);
  }
}

module.exports = {withUniformNightWatch};
