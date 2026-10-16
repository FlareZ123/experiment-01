'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Experimental opt-in candidate generator for Abilities granted by attached
 * Pokémon Tools. Pinned UseAbilityTactic only visits Pokémon's printed powers.
 * Actual engine legality and usefulness are deferred to evaluateAction.
 * No knowledge of Prize contents or hidden deck order is consulted here.
 *
 * @returns {Function} A SimpleTactic-compatible class.
 */
function attachedToolPowerTacticClass() {
  const mod = moduleName => require(path.join(output, moduleName));
  const {SimpleTactic} = mod('simple-bot/simple-tactics/simple-tactics');
  const {UseAbilityAction} = mod('game/store/actions/game-actions');
  const {PlayerType} = mod('game/store/actions/play-card-action');

  class AttachedToolPowerTactic extends SimpleTactic {
    /** @param {any} state @param {any} player */
    useTactic(state, player) {
      let bestScore = this.getStateScore(state, player.id);
      let bestAction;
      const passTurnScore = this.options.scores.tactics.passTurn;
      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (slot, pokemon, target) => {
        for (const tool of slot.tools) {
          for (const power of tool.powers) {
            if (!power.useWhenInPlay) continue;
            const action = new UseAbilityAction(player.id, power.name, target);
            const score = this.evaluateAction(state, player.id, action, passTurnScore);
            if (score !== undefined && score > bestScore) {
              bestScore = score;
              bestAction = action;
            }
          }
        }
      });
      return bestAction;
    }
  }
  return AttachedToolPowerTactic;
}

/**
 * Add a versioned one-tactic candidate route to the pinned SharedTactics list
 * for a synchronous experiment; always restore the shared list afterwards.
 * @template T
 * @param {()=>T} run
 * @returns {T}
 */
function withAttachedToolPowerTactic(run) {
  const definitions = require(path.join(output,'simple-bot/simple-bot-definitions'));
  const tactics = definitions.allSimpleTactics;
  const position = tactics.findIndex(t => t.name === 'UseAbilityTactic');
  if (position < 0) throw new Error('Pinned UseAbilityTactic extension point unavailable');
  const Custom = attachedToolPowerTacticClass();
  tactics.splice(position, 0, Custom);
  try {
    return run();
  } finally {
    const index = tactics.indexOf(Custom);
    if (index < 0) throw new Error('Experimental Tool Power tactic was displaced');
    tactics.splice(index, 1);
  }
}

module.exports = {attachedToolPowerTacticClass,withAttachedToolPowerTactic};
