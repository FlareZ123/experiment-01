'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Pick the only missing attack resource at a narrow, owner-legitimate Fog
 * Crystal search. Reads deck cards solely from Fog's already-open search
 * prompt; never looks at opponent hidden zones or unrevealed Prize cards.
 *
 * @param {object} state Pinned Twinleaf State
 * @param {object} player Acting owner
 * @param {object} prompt Owner's ChooseCardsPrompt
 * @param {{energySuperType:number,pokemonSuperType:number,basicEnergyType:number,basicStage:number,playerTurnPhase:number}} types
 * @returns {object[]|null} One Basic Psychic Energy target, or delegate
 */
function selectRank31FogEnergy(state, player, prompt, types) {
  const active = state.players[state.activePlayer];
  if (state.phase !== types.playerTurnPhase ||
      active?.id !== player.id ||
      player.energyPlayedTurn >= state.turn ||
      player.cannotPlayEnergyCards ||
      player.active.getPokemonCard()?.fullName !== 'Chimecho CIN' ||
      player.active.cards.some(card => card.superType === types.energySuperType) ||
      player.hand.cards.some(card => card.superType === types.energySuperType ||
        (card.superType === types.pokemonSuperType &&
         card.stage === types.basicStage)) ||
      player.bench.some(slot => slot.getPokemonCard()) ||
      !player.supporter.cards.some(card => card.fullName === 'Fog Crystal CRE') ||
      prompt.playerId !== player.id ||
      prompt.cards !== player.deck ||
      prompt.options.max < 1) {
    return null;
  }
  const energy = prompt.cards.cards.find(card =>
    card.superType === types.energySuperType &&
    card.energyType === types.basicEnergyType &&
    card.name === 'Psychic Energy');
  if (!energy || !prompt.validate([energy], state)) return null;
  return [energy];
}

/**
 * Opt-in opponent-pilot correction for a rank31 Chimecho solo Active,
 * still-empty Bench and no attached/held Energy. Only overrides the
 * requested Basic Psychic Energy in a real Fog Crystal ChooseCardsPrompt.
 * All other choices defer to the pinned generic resolver.
 *
 * @param {object} options Pinned simple-bot configuration
 * @returns {object} New configuration; original input remains untouched
 */
function withRank31FogEnergyPrompt(options) {
  /** @param {string} name @returns {any} */
  const load = name => require(path.join(output, name));
  const {ChooseCardsPromptResolver} =
    load('simple-bot/prompt-resolver/choose-cards-prompt-resolver');
  const {ChooseCardsPrompt} =
    load('game/store/prompts/choose-cards-prompt');
  const {ResolvePromptAction} =
    load('game/store/actions/resolve-prompt-action');
  const {EnergyType, SuperType, Stage} =
    load('game/store/card/card-types');
  const {GamePhase} =
    load('game/store/state/state');

  if (options.promptResolvers.some(resolver =>
      resolver.name === 'Rank31FogEnergyResolver')) return options;

  class Rank31FogEnergyResolver extends ChooseCardsPromptResolver {
    /** @param {object} state @param {object} player @param {object} prompt */
    resolvePrompt(state, player, prompt) {
      if (prompt instanceof ChooseCardsPrompt) {
        const selected = selectRank31FogEnergy(state, player, prompt, {
          energySuperType: SuperType.ENERGY,
          pokemonSuperType: SuperType.POKEMON,
          basicEnergyType: EnergyType.BASIC,
          basicStage: Stage.BASIC,
          playerTurnPhase: GamePhase.PLAYER_TURN
        });
        if (selected) return new ResolvePromptAction(prompt.id, selected);
      }
      return super.resolvePrompt(state, player, prompt);
    }
  }

  return {...options,
    promptResolvers: [Rank31FogEnergyResolver, ...options.promptResolvers]};
}

module.exports = {selectRank31FogEnergy, withRank31FogEnergyPrompt};
