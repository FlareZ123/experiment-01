'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(output, name));

const {SimpleTactic} = load('simple-bot/simple-tactics/simple-tactics');
const {PlayCardAction, PlayerType, SlotType} =
  load('game/store/actions/play-card-action');
const {StateUtils} = load('game/store/state-utils');
const {TrainerType} = load('game/store/card/card-types');

/**
 * An adversarial-policy proof for a narrowly specified known Raichu state.
 * Intentionally never used as an authoritative full-game competitive bot.
 *
 * The action becomes relevant when a Temple-locked, Unit-Energy-powered
 * Alolan Raichu has a Secret Box, three obsolete VIP Pass to discard, and
 * an unspent Stadium in the deck. The generic bot otherwise ignores this
 * multi-step connector despite a valid Item activation.
 */
class RaichuTempleResponseTactic extends SimpleTactic {
  /** @param {any} state @param {any} player */
  useTactic(state, player) {
    const stadium = StateUtils.getStadiumCard(state);
    if (stadium?.fullName !== 'Temple of Sinnoh ASR' ||
        player.active.getPokemonCard()?.fullName !== 'Alolan Raichu UNM' ||
        state.turn <= 2 || player.stadiumPlayedTurn >= state.turn) return undefined;

    // This experimental policy only covers the published rank-17
    // Unit Energy -> Electro Rain -> PokéStop line.
    if (!player.active.energies.cards.some(card =>
      card.fullName === 'Unit Energy LPM UPR')) return undefined;
    if (!player.deck.cards.some(card =>
      card.fullName === 'PokéStop PGO')) return undefined;

    // Avoid burning the only ACE SPEC when an immediate Stadium play exists.
    if (player.hand.cards.some(card => card.trainerType === TrainerType.STADIUM &&
      card.fullName !== stadium.fullName)) return undefined;
    if (player.hand.cards.filter(card =>
      card.fullName === 'Battle VIP Pass FST').length < 3) return undefined;

    const index = player.hand.cards.findIndex(card =>
      card.fullName === 'Secret Box TWM');
    if (index === -1) return undefined;

    return new PlayCardAction(player.id, index, {
      player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
    });
  }
}

module.exports = {RaichuTempleResponseTactic};
