'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Return an opt-in SimpleTacticsAi AttachToolTactic subclass that gives
 * Stealthy Hood a priority on a Benched Shadow Rider under a recognizable
 * opposing Ability-lock threat. Standard tactic remains the fallback.
 *
 * Intended to pair with hood-aware-arven-resolver.cjs. Does not account for
 * all Tool locks, future gust, Faba, recovery or opportunity cost.
 *
 * @returns {Function} Compatible tactic constructor for options.tactics.
 */
function hoodAwareAttachToolTacticClass() {
  /** @param {string} modulePath */
  const mod = modulePath => require(path.join(output, modulePath));
  const { AttachToolTactic } = mod('simple-bot/simple-tactics/attach-tool-tactic');
  const { PlayCardAction, PlayerType, SlotType } =
    mod('game/store/actions/play-card-action');

  class HoodAwareAttachToolTactic extends AttachToolTactic {
    /** @param {object} state @param {object} player */
    useTactic(state, player) {
      const hoodIndex = player.hand.cards.findIndex(c => c.name === 'Stealthy Hood');
      const opponent = state.players.find(p => p.id !== player.id);
      if (hoodIndex !== -1 && opponent && !player.cannotPlayToolCards) {
        const thorns = opponent.active.getPokemonCard()?.name === 'Iron Thorns ex';
        const garbodor = opponent.bench.some(slot =>
          slot.getPokemonCard()?.name === 'Garbodor' && slot.tools.length > 0
        );
        if (thorns || garbodor) {
          const candidates = [];
          player.bench.forEach((slot, index) => {
            const pokemon = slot.getPokemonCard();
            if (!pokemon || slot.tools.length > 0) return;
            if (pokemon.name === 'Shadow Rider Calyrex VMAX') {
              candidates.push({index,priority:2});
            } else if (pokemon.name === 'Shadow Rider Calyrex V') {
              candidates.push({index,priority:1});
            }
          });
          candidates.sort((a,b)=>b.priority-a.priority || a.index-b.index);
          if (candidates.length > 0) {
            return new PlayCardAction(player.id, hoodIndex, {
              player:PlayerType.BOTTOM_PLAYER,
              slot:SlotType.BENCH,
              index:candidates[0].index
            });
          }
        }
      }
      return super.useTactic(state,player);
    }
  }

  return HoodAwareAttachToolTactic;
}

module.exports = { hoodAwareAttachToolTacticClass };
