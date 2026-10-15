'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
let installed = null;

/**
 * Restore Megaton Blower's printed simultaneous opposing Tool/Special Energy
 * removal without editing the pinned submodule. The pinned implementation
 * looks for attached Tools in PokemonCardList.cards, but they are stored in
 * PokemonCardList.tools and are therefore silently left attached.
 *
 * @returns {() => void} Restore the exact pinned prototype method.
 */
function installMegatonBlowerHook() {
  if (installed) return () => {};
  const { MegatonBlower } = require(path.join(output,
    'sets/10-scarlet-and-violet/set-surging-sparks/megaton-blower'));
  const { TrainerEffect } = require(path.join(output, 'game/store/effects/play-card-effects'));
  const { StateUtils } = require(path.join(output, 'game/store/state-utils'));
  const { SuperType, EnergyType } = require(path.join(output, 'game/store/card/card-types'));
  const { MOVE_CARDS, TRAINER_TARGET_BLOCKED } = require(path.join(
    output, 'game/store/prefabs/prefabs'
  ));
  const previous = MegatonBlower.prototype.reduceEffect;

  function patchedReduceEffect(store, state, effect) {
    if (!(effect instanceof TrainerEffect) || effect.trainerCard !== this) {
      return previous.call(this, store, state, effect);
    }
    effect.preventDefault = true;
    const player = effect.player;
    const opponent = StateUtils.getOpponent(state, player);

    for (const target of [opponent.active, ...opponent.bench]) {
      if (!target.getPokemonCard()) continue;
      if (TRAINER_TARGET_BLOCKED(store, state, player, this, target)) continue;

      const special = target.cards.filter(c =>
        c.superType === SuperType.ENERGY && c.energyType === EnergyType.SPECIAL
      );
      const tools = target.tools.slice();
      if (special.length > 0 || tools.length > 0) {
        state = MOVE_CARDS(store, state, target, opponent.discard, {
          cards: [...special, ...tools],
          sourceCard: this
        });
      }
    }

    const stadium = StateUtils.getStadiumCard(state);
    if (stadium) {
      const stadiumList = StateUtils.findCardList(state, stadium);
      const owner = StateUtils.findOwner(state, stadiumList);
      state = MOVE_CARDS(store, state, stadiumList, owner.discard, {
        cards: [stadium],
        sourceCard: this
      });
    }

    state = MOVE_CARDS(store, state, player.supporter, player.discard, {
      cards: [this],
      sourceCard: this
    });
    return state;
  }

  MegatonBlower.prototype.reduceEffect = patchedReduceEffect;
  installed = { previous, patched: patchedReduceEffect };

  return function restoreMegatonBlowerHook() {
    if (!installed || MegatonBlower.prototype.reduceEffect !== installed.patched) return;
    MegatonBlower.prototype.reduceEffect = installed.previous;
    installed = null;
  };
}

module.exports = { installMegatonBlowerHook };
