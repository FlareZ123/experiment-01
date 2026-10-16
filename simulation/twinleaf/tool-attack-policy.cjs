'use strict';

const path = require('node:path');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} relativePath */
const load = relativePath => require(path.join(output, relativePath));

/**
 * Add consideration of Tool-provided attacks to the terminal attack choice.
 * Existing earlier setup tactics keep their priority. The replacement
 * attack step compares all printed attacks and all Tool-supplied attacks
 * using the upstream SimpleTactic action evaluator and state scores.
 *
 * This is opt-in research code and does not edit the upstream submodule.
 * @returns {Function} SimpleTactic subclass
 */
function makeToolAwareAttackTactic() {
  const { SimpleTactic } = load('simple-bot/simple-tactics/simple-tactics');
  const { AttackAction } = load('game/store/actions/game-actions');
  const { CheckPokemonAttacksEffect } =
    load('game/store/effects/check-effects');
  const { SpecialCondition } = load('game/store/card/card-types');

  return class ToolAwareAttackTactic extends SimpleTactic {
    /** @param {object} state @param {object} player @returns {object|undefined} */
    useTactic(state, player) {
      const active = player.active.getPokemonCard();
      if (!active || player.active.specialConditions.includes(SpecialCondition.ASLEEP) ||
          player.active.specialConditions.includes(SpecialCondition.PARALYZED)) return;

      const supplied = new CheckPokemonAttacksEffect(player).attacks;
      if (!supplied.length) return;

      const candidates = [...active.attacks, ...supplied];
      const visited = new Set();
      let bestScore = this.getStateScore(state, player.id) -
        this.options.scores.tactics.attackBonus;
      let bestAction;
      for (const attack of candidates) {
        if (visited.has(attack.name)) continue;
        visited.add(attack.name);
        const action = new AttackAction(player.id, attack.name);
        const score = this.evaluateAction(state, player.id, action);
        if (score !== undefined && score > bestScore) {
          bestScore = score;
          bestAction = action;
        }
      }
      return bestAction;
    }
  };
}

/**
 * Insert before default AttackTactic. All other upstream tactics and resolver
 * precedence remain unchanged. Reapplying to a configured policy is rejected,
 * because duplicate speculative attack search would waste runtime.
 *
 * @param {object} options Existing SimpleBotOptions.
 * @returns {object} A cloned opt-in SimpleBotOptions.
 */
function withToolAttackAwareness(options) {
  if (!Array.isArray(options.tactics)) throw new Error('Tactics list missing');
  if (options.tactics.some(t => t.name === 'ToolAwareAttackTactic')) {
    throw new Error('Tool-aware tactic already installed');
  }
  const index = options.tactics.findIndex(t => t.name === 'AttackTactic');
  if (index < 0) throw new Error('Default AttackTactic missing');
  return {
    ...options,
    tactics: [
      ...options.tactics.slice(0, index),
      makeToolAwareAttackTactic(),
      ...options.tactics.slice(index)
    ]
  };
}

module.exports = { makeToolAwareAttackTactic, withToolAttackAwareness };
