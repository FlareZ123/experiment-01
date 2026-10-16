'use strict';

const path = require('node:path');

/**
 * Research-only correction for pinned Twinleaf's PlaySupporterTactic.
 * In the pinned implementation, merely proposing a PlayCardAction sets
 * player.supporterTurn = state.turn before SimpleTacticsAi validates it.
 * This causes supporters such as Guzma & Hala to reject the proposed action.
 * The real reducer remains responsible for recording an actually played
 * Supporter; a speculative decision must leave that turn marker unchanged.
 *
 * @returns {() => void} Restore the original upstream tactic method.
 */
function installSupporterDecisionHook() {
  const engineModule = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output/simple-bot/simple-tactics/play-supporter-tactic');
  const { PlaySupporterTactic } = require(engineModule);
  const original = PlaySupporterTactic.prototype.useTactic;
  PlaySupporterTactic.prototype.useTactic = function guardedSupporterDecision(state, player) {
    const before = player.supporterTurn;
    try {
      return original.call(this, state, player);
    } finally {
      player.supporterTurn = before;
    }
  };
  return function restore() {
    PlaySupporterTactic.prototype.useTactic = original;
  };
}

module.exports = { installSupporterDecisionHook };
