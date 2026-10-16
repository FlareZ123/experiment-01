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
 * A Bunnelby PRC / TM Evolution priority for the specific Aichi 2026
 * Vileplume early evolution line. It checks actual Store action legality
 * in a cloned Simulator before selecting the Tool attack.
 * @returns {Function} Research-side SimpleTactic subclass
 */
function makeBunnelbyEvolutionTactic() {
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
          !hasBenchEvolutionTarget(player)) return;
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
function makeBarrageEvolutionResolver() {
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
          !hasBenchEvolutionTarget(player)) return;
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
 * Add a source-conditioned attack and Barrage resolver before upstream
 * generic choices. This leaves default policies untouched and composes
 * with the separate ToolAwareAttackTactic.
 * @param {object} options SimpleBotOptions
 * @returns {object} Cloned options
 */
function withBunnelbyEvolutionLine(options) {
  if (!Array.isArray(options.tactics) ||
      !Array.isArray(options.promptResolvers)) {
    throw new Error('Require tactics and prompt resolvers');
  }
  if (options.tactics.some(t => t.name === 'BunnelbyEvolutionTactic') ||
      options.promptResolvers.some(r => r.name === 'BarrageEvolutionResolver')) {
    throw new Error('Bunnelby Evolution line already installed');
  }
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
      makeBunnelbyEvolutionTactic(),
      ...options.tactics.slice(atkIndex)
    ],
    promptResolvers: [
      ...options.promptResolvers.slice(0, promptIndex),
      makeBarrageEvolutionResolver(),
      ...options.promptResolvers.slice(promptIndex)
    ]
  };
}
module.exports = {
  hasBenchEvolutionTarget,
  makeBunnelbyEvolutionTactic,
  makeBarrageEvolutionResolver,
  withBunnelbyEvolutionLine
};
