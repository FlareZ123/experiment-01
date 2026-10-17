'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(output, name));

/**
 * Rank-4/17 Raichu source-policy experiment. When the singleton Telescopic
 * Sight is held, preserve it until an established Alolan Raichu can carry it.
 * All decisions use only public board state and the owner's hand.
 *
 * Other Tools retain the pinned bot's ordinary target-score selection.
 * This is a tactic counterfactual, not an assertion of optimal gameplay.
 * @returns {Function}
 */
function raichuSightAttachToolTacticClass() {
  const {AttachToolTactic} =
    load('simple-bot/simple-tactics/attach-tool-tactic');
  const {PlayCardAction, PlayerType, SlotType} =
    load('game/store/actions/play-card-action');
  const {TrainerCard} = load('game/store/card/trainer-card');
  const {TrainerType, CardTag} = load('game/store/card/card-types');
  const sightTargets = [CardTag.POKEMON_GX, CardTag.POKEMON_V,
    CardTag.POKEMON_VMAX, CardTag.POKEMON_VSTAR, CardTag.POKEMON_VUNION];

  return class RaichuSightAttachToolTactic extends AttachToolTactic {
    /** @param {object} state @param {object} player */
    useTactic(state, player) {
      const sightIndex = player.hand.cards.findIndex(card =>
        card.fullName === 'Telescopic Sight VIV');
      if (sightIndex < 0) return super.useTactic(state, player);
      if (player.cannotPlayToolCards) return;

      const raichus = [];
      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (list, card, target) => {
        if (card.fullName !== 'Alolan Raichu UNM' || list.tools.length) return;
        raichus.push({
          target,
          energyCount: list.energies.cards.length,
          active: target.slot === SlotType.ACTIVE
        });
      });
      const opponent = state.players.find(p => p.id !== player.id);
      const hasRelevantBench = opponent?.bench.some(list => {
        const pokemon = list.getPokemonCard();
        return pokemon && sightTargets.some(tag => pokemon.hasTag(tag));
      });
      raichus.sort((a, b) =>
        b.energyCount - a.energyCount ||
        Number(b.active) - Number(a.active) ||
        a.target.index - b.target.index);
      if (raichus.length && hasRelevantBench) {
        return new PlayCardAction(player.id, sightIndex, raichus[0].target);
      }

      // Keep Sight in hand. Playing a different Tool must remain possible
      // even when Sight appears earlier in the hand than that Tool.
      const otherIndex = player.hand.cards.findIndex(card =>
        card instanceof TrainerCard &&
        card.trainerType === TrainerType.TOOL &&
        card.fullName !== 'Telescopic Sight VIV');
      if (otherIndex < 0) return;
      const otherTool = player.hand.cards[otherIndex];
      const baseline = this.getStateScore(state, player.id);
      const targets = [];
      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (list, card, target) => {
        if (list.tools.length) return;
        list.tools.push(otherTool);
        let score;
        try {
          score = this.getStateScore(state, player.id);
        } finally {
          list.tools.pop();
        }
        if (score > baseline) targets.push({target, score});
      });
      targets.sort((a, b) => b.score - a.score);
      if (targets.length) {
        return new PlayCardAction(player.id, otherIndex, targets[0].target);
      }
    }
  };
}

/**
 * @param {object} options Current pinned SimpleTacticsAi options.
 * @returns {object} New options, without mutating shared tactic definitions.
 */
function withRaichuSightToolPolicy(options) {
  const index = options.tactics.findIndex(t => t.name === 'AttachToolTactic');
  if (index < 0) throw new Error('Pinned AttachToolTactic not found');
  const tactics = options.tactics.slice();
  tactics[index] = raichuSightAttachToolTacticClass();
  return {...options, tactics};
}

module.exports = {raichuSightAttachToolTacticClass, withRaichuSightToolPolicy};
