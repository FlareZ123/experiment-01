'use strict';

/**
 * Source-opponent starting-board counterfactual for Snorlax Stall ranks 3/7.
 * A player holding an eligible printed Snorlax can elect to start it Active
 * without placing any other initially held Basics on the Bench.
 * Only the owner's initial hand and the live setup prompt are inspected.
 * This does not implement the opponent's subsequent stall decisions.
 */

/**
 * Choose exactly one already-held Snorlax, leaving every other Basic in hand.
 * The caller must enforce the real setup prompt's legality validation.
 * @param {object[]} ownHand Current player's initial hand card references.
 * @returns {object[]|null} Sole selected physical card, or no intervention.
 */
function chooseSoloSnorlax(ownHand) {
  const snorlax = ownHand.find(card => card.fullName === 'Snorlax PGO');
  return snorlax ? [snorlax] : null;
}

/**
 * Replace just the pinned starting-Pokémon resolver for one physical seat.
 * Record the owner's actual setup decision, including opportunity negatives.
 * @param {object} options One seat's SimpleTacticsAi options.
 * @param {object} types Pinned prompt/action constructors and constants.
 * @param {object[]} events Output-only real setup-prompt audit.
 * @returns {object} New per-seat options, with original options untouched.
 */
function withSoloSnorlaxOpening(options, types, events) {
  const {ChooseCardsPromptResolver, ChooseCardsPrompt,
    ResolvePromptAction, GameMessage} = types;
  if (options.promptResolvers.some(resolver =>
    resolver.name === 'SoloSnorlaxOpeningResolver')) return options;

  class SoloSnorlaxOpeningResolver extends ChooseCardsPromptResolver {
    /** @param {object} state @param {object} player @param {object} prompt */
    resolvePrompt(state, player, prompt) {
      if (!(prompt instanceof ChooseCardsPrompt) ||
          prompt.message !== GameMessage.CHOOSE_STARTING_POKEMONS ||
          prompt.playerId !== player.id) {
        return super.resolvePrompt(state, player, prompt);
      }

      const proposed = chooseSoloSnorlax(player.hand.cards);
      const legal = proposed !== null && prompt.validate(proposed, state);
      const action = legal ?
        new ResolvePromptAction(prompt.id, proposed) :
        super.resolvePrompt(state, player, prompt);
      events.push({
        playerId:player.id,
        promptId:prompt.id,
        sawSnorlax:proposed !== null,
        appliedSoloSnorlax:legal,
        selectedCount:Array.isArray(action?.result)?action.result.length:null,
        selectedNames:Array.isArray(action?.result)?
          action.result.map(card=>card.fullName):[],
        // This count uses only the owner's hand, visible at setup.
        otherBasicCountInOwnHand:player.hand.cards.filter(card =>
          card.stage === proposed?.[0]?.stage &&
          card.superType === proposed?.[0]?.superType &&
          card !== proposed?.[0]).length
      });
      return action;
    }
  }

  const index = options.promptResolvers.indexOf(ChooseCardsPromptResolver);
  if (index < 0) throw new Error('Pinned starting-card resolver missing');
  const promptResolvers = options.promptResolvers.slice();
  promptResolvers[index] = SoloSnorlaxOpeningResolver;
  return {...options, promptResolvers};
}

module.exports={chooseSoloSnorlax,withSoloSnorlaxOpening};
