'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
let installed = null;

/**
 * Correct Herdier SUM 104's printed Treasure Hunt: an Item (maximum one), and
 * no activation under a lock affecting a Stage-1 Colorless Pokémon in hand or
 * in play. This is a reversible hook for pinned Twinleaf, not a vendor edit.
 * @returns {() => void}
 */
function installHerdierTreasureHuntHook() {
  if (installed) return installed.restore;
  const { Herdier } = require(path.join(output,
    'sets/08-sun-and-moon/set-sun-and-moon/herdier'));
  const { EvolveEffect } = require(path.join(output,
    'game/store/effects/game-effects'));
  const { ChooseCardsPrompt, GameMessage, TrainerCard } =
    require(path.join(output, 'game'));
  const { SuperType, TrainerType } = require(path.join(output,
    'game/store/card/card-types'));
  const { IS_ABILITY_BLOCKED, MOVE_CARDS } = require(path.join(output,
    'game/store/prefabs/prefabs'));

  const original = Herdier.prototype.reduceEffect;
  function guardedReduceEffect(store, state, effect) {
    if (!(effect instanceof EvolveEffect && effect.pokemonCard === this)) {
      return original.call(this, store, state, effect);
    }
    const player = effect.player;
    if (IS_ABILITY_BLOCKED(store, state, player, this, this.powers[0])) {
      return state;
    }
    const hasItem = player.discard.cards.some(card =>
      card instanceof TrainerCard && card.trainerType === TrainerType.ITEM);
    if (!hasItem) return state;
    return store.prompt(state, new ChooseCardsPrompt(
      player, GameMessage.CHOOSE_CARD_TO_HAND,
      player.discard,
      { superType: SuperType.TRAINER, trainerType: TrainerType.ITEM },
      { min: 1, max: 1, allowCancel: true }
    ), selected => {
      const chosen = selected || [];
      if (chosen.length > 1) {
        throw new Error('Herdier Treasure Hunt permits at most one Item');
      }
      if (chosen.length === 1) {
        MOVE_CARDS(store, state, player.discard, player.hand,
          { cards: chosen, sourceCard: this });
      }
    });
  }

  Herdier.prototype.reduceEffect = guardedReduceEffect;
  const restore = function restoreHerdierTreasureHuntHook() {
    if (!installed || installed.restore !== restore) return;
    if (Herdier.prototype.reduceEffect === guardedReduceEffect) {
      Herdier.prototype.reduceEffect = original;
    }
    installed = null;
  };
  installed = { restore };
  return restore;
}

module.exports = { installHerdierTreasureHuntHook };
