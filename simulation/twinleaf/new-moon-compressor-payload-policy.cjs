'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const engine = name => require(path.join(output, name));

const GENGAR = 'Gengar & Mimikyu-GX TEU';
const TREV = 'Trevenant & Dusknoir-GX SMP';
const MEWTWO = 'Mewtwo & Mew-GX UNM';

/**
 * Decide whether to spend a held Battle Compressor preparing Perfection.
 * This predicate uses only the player's own public zones and hand. The
 * presence of a target in the deck is deliberately unknown until search.
 *
 * @param {object} state
 * @param {object} player
 * @param {number} playerTurnPhase
 * @param {{allowBenchedMewtwo?:boolean}} [setup] Versioned setup option.
 * @returns {boolean}
 */
function shouldSeekPayload(state, player, playerTurnPhase, setup={}) {
  const has = (cards, name) => cards.some(card => card.fullName === name);
  const mewtwoReady = player.active.getPokemonCard()?.fullName === MEWTWO ||
    (setup.allowBenchedMewtwo === true &&
      player.bench.some(slot => slot.getPokemonCard()?.fullName === MEWTWO));
  return state.phase === playerTurnPhase &&
    state.turn <= 6 &&
    !state.prompts.some(prompt => prompt.result === undefined) &&
    mewtwoReady &&
    player.deck.cards.length > 0 &&
    player.cannotPlayItemCards !== true &&
    player.hand.cards.some(card => card.name === 'Battle Compressor') &&
    // Perfection only sees own Bench and discard; a held GX donor is
    // stranded until another effect moves it into a usable zone.
    !has(player.discard.cards, GENGAR) &&
    !player.bench.some(slot => slot.getPokemonCard()?.fullName === GENGAR);
}

/**
 * Select only named attack payloads after a legal owner-deck search has
 * exposed its card objects. Returns an empty selection if both are absent.
 *
 * @param {object[]} visibleCards
 * @param {number} maximum
 * @returns {object[]}
 */
function selectPayloads(visibleCards, maximum) {
  const result = [];
  for (const name of [GENGAR, TREV]) {
    const match = visibleCards.find(card =>
      card.fullName === name && !result.includes(card));
    if (match && result.length < maximum) result.push(match);
  }
  return result;
}

/**
 * Install an opt-in policy for exactly one engine seat. The prompt resolver
 * sees the deck only when the owner's Battle Compressor search is pending.
 * No card inventories, Prizes, or physical deal are modified.
 *
 * @param {object} options
 * @param {{allowBenchedMewtwo?:boolean}} [setup]
 *   Explicit opt-in anticipatory preparation. Existing source-only runs
 *   retain their Active-only behavior unless this second argument is set.
 * @returns {object}
 */
function withNewMoonCompressorPayload(options,setup={}) {
  const {SimpleTactic} = engine('simple-bot/simple-tactics/simple-tactics');
  const {PromptResolver} = engine('simple-bot/prompt-resolver/prompt-resolver');
  const {PlayCardAction,PlayerType,SlotType} =
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction} =
    engine('game/store/actions/resolve-prompt-action');
  const {ChooseCardsPrompt} =
    engine('game/store/prompts/choose-cards-prompt');
  const {GamePhase} = engine('game/store/state/state');

  if (options.tactics.some(t => t.name === 'NewMoonPayloadCompressorTactic') &&
      options.promptResolvers.some(r => r.name === 'NewMoonPayloadCompressorResolver')) {
    return options;
  }

  class NewMoonPayloadCompressorTactic extends SimpleTactic {
    /** @param {object} state @param {object} player */
    useTactic(state, player) {
      if (!shouldSeekPayload(state, player, GamePhase.PLAYER_TURN, setup)) return;
      const index = player.hand.cards.findIndex(card =>
        card.name === 'Battle Compressor');
      return new PlayCardAction(player.id, index, {
        player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
      });
    }
  }

  class NewMoonPayloadCompressorResolver extends PromptResolver {
    /** @param {object} state @param {object} player @param {object} prompt */
    resolvePrompt(state, player, prompt) {
      if (!(prompt instanceof ChooseCardsPrompt) ||
          prompt.player !== player ||
          prompt.cards !== player.deck ||
          !player.supporter.cards.some(card => card.name === 'Battle Compressor')) {
        return;
      }
      const chosen = selectPayloads(prompt.cards.cards, prompt.options.max);
      if (chosen.length > 0 && prompt.validate(chosen, state)) {
        return new ResolvePromptAction(prompt.id, chosen);
      }
      return;
    }
  }

  const index = options.tactics.findIndex(t => t.name === 'PlayTrainerTactic');
  if (index < 0) throw new Error('Pinned PlayTrainerTactic is missing');
  return {
    ...options,
    tactics: [...options.tactics.slice(0, index),
      NewMoonPayloadCompressorTactic, ...options.tactics.slice(index)],
    promptResolvers: [NewMoonPayloadCompressorResolver, ...options.promptResolvers]
  };
}

module.exports = {
  GENGAR, TREV, MEWTWO, shouldSeekPayload, selectPayloads,
  withNewMoonCompressorPayload
};
