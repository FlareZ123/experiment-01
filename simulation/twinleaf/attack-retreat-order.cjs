'use strict';

/**
 * Opt-in research policy sensitivity: ask the pinned SimpleTacticsAi whether
 * an AttackTactic is attractive before it considers RetreatTactic.
 * Preserve all other tactic positions and original option ownership.
 * This does not change retreat, attack or card mechanics.
 *
 * @param {object} options Pinned SimpleBotOptions.
 * @param {{AttackTactic:Function,RetreatTactic:Function}} types Pinned classes.
 * @returns {object} A fresh options object with reordered tactics.
 */
function withAttackBeforeRetreat(options, types) {
  const list = options.tactics;
  const attackIndex = list.indexOf(types.AttackTactic);
  const retreatIndex = list.indexOf(types.RetreatTactic);
  if (attackIndex < 0 || retreatIndex < 0 || attackIndex === retreatIndex) {
    throw new Error('Pinned Attack/Retreat tactic extension points missing.');
  }
  const tactics = [...list];
  tactics.splice(attackIndex, 1);
  const newRetreatIndex = tactics.indexOf(types.RetreatTactic);
  tactics.splice(newRetreatIndex, 0, types.AttackTactic);
  return {...options, tactics};
}

module.exports = {withAttackBeforeRetreat};
