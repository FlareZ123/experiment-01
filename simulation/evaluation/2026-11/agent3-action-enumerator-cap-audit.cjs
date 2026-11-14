'use strict';

const assert = require('node:assert/strict');

const SCHEMA = 'agent3-known-action-enumerator-cap-audit-v1';
const MAX_CANDIDATES_PER_TYPE = 8;

function auditKnownActionEnumeratorCaps({ state, actorSeat, native } = {}) {
  assert.ok(state && Array.isArray(state.players) && state.players.length === 2,
    'a two-player native state is required');
  assert.ok(actorSeat === 0 || actorSeat === 1, 'actorSeat must be 0 or 1');
  assert.equal(state.activePlayer, actorSeat,
    'cap audit must be run for the active player');
  assert.ok(native && typeof native.PokemonCard === 'function' &&
    typeof native.TrainerCard === 'function' && typeof native.EnergyCard === 'function' &&
    native.PlayerType && native.Stage && native.TrainerType,
  'pinned Twinleaf card classes and enums are required');

  const player = state.players[actorSeat];
  assert.ok(player && Array.isArray(player.hand?.cards) &&
    Array.isArray(player.bench) && Array.isArray(player.discard?.cards),
  'active player zones are incomplete');
  assert.equal(typeof player.forEachPokemon, 'function',
    'native Player.forEachPokemon is required');

  const pokemon = [];
  player.forEachPokemon(native.PlayerType.BOTTOM_PLAYER, (cardList, card, target) => {
    pokemon.push({ cardList, card, target });
  });

  const hand = player.hand.cards;
  const isTrainer = (card, trainerType) => card instanceof native.TrainerCard &&
    card.trainerType === trainerType;
  const isPokemon = card => card instanceof native.PokemonCard;

  const evolve = pokemon.reduce((sum, entry) => {
    if (entry.cardList.pokemonPlayedTurn === state.turn) return sum;
    return sum + hand.filter(card => isPokemon(card) &&
      card.evolvesFrom === entry.card.name).length;
  }, 0);

  const hasEmptyBench = player.bench.some(slot => slot.cards.length === 0);
  const playBasic = hasEmptyBench
    ? hand.filter(card => isPokemon(card) && card.stage === native.Stage.BASIC).length
    : 0;

  const distinctEnergyNames = new Set(hand.filter(card => card instanceof native.EnergyCard)
    .map(card => card.fullName));
  const attachEnergy = player.energyPlayedTurn >= state.turn
    ? 0 : distinctEnergyNames.size * pokemon.length;

  const untooledPokemon = pokemon.filter(entry => entry.cardList.tools.length === 0).length;
  const toolCards = hand.filter(card => isTrainer(card, native.TrainerType.TOOL)).length;
  const attachTool = toolCards * untooledPokemon;

  const discardAbilities = player.discard.cards.reduce((sum, card) => {
    if (!isPokemon(card)) return sum;
    return sum + (card.powers ?? []).filter(power => power.useFromDiscard).length;
  }, 0);

  const playItems = hand.filter(card => isTrainer(card, native.TrainerType.ITEM)).length;
  const playSupporters = player.supporter?.cards?.length > 0 ||
    player.supporterTurn >= state.turn
    ? 0 : hand.filter(card => isTrainer(card, native.TrainerType.SUPPORTER)).length;

  const inPlayAbilities = pokemon.reduce((sum, entry) => sum +
    (entry.card.powers ?? []).filter(power => power.useWhenInPlay).length, 0);

  const families = {
    evolve,
    playBasic,
    attachEnergy,
    attachTool,
    discardAbilities,
    playItems,
    playSupporters,
    inPlayAbilities
  };
  const cappedFamilies = Object.entries(families)
    .filter(([, potentialCount]) => potentialCount > MAX_CANDIDATES_PER_TYPE)
    .map(([family, potentialCount]) => ({
      family,
      potentialCount,
      emittedMaximum: MAX_CANDIDATES_PER_TYPE,
      minimumOmitted: potentialCount - MAX_CANDIDATES_PER_TYPE
    }));

  return Object.freeze({
    schema: SCHEMA,
    capPerFamily: MAX_CANDIDATES_PER_TYPE,
    knownUpstreamCapsClear: cappedFamilies.length === 0,
    cappedFamilies: Object.freeze(cappedFamilies),
    potentialCounts: Object.freeze({ ...families }),
    scope: 'Detects only the eight explicit MAX_CANDIDATES_PER_TYPE truncation sites in the pinned ActionEnumerator; a clear result is not proof that the full native action space is complete.'
  });
}

function assertKnownActionEnumeratorCapsClear(audit) {
  assert.ok(audit && audit.schema === SCHEMA, 'a known-cap audit is required');
  if (!audit.knownUpstreamCapsClear) {
    const error = new Error('Pinned ActionEnumerator silently truncates one or more action families');
    error.code = 'NATIVE_ACTION_ENUMERATOR_UPSTREAM_CAP';
    error.cappedFamilies = audit.cappedFamilies;
    throw error;
  }
  return audit;
}

module.exports = {
  SCHEMA,
  MAX_CANDIDATES_PER_TYPE,
  auditKnownActionEnumeratorCaps,
  assertKnownActionEnumeratorCapsClear
};
