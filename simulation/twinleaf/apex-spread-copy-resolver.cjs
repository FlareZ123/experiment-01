'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Count potential one-Prize Bench knockouts from Phantom Dive's six counters.
 * This is an optimistic local tactical signal, not a damage-prevention oracle.
 * @param {object} opponent Twinleaf Player with Benched PokemonCardLists.
 * @returns {number}
 */
function phantomDiveBenchWindows(opponent) {
  return opponent.bench.filter(slot => {
    const pokemon = slot.getPokemonCard();
    if (!pokemon || pokemon.powers?.length || slot.tools?.length) return false;
    // In the pinned engine, hp is populated as part of the battle state.
    // Synthetic fixtures can leave hp at zero until their first HP check.
    const maximumHp = slot.hp || pokemon.hp + slot.hpBonus;
    const remainingHp = maximumHp - slot.damage;
    return remainingHp > 0 && remainingHp <= 60;
  }).length;
}

/**
 * This narrowly scoped decision only compares tied 200-damage copy payloads.
 * An exposed Benched KO is a material tactical option missed by the upstream
 * resolver. It does not account for immunity, Mist Energy, prize modifiers,
 * counter-target availability, or the value of Rolling Iron's protection.
 * @param {object} state Engine state.
 * @param {object} player The acting Regidrago player.
 * @param {object} prompt Engine ChooseAttackPrompt.
 * @param {object} originalAction Default resolver result.
 * @returns {object|null} The exact legal Attack instance, or null.
 */
function preferredPhantomDive(state, player, prompt, originalAction) {
  if (originalAction?.result?.name !== 'Rolling Iron' ||
      player.active.getPokemonCard()?.name !== 'Regidrago VSTAR' ||
      state.phase !== 3) { // GamePhase.ATTACK in pinned numeric enum.
    return null;
  }
  const opponent = state.players.find(p => p.id !== player.id);
  if (!opponent || phantomDiveBenchWindows(opponent) === 0) return null;
  const choice = prompt.cards.flatMap((card, index) =>
    card.attacks.filter(attack =>
      attack.name === 'Phantom Dive' &&
      attack.damage === originalAction.result.damage &&
      !prompt.options.blocked.some(block =>
        block.index === index && block.attack === attack.name))
  )[0];
  return choice && prompt.validate(choice) ? choice : null;
}

/**
 * Produce a research-side resolver subclass. This deliberately delegates all
 * nonmatching prompts to the original pinned SimpleTacticsAi resolver.
 * @returns {Function} Subclass compatible with allPromptResolvers.
 */
function spreadAwareCopyResolverClass() {
  /** @param {string} name */
  const load = name => require(path.join(output, name));
  const {ChooseAttackPromptResolver} =
    load('simple-bot/prompt-resolver/choose-attack-prompt-resolver');
  const {ChooseAttackPrompt} =
    load('game/store/prompts/choose-attack-prompt');
  const {GameMessage} = load('game/game-message');
  const {ResolvePromptAction} =
    load('game/store/actions/resolve-prompt-action');

  return class SpreadAwareCopyResolver extends ChooseAttackPromptResolver {
    /** @param {object} state @param {object} player @param {object} prompt */
    resolvePrompt(state, player, prompt) {
      const baseline = super.resolvePrompt(state, player, prompt);
      if (!(prompt instanceof ChooseAttackPrompt) ||
          prompt.message !== GameMessage.CHOOSE_ATTACK_TO_COPY) {
        return baseline;
      }
      const choice = preferredPhantomDive(state, player, prompt, baseline);
      return choice ? new ResolvePromptAction(prompt.id, choice) : baseline;
    }
  };
}

/**
 * Install only for the synchronous body of fn, restoring the original factory
 * even when the experiment throws. Does not touch the vendor source tree.
 * @template T
 * @param {()=>T} fn
 * @returns {T}
 */
function withSpreadAwareCopyResolver(fn) {
  const definitions = require(path.join(output,'simple-bot/simple-bot-definitions'));
  const resolvers = definitions.allPromptResolvers;
  const index = resolvers.findIndex(
    ctor => ctor.name === 'ChooseAttackPromptResolver');
  if (index < 0) throw new Error('Pinned copy resolver extension point changed');
  const original = resolvers[index];
  resolvers[index] = spreadAwareCopyResolverClass();
  try {
    return fn();
  } finally {
    resolvers[index] = original;
  }
}

module.exports = {
  phantomDiveBenchWindows,
  preferredPhantomDive,
  spreadAwareCopyResolverClass,
  withSpreadAwareCopyResolver
};
