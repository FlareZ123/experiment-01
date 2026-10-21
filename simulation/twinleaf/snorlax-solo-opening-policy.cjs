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
 * @param {{declineOptionalBench?:boolean}} [policy] Distinct v2 optional second setup choice.
 * @returns {object} New per-seat options, with original options untouched.
 */
function withSoloSnorlaxOpening(options, types, events,
  {declineOptionalBench=false}={}) {
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

      const held = chooseSoloSnorlax(player.hand.cards);
      const activeAlreadySolo = declineOptionalBench &&
        player.active.getPokemonCard()?.fullName === 'Snorlax PGO' &&
        !player.bench.some(slot=>slot.getPokemonCard());
      const chooseEmpty = declineOptionalBench && activeAlreadySolo &&
        prompt.validate([],state);
      const proposed = chooseEmpty ? [] : held;
      const legal = proposed !== null && prompt.validate(proposed, state);
      const action = legal ?
        new ResolvePromptAction(prompt.id, proposed) :
        super.resolvePrompt(state, player, prompt);
      events.push({
        playerId:player.id,
        promptId:prompt.id,
        sawSnorlax:held !== null,
        appliedSoloSnorlax:legal && proposed.length===1,
        alreadySoloBefore:activeAlreadySolo,
        declinedOptionalBench:legal && chooseEmpty,
        selectedCount:Array.isArray(action?.result)?action.result.length:null,
        selectedNames:Array.isArray(action?.result)?
          action.result.map(card=>card.fullName):[],
        // This count uses only the owner's hand, visible at setup.
        otherBasicCountInOwnHand:player.hand.cards.filter(card =>
          card.stage === held?.[0]?.stage &&
          card.superType === held?.[0]?.superType &&
          card !== held?.[0]).length
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

/**
 * Suppress ordinary play-from-hand Basic Benching while the own Active is a
 * lone PGO Snorlax. Other tactics remain at their pinned original positions.
 * This opt-in control is a hypothesis about source player strategy, not a
 * claim that refusing backup Pokémon is always correct.
 *
 * @param {object} options Per-seat pinned SimpleBotOptions.
 * @param {{PlayBasicTactic: Function}} types Pinned tactic class.
 * @returns {object} New options preserving original tactics array.
 */
/**
 * Visible opponent attachments are a deliberately coarse public threat
 * signal. Energy in a hand or deck is never consulted. Attacks can be
 * possible with zero attached Energy, so this is not a lethal oracle.
 * @param {object} state Actual current state, including two player boards.
 * @param {object} player Source-side owner.
 * @returns {boolean} Whether an opposing in-play Pokémon has Energy.
 */
function opponentHasVisibleAttachedEnergy(state,player) {
  const opponent=state.players.find(other=>other.id!==player.id);
  return [opponent.active,...opponent.bench].some(slot=>
    !!slot.getPokemonCard() && slot.energies.cards.length>0);
}

/**
 * @param {object} options Per-seat pinned SimpleBotOptions.
 * @param {{PlayBasicTactic: Function}} types Pinned tactic class.
 * @param {{allowBackupOnVisibleOppEnergy?:boolean}} [policy] Opt-in
 *   owner-information-safe escape from unconditional solo Bench restraint.
 * @returns {object} New tactics array without mutating the original.
 */
function withSoloSnorlaxBenchPreservation(options,{PlayBasicTactic},
  {allowBackupOnVisibleOppEnergy=false}={}) {
  if(options.tactics.some(Tactic=>
    Tactic.name==='SoloSnorlaxBenchPreservationTactic')) return options;
  const index=options.tactics.indexOf(PlayBasicTactic);
  if(index<0)throw new Error('Pinned PlayBasicTactic missing');
  class SoloSnorlaxBenchPreservationTactic extends PlayBasicTactic {
    /** @param {object} state @param {object} player */
    useTactic(state,player) {
      if(player.active.getPokemonCard()?.fullName==='Snorlax PGO' &&
          !player.bench.some(slot=>slot.getPokemonCard())) {
        if(!allowBackupOnVisibleOppEnergy ||
            !opponentHasVisibleAttachedEnergy(state,player)) return undefined;
      }
      return super.useTactic(state,player);
    }
  }
  const tactics=options.tactics.slice();
  tactics[index]=SoloSnorlaxBenchPreservationTactic;
  return {...options,tactics};
}

module.exports={chooseSoloSnorlax,withSoloSnorlaxOpening,
  withSoloSnorlaxBenchPreservation,opponentHasVisibleAttachedEnergy};
