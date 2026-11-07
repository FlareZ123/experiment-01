'use strict';

const path = require('node:path');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const engine = modulePath => require(path.join(output, modulePath));
const tacticAudit = [];

function resetCopycatBurrowPolicyAudit() { tacticAudit.length = 0; }
function getCopycatBurrowPolicyAudit() { return tacticAudit.map(row=>({...row})); }

/**
 * Public-state condition for copying the opponent's immediately preceding
 * Bunnelby Burrow. The pass-history correction is installed separately by
 * headless.cjs when this policy is enabled.
 *
 * @param {object} state
 * @param {object} player
 * @returns {boolean}
 */
function isCopycatBurrowSituation(state, player) {
  const active = player.active.getPokemonCard();
  const opponent = state.players.find(p => p.id !== player.id);
  const last = opponent && state.playerLastAttack?.[opponent.id];
  return active?.fullName === 'Mimikyu GRI' &&
    last?.sourceCard?.fullName === 'Bunnelby PRC' &&
    last?.attack?.name === 'Burrow' &&
    last.attack.gxAttack !== true;
}

/** @returns {Function} Research-only SimpleTactic subclass. */
function makeCopycatBurrowTactic() {
  const {SimpleTactic} = engine('simple-bot/simple-tactics/simple-tactics');
  const {AttackAction} = engine('game/store/actions/game-actions');

  return class CopycatBurrowTactic extends SimpleTactic {
    /** @param {object} state @param {object} player */
    useTactic(state, player) {
      const opponent = state.players.find(p=>p.id!==player.id);
      const last = opponent && state.playerLastAttack?.[opponent.id];
      const active = player.active.getPokemonCard();
      const eligible = isCopycatBurrowSituation(state, player);
      tacticAudit.push({
        turn:state.turn,playerId:player.id,activeFullName:active?.fullName??null,
        opponentId:opponent?.id??null,lastSource:last?.sourceCard?.fullName??null,
        lastAttack:last?.attack?.name??null,lastGx:last?.attack?.gxAttack??null,
        eligible
      });
      if (!eligible) return undefined;
      return new AttackAction(player.id, 'Copycat');
    }
  };
}

/**
 * Insert Copycat before the upstream attack tactic, preserving all other
 * tactic ordering. Reapplying is a no-op.
 *
 * @param {object} options Pinned SimpleBotOptions.
 * @returns {object} New configured options or the unchanged configured object.
 */
function withCopycatBurrowPolicy(options) {
  const tactics = options.tactics;
  if (!Array.isArray(tactics)) {
    throw new Error('Pinned tactic array required');
  }
  if (tactics.some(t => t.name === 'CopycatBurrowTactic')) return options;
  const attackIndex = tactics.findIndex(t => t.name === 'AttackTactic');
  if (attackIndex < 0) throw new Error('Pinned AttackTactic unavailable');
  return {
    ...options,
    tactics: [...tactics.slice(0, attackIndex), makeCopycatBurrowTactic(),
      ...tactics.slice(attackIndex)]
  };
}

module.exports = {
  isCopycatBurrowSituation,
  makeCopycatBurrowTactic,
  resetCopycatBurrowPolicyAudit,
  getCopycatBurrowPolicyAudit,
  withCopycatBurrowPolicy
};
