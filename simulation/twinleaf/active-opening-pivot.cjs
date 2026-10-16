'use strict';

/**
 * Opt-in opening Active counterfactual for an existing selected Basic.
 * Preserve the starting selection; put selected Shadow Rider Calyrex V first.
 * The pinned setup reducer puts the first selected card Active.
 * This probes a decision policy and establishes no competitive advantage.
 *
 * @param {object} options Existing pinned SimpleBotOptions.
 * @param {object} types Pinned compiled engine classes and message constants.
 * @returns {object} Options with exactly one setup resolver replaced.
 */
function withActiveOpeningPivot(options, types) {
  const {ChooseCardsPromptResolver, ChooseCardsPrompt,
    ResolvePromptAction, GameMessage} = types;

  class OpeningPivotResolver extends ChooseCardsPromptResolver {
    resolvePrompt(state, player, prompt) {
      const action = super.resolvePrompt(state, player, prompt);
      if (!(prompt instanceof ChooseCardsPrompt) ||
          prompt.message !== GameMessage.CHOOSE_STARTING_POKEMONS ||
          !Array.isArray(action?.result)) return action;
      const cards = action.result;
      const index = cards.findIndex(card => card.name === 'Shadow Rider Calyrex V');
      if (index < 1) return action;
      const selected = [cards[index], ...cards.slice(0, index), ...cards.slice(index + 1)];
      if (!prompt.validate(selected)) return action;
      return new ResolvePromptAction(prompt.id, selected);
    }
  }

  const index = options.promptResolvers.indexOf(ChooseCardsPromptResolver);
  if (index < 0) throw new Error('Pinned ChooseCardsPromptResolver extension point missing.');
  const promptResolvers = [...options.promptResolvers];
  promptResolvers[index] = OpeningPivotResolver;
  return {...options, promptResolvers};
}

module.exports = {withActiveOpeningPivot};
