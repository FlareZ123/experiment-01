'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const {hoodAttachTargets} =
  require('./hood-ability-lock-state.cjs');

/**
 * Return an opt-in SimpleTacticsAi AttachToolTactic subclass that gives
 * Stealthy Hood a priority on a Benched Shadow Rider under Active Iron Thorns
 * Initialization or an equipped Garbotoxin source in either opponent zone.
 * It prefers a Benched VMAX, then an untooled Active VMAX (unless opponent
 * Active Tool Jammer suppresses it), then a Benched V. It fails closed under
 * Jamming Tower or Path to the Peak. Standard tactic remains the fallback.
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
        const target=hoodAttachTargets(player,opponent,state)[0];
        if(target) {
          return new PlayCardAction(player.id,hoodIndex,{
            player:PlayerType.BOTTOM_PLAYER,
            slot:target.zone==='active'?SlotType.ACTIVE:SlotType.BENCH,
            index:target.index
          });
        }
      }
      return super.useTactic(state,player);
    }
  }

  return HoodAwareAttachToolTactic;
}

module.exports = { hoodAwareAttachToolTacticClass };
