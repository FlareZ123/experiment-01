'use strict';

/**
 * Candidate-only, information-set-clean opening Active probe for New Moon.
 * The selection is made solely from the player's own chosen Basic Pokemon and
 * own initial hand. No opponent identity, shuffled deck, or Prize inspection.
 * This tests native Horror House-GX access; it is not a general best-start rule.
 */

/** @param {object[]} selected @param {object[]} hand @returns {object[]} */
function prioritizeNativeGengar(selected, hand) {
  const psychicVisible = hand.some(card =>
    card.name === 'Psychic Energy' ||
    card.name === 'Telepathic Psychic Energy');
  if (!psychicVisible) return selected;
  const index = selected.findIndex(card =>
    card.fullName === 'Gengar & Mimikyu-GX TEU');
  if (index < 1) return selected;
  return [selected[index], ...selected.slice(0, index), ...selected.slice(index + 1)];
}

/**
 * Reorder only the already-chosen Basic cards, preserving exact references.
 * @param {object} options Pinned SimpleTacticsAi options.
 * @param {object} types Pinned prompt/action constructors and constants.
 * @returns {object}
 */
function withNewMoonNativeOpeningPivot(options, types) {
  const {ChooseCardsPromptResolver, ChooseCardsPrompt,
    ResolvePromptAction, GameMessage} = types;
  if (options.promptResolvers.some(resolver =>
    resolver.name === 'NewMoonNativeOpeningPivotResolver')) return options;

  class NewMoonNativeOpeningPivotResolver extends ChooseCardsPromptResolver {
    /** @param {object} state @param {object} player @param {object} prompt */
    resolvePrompt(state, player, prompt) {
      const action = super.resolvePrompt(state, player, prompt);
      if (!(prompt instanceof ChooseCardsPrompt) ||
          prompt.message !== GameMessage.CHOOSE_STARTING_POKEMONS ||
          !Array.isArray(action?.result)) return action;
      const reordered = prioritizeNativeGengar(action.result, player.hand.cards);
      if (reordered === action.result || !prompt.validate(reordered)) return action;
      return new ResolvePromptAction(prompt.id, reordered);
    }
  }

  const index = options.promptResolvers.indexOf(ChooseCardsPromptResolver);
  if (index < 0) throw new Error('Pinned starting-card resolver missing');
  const promptResolvers = [...options.promptResolvers];
  promptResolvers[index] = NewMoonNativeOpeningPivotResolver;
  return {...options, promptResolvers};
}

module.exports = {prioritizeNativeGengar, withNewMoonNativeOpeningPivot};
