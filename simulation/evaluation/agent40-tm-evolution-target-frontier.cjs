'use strict';

const assert = require('node:assert/strict');

/**
 * Enumerate reachable evolution stages after repeated Technical Machine:
 * Evolution attacks. Each target starts as a Basic already on the Bench.
 * One attack can evolve at most two distinct Benched Pokémon by one Stage
 * each, assuming their next Stage printings are searchable in the deck.
 *
 * @param {{label:string, stages:1|2}[]} targets
 * @param {number} attacks
 * @param {number} maximumTargets
 * @returns {{stages:number[], actions:string[][]}[]}
 */
function reachableTmStates(targets, attacks = 2, maximumTargets = 2) {
  assert(targets.every(target => target.label && [1, 2].includes(target.stages)));
  const starting = { stages: targets.map(() => 0), actions: [] };
  let frontier = new Map([[starting.stages.join(','), starting]]);

  for (let attack = 0; attack < attacks; attack += 1) {
    const next = new Map();
    for (const state of frontier.values()) {
      const eligible = targets.flatMap((target, i) =>
        state.stages[i] < target.stages ? [i] : []);
      const subsets = [[]];
      for (const index of eligible) {
        const additions = subsets
          .filter(indices => indices.length < maximumTargets)
          .map(indices => [...indices, index]);
        subsets.push(...additions);
      }
      for (const indices of subsets) {
        const updated = state.stages.slice();
        for (const i of indices) updated[i] += 1;
        const key = updated.join(',');
        if (next.has(key)) continue;
        next.set(key, {
          stages: updated,
          actions: [...state.actions, indices.map(i => targets[i].label)]
        });
      }
    }
    frontier = next;
  }
  return [...frontier.values()];
}

/**
 * @param {{label:string,stages:1|2}[]} targets
 * @returns {string[][] | null}
 */
function completeTmSchedule(targets) {
  const fullStages = targets.map(target => target.stages);
  const result = reachableTmStates(targets).find(state =>
    state.stages.every((stage, i) => stage === fullStages[i]));
  return result?.actions ?? null;
}

module.exports = { reachableTmStates, completeTmSchedule };
