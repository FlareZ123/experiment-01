'use strict';

const {
  buildPublicEnergyMap
} = require('../agent36/snap-trap-energy-choice-v2.cjs');

const VERSION = 'agent30-snap-trap-public-temple-energy-options-v1';
const TEMPLE = 'Temple of Sinnoh ASR';

/**
 * Derive attack-Energy scoring options strictly from public physical zones.
 * Temple of Sinnoh makes each Special Energy provide one Colorless and have
 * no additional effects. All other board states abstain: an absent or
 * unrecognized Stadium does not prove that other special-Energy modifiers
 * are inactive. This is a conservative scoped adapter, not a paper rules
 * engine. Never inspect concealed zones or call Store.reduceEffect here.
 *
 * @param {object} state Actual live native State.
 * @param {object} prompt Verified exact owner ChooseCardsPrompt.
 * @param {object} attackerActive Same physical public attacking Active.
 * @param {object} types Pinned public CardType and EnergyType enums.
 * @returns {object} Options consumable by chooseSnapTrapEnergyV2.
 */
function getSnapTrapPublicTempleEnergyOptions(state, prompt, attackerActive, types) {
  if (!Array.isArray(state?.players) ||
      !state.players.includes(prompt?.player) ||
      prompt?.cards !== attackerActive ||
      !Array.isArray(attackerActive?.cards) ||
      !Array.isArray(attackerActive?.energies?.cards)) {
    return {specialEnergyBlocked: null};
  }

  // The pinned engine suppresses all Stadium effects during this public
  // player-wide countdown. Absence of the field is also unknown.
  if (state.players.some(player =>
    !Number.isSafeInteger(player?.stadiumAndToolHaveNoEffectTurnsRemaining) ||
    player.stadiumAndToolHaveNoEffectTurnsRemaining !== 0)) {
    return {specialEnergyBlocked: null};
  }

  const attackingPlayer = state.players.find(player =>
    player?.active === attackerActive
  );
  if (!attackingPlayer) return {specialEnergyBlocked: null};

  // Lunatone OBF's New Moon prevents Stadium effects on its owner's
  // Pokémon while Solrock is in play. Even when the Ability may be
  // disabled by another effect, conservatively abstain on this pairing.
  const slots = [attackingPlayer.active, ...(attackingPlayer.bench ?? [])];
  const pokemon = slots.map(slot => slot?.getPokemonCard?.()).filter(Boolean);
  if (pokemon.some(card => card.fullName === 'Lunatone OBF') &&
      pokemon.some(card => card.name === 'Solrock')) {
    return {specialEnergyBlocked: null};
  }

  const stadium = state.players.flatMap(player =>
    Array.isArray(player?.stadium?.cards) ? player.stadium.cards : []
  );
  if (stadium.length !== 1 || stadium[0]?.fullName !== TEMPLE) {
    return {specialEnergyBlocked: null};
  }

  const publicMap = buildPublicEnergyMap(
    attackerActive, types, {specialEnergyBlocked: true}
  );
  const energyMap = publicMap.energyMap.map(entry => ({
    card: entry.card,
    provides: entry.card?.energyType === types.EnergyType.SPECIAL
      ? [types.CardType.COLORLESS]
      : [...entry.provides]
  }));
  return {
    specialEnergyBlocked: true,
    energyMap
  };
}

module.exports = {
  VERSION,
  TEMPLE,
  getSnapTrapPublicTempleEnergyOptions
};
