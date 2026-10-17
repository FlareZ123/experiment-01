'use strict';

const path = require('node:path');
const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} relative */
const load = relative => require(path.join(root, relative));

/**
 * Whether a source-legal TM Evolution can progress an existing Benched
 * evolutionary chain using a Pokémon card still present in the deck.
 * This is a tactical availability check, not a complete line planner.
 * @param {object} player
 * @returns {boolean}
 */
function hasBenchEvolutionTarget(player) {
  return player.bench.some(slot => {
    const active = slot.getPokemonCard();
    return active && player.deck.cards.some(card =>
      card.evolvesFrom === active.name && card.stage !== undefined);
  });
}

/**
 * K0-safe possibility test using the known source 60 rather than the real
 * hidden deck/Prize partition. Each physical printing contributes one copy.
 * The result may stay true when all eligible stages are Prized, as it must
 * until the player actually gains that information through play.
 *
 * @param {object} player Pinned Store player.
 * @param {object[]} sourceCards Original physical 60 Card templates.
 * @returns {boolean}
 */
function hasK0PossibleBenchEvolutionTarget(player, sourceCards) {
  const names = new Set(player.bench
    .map(slot => slot.getPokemonCard()?.name).filter(Boolean));
  if (names.size === 0) return false;
  const remaining = new Map();
  for (const card of sourceCards) {
    if (card.stage === undefined || !names.has(card.evolvesFrom)) continue;
    remaining.set(card.fullName, (remaining.get(card.fullName) || 0) + 1);
  }
  // An owner can see these cards, but cannot inspect their own hidden deck
  // or face-down Prizes without an effect that grants that information.
  for (const zone of [
    player.hand, player.discard, player.lostzone, player.active, ...player.bench
  ]) {
    if (!zone) continue;
    for (const card of zone.cards) {
      if (remaining.has(card.fullName)) {
        remaining.set(card.fullName, remaining.get(card.fullName) - 1);
      }
    }
  }
  return [...remaining.values()].some(count => count > 0);
}

/** Keep Burrow's immediate opponent-deckout option available. */
function immediateBurrowDeckout(state, player) {
  const opponent = state.players.find(side => side.id !== player.id);
  return opponent?.deck.cards.length <= 1;
}

/**
 * A Bunnelby PRC / TM Evolution priority for the specific Aichi 2026
 * Vileplume early evolution line. It checks actual Store action legality
 * in a cloned Simulator before selecting the Tool attack.
 * @returns {Function} Research-side SimpleTactic subclass
 */
function makeBunnelbyEvolutionTactic(hasTarget = hasBenchEvolutionTarget) {
  const {SimpleTactic} = load('simple-bot/simple-tactics/simple-tactics');
  const {AttackAction} = load('game/store/actions/game-actions');
  const {Simulator} = load('game/bots/simulator');
  return class BunnelbyEvolutionTactic extends SimpleTactic {
    /** @param {object} state @param {object} player */
    useTactic(state, player) {
      if (state.prompts.some(prompt => prompt.result === undefined)) return;
      if (player.active.getPokemonCard()?.fullName !== 'Bunnelby PRC' ||
          !player.active.tools.some(tool =>
            tool.fullName === 'Technical Machine: Evolution PAR') ||
          (!hasTarget(player) || immediateBurrowDeckout(state, player))) return;
      const action = new AttackAction(player.id, 'Evolution');
      try {
        new Simulator(state, this.options.arbiter).dispatch(action);
        return action;
      } catch {
        return;
      }
    }
  };
}

/**
 * On the Barrage second-attack prompt, use TM Evolution again when there are
 * still evolution targets. The generic ChooseAttackPromptResolver otherwise
 * selects zero-damage Burrow before zero-damage Evolution by list order.
 * @returns {Function} Research-side PromptResolver subclass
 */
function makeBarrageEvolutionResolver(hasTarget = hasBenchEvolutionTarget) {
  const {PromptResolver} = load('simple-bot/prompt-resolver/prompt-resolver');
  const {ChooseAttackPrompt} = load('game/store/prompts/choose-attack-prompt');
  const {ResolvePromptAction} =
    load('game/store/actions/resolve-prompt-action');
  const {GamePhase} = load('game/store/state/state');
  return class BarrageEvolutionResolver extends PromptResolver {
    /** @param {object} state @param {object} player @param {object} prompt */
    resolvePrompt(state, player, prompt) {
      if (!(prompt instanceof ChooseAttackPrompt) ||
          state.phase !== GamePhase.ATTACK ||
          player.active.getPokemonCard()?.fullName !== 'Bunnelby PRC' ||
          (!hasTarget(player) || immediateBurrowDeckout(state, player))) return;
      const toolIndex = prompt.cards.findIndex(card =>
        card.fullName === 'Technical Machine: Evolution PAR');
      if (toolIndex < 0) return;
      const attack = prompt.cards[toolIndex].attacks.find(a =>
        a.name === 'Evolution');
      if (!attack ||
          prompt.options.blocked.some(row =>
            row.index === toolIndex && row.attack === attack.name) ||
          !prompt.validate(attack)) return;
      return new ResolvePromptAction(prompt.id, attack);
    }
  };
}


/**
 * Observe an actual per-seat bot prompt displaying its entire own deck. This
 * resolver returns no action, so ordinary prompt choice remains unchanged.
 * The callback is scoped to one bot/options instance and is never consulted
 * until its owner has actually received a source-deck search prompt.
 *
 * @param {()=>void} onOwnerSearch
 * @returns {Function} Research-side read-only PromptResolver subclass.
 */
function makeOwnerDeckObservationResolver(onOwnerSearch) {
  const {PromptResolver}=load('simple-bot/prompt-resolver/prompt-resolver');
  const {ChooseCardsPrompt}=load('game/store/prompts/choose-cards-prompt');
  return class ObserveOwnerDeckSearchResolver extends PromptResolver {
    resolvePrompt(state,player,prompt) {
      if(prompt instanceof ChooseCardsPrompt &&
          prompt.playerId===player.id && prompt.cards===player.deck) {
        onOwnerSearch();
      }
      return undefined;
    }
  };
}

/**
 * Add a source-conditioned attack and Barrage resolver before upstream
 * generic choices. This leaves default policies untouched and composes
 * with the separate ToolAwareAttackTactic.
 * @param {object} options SimpleBotOptions
 * @param {{sourceCards?:object[],observeFirstOwnDeckSearch?:boolean}} [configuration] Source 60 plus opt-in observed K0 to K1 knowledge transition.
 * @returns {object} Cloned options
 */
function withBunnelbyEvolutionLine(options, {sourceCards,observeFirstOwnDeckSearch=false} = {}) {
  if (!Array.isArray(options.tactics) ||
      !Array.isArray(options.promptResolvers)) {
    throw new Error('Require tactics and prompt resolvers');
  }
  if (options.tactics.some(t => t.name === 'BunnelbyEvolutionTactic') ||
      options.promptResolvers.some(r => r.name === 'BarrageEvolutionResolver')) {
    throw new Error('Bunnelby Evolution line already installed');
  }
  if (sourceCards !== undefined && (!Array.isArray(sourceCards) || sourceCards.length !== 60)) {
    throw new Error('K0-safe Evolution requires exactly 60 physical source Card copies');
  }
  if (observeFirstOwnDeckSearch && !sourceCards) {
    throw new Error('K1 observation requires a known physical source 60');
  }
  let hasObservedOwnDeck = false;
  const hasTarget = sourceCards === undefined ? hasBenchEvolutionTarget :
    player => hasObservedOwnDeck ? hasBenchEvolutionTarget(player) :
      hasK0PossibleBenchEvolutionTarget(player, sourceCards);
  const Observer = observeFirstOwnDeckSearch ?
    makeOwnerDeckObservationResolver(() => {hasObservedOwnDeck=true;}) : null;
  const toolIndex = options.tactics.findIndex(t =>
    t.name === 'ToolAwareAttackTactic');
  const atkIndex = toolIndex >= 0 ? toolIndex :
    options.tactics.findIndex(t => t.name === 'AttackTactic');
  const promptIndex = options.promptResolvers.findIndex(r =>
    r.name === 'ChooseAttackPromptResolver');
  if (atkIndex < 0 || promptIndex < 0) {
    throw new Error('Required generic attack strategy/resolver missing');
  }
  return {
    ...options,
    tactics: [
      ...options.tactics.slice(0, atkIndex),
      makeBunnelbyEvolutionTactic(hasTarget),
      ...options.tactics.slice(atkIndex)
    ],
    promptResolvers: [
      ...(Observer ? [Observer] : []),
      ...options.promptResolvers.slice(0, promptIndex),
      makeBarrageEvolutionResolver(hasTarget),
      ...options.promptResolvers.slice(promptIndex)
    ]
  };
}
module.exports = {
  hasBenchEvolutionTarget,
  hasK0PossibleBenchEvolutionTarget,
  immediateBurrowDeckout,
  makeBunnelbyEvolutionTactic,
  makeBarrageEvolutionResolver,
  makeOwnerDeckObservationResolver,
  withBunnelbyEvolutionLine
};
