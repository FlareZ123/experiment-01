'use strict';

const assert = require('node:assert/strict');

const EXPECTED_ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SCHEMA = 'agent3-known-cap-free-action-enumerator-v1';

function requireNative(native) {
  assert.ok(native && typeof native.ActionEnumerator === 'function',
    'pinned Twinleaf ActionEnumerator is required');
  assert.ok(native.cardActions && typeof native.cardActions.PlayCardAction === 'function',
    'pinned PlayCardAction constructor is required');
  assert.ok(native.gameActions && typeof native.gameActions.UseAbilityAction === 'function',
    'pinned UseAbilityAction constructor is required');
  assert.ok(typeof native.PokemonCard === 'function' &&
    typeof native.TrainerCard === 'function' && typeof native.EnergyCard === 'function',
  'pinned card constructors are required');
  assert.ok(native.PlayerType && native.PlayerType.BOTTOM_PLAYER !== undefined &&
    native.PlayerType.ANY !== undefined && native.SlotType &&
    native.SlotType.BOARD !== undefined && native.SlotType.DISCARD !== undefined &&
    native.Stage && native.Stage.BASIC !== undefined && native.TrainerType &&
    native.TrainerType.ITEM !== undefined && native.TrainerType.TOOL !== undefined &&
    native.TrainerType.SUPPORTER !== undefined,
  'pinned action enums are incomplete');
}

function createKnownCapFreeActionEnumerator({ native, enginePin } = {}) {
  assert.equal(enginePin, EXPECTED_ENGINE_PIN,
    'uncapped enumerator adapter is reviewed only for the pinned Twinleaf revision');
  requireNative(native);

  const enumerator = new native.ActionEnumerator();
  const requiredMethods = [
    'enumerate', 'evolveActions', 'playBasicActions', 'attachEnergyActions',
    'attachToolActions', 'discardAbilityActions', 'playItemActions',
    'playStadiumActions', 'playSupporterActions', 'abilityActions',
    'useStadiumActions', 'retreatActions', 'attackActions'
  ];
  for (const name of requiredMethods) {
    assert.equal(typeof enumerator[name], 'function',
      'pinned ActionEnumerator method changed: ' + name);
  }

  const PlayCardAction = native.cardActions.PlayCardAction;
  const UseAbilityAction = native.gameActions.UseAbilityAction;
  const { PokemonCard, TrainerCard, EnergyCard, PlayerType, SlotType, Stage, TrainerType } = native;
  const originalBasicActions = enumerator.playBasicActions.bind(enumerator);

  enumerator.evolveActions = (state, player) => {
    const actions = [];
    const pokemons = [];
    player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card, target) => {
      if (cardList.pokemonPlayedTurn !== state.turn) pokemons.push({ card, target });
    });
    for (const pokemon of pokemons) {
      for (let i = 0; i < player.hand.cards.length; i++) {
        const card = player.hand.cards[i];
        if (card instanceof PokemonCard && card.evolvesFrom === pokemon.card.name) {
          actions.push(new PlayCardAction(player.id, i, pokemon.target));
        }
      }
    }
    return actions;
  };

  enumerator.playBasicActions = (state, player) => {
    const emptySlots = player.bench.filter(bench => bench.cards.length === 0);
    if (emptySlots.length === 0) return [];
    const indexes = [];
    for (let i = 0; i < player.hand.cards.length; i++) {
      const card = player.hand.cards[i];
      if (card instanceof PokemonCard && card.stage === Stage.BASIC) indexes.push(i);
    }
    if (indexes.length <= 8) return originalBasicActions(state, player);
    const seed = originalBasicActions(state, player);
    assert.equal(seed.length, 8,
      'pinned Basic-play cap changed; refusing to infer the omitted target set');
    assert.ok(seed[0].target,
      'pinned Basic-play target projection changed; refusing to invent a target');
    const target = seed[0].target;
    return indexes.map(index => new PlayCardAction(player.id, index, target));
  };

  enumerator.attachEnergyActions = (state, player) => {
    if (player.energyPlayedTurn >= state.turn) return [];
    const energyIndexes = [];
    const seen = new Set();
    player.hand.cards.forEach((card, index) => {
      if (card instanceof EnergyCard && !seen.has(card.fullName)) {
        seen.add(card.fullName);
        energyIndexes.push(index);
      }
    });
    const actions = [];
    for (const index of energyIndexes) {
      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card, target) => {
        actions.push(new PlayCardAction(player.id, index, target));
      });
    }
    return actions;
  };

  enumerator.attachToolActions = (state, player) => {
    const actions = [];
    for (let i = 0; i < player.hand.cards.length; i++) {
      const card = player.hand.cards[i];
      if (!(card instanceof TrainerCard) || card.trainerType !== TrainerType.TOOL) continue;
      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, pokemon, target) => {
        if (cardList.tools.length === 0) actions.push(new PlayCardAction(player.id, i, target));
      });
    }
    return actions;
  };

  enumerator.discardAbilityActions = (state, player) => {
    const actions = [];
    player.discard.cards.forEach((card, index) => {
      if (!(card instanceof PokemonCard)) return;
      const target = { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.DISCARD, index };
      for (const power of card.powers) {
        if (power.useFromDiscard) actions.push(new UseAbilityAction(player.id, power.name, target));
      }
    });
    return actions;
  };

  enumerator.playItemActions = (state, player) => {
    const actions = [];
    const target = { player: PlayerType.ANY, slot: SlotType.BOARD, index: 0 };
    for (let i = 0; i < player.hand.cards.length; i++) {
      const card = player.hand.cards[i];
      if (card instanceof TrainerCard && card.trainerType === TrainerType.ITEM) {
        actions.push(new PlayCardAction(player.id, i, target));
      }
    }
    return actions;
  };

  enumerator.playSupporterActions = (state, player) => {
    if (player.supporter.cards.length > 0 || player.supporterTurn >= state.turn) return [];
    const actions = [];
    const target = { player: PlayerType.ANY, slot: SlotType.BOARD, index: 0 };
    for (let i = 0; i < player.hand.cards.length; i++) {
      const card = player.hand.cards[i];
      if (card instanceof TrainerCard && card.trainerType === TrainerType.SUPPORTER) {
        actions.push(new PlayCardAction(player.id, i, target));
      }
    }
    return actions;
  };

  enumerator.abilityActions = (state, player) => {
    const actions = [];
    player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card, target) => {
      for (const power of card.powers) {
        if (power.useWhenInPlay) actions.push(new UseAbilityAction(player.id, power.name, target));
      }
    });
    return actions;
  };

  Object.defineProperty(enumerator, '__agent3UncappedAdapter', {
    value: Object.freeze({ schema: SCHEMA, enginePin, removedPerFamilyCap: 8 }),
    writable: false,
    configurable: false,
    enumerable: false
  });
  return enumerator;
}

module.exports = { SCHEMA, EXPECTED_ENGINE_PIN, createKnownCapFreeActionEnumerator };
