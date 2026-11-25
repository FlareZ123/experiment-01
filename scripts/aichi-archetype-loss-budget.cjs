'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {parseField} = require('./aichi-comparison-campaign.cjs');

const FIELD_RANKS = 32;
const TARGET = 0.995;

/**
 * Exact necessary subset-averaged all-game win floors for the equal-rank target.
 * p_i is P(candidate wins a played game against rank i). A loss, draw,
 * timeout, invalid-action abort, or other non-win terminal outcome counts as
 * a non-win (zero wins) in the all-game denominator.
 *
 * @param {Array<{rank:number, archetype:string}>} field Prevalidated Aichi ranks.
 * @returns {{target:number,outcomeDefinition:string,totalNonWinBudget:number,totalLossBudget:number,rankCount:number,archetypeCount:number,archetypes:object[]}}
 */
function fieldArchetypeFloors(field) {
  if (!Array.isArray(field) || field.length !== FIELD_RANKS ||
      new Set(field.map(row => row?.rank)).size !== FIELD_RANKS ||
      field.some(row => !Number.isInteger(row?.rank) ||
        row.rank < 1 || row.rank > FIELD_RANKS ||
        typeof row.archetype !== 'string' || !row.archetype.trim())) {
    throw new Error('Expected all 32 unique Aichi ranks with nonempty archetype names.');
  }
  const grouped = new Map();
  for (const row of field) {
    if (!grouped.has(row.archetype)) grouped.set(row.archetype, []);
    grouped.get(row.archetype).push(row.rank);
  }
  const totalNonWinBudget = FIELD_RANKS * (1 - TARGET);
  const archetypes = [...grouped].map(([archetype, ranks]) => {
    const count = ranks.length;
    return {
      archetype, count, ranks: [...ranks].sort((a, b) => a - b),
      necessaryAverageWin: 1 - totalNonWinBudget / count
    };
  }).sort((a, b) => b.count - a.count ||
    a.archetype.localeCompare(b.archetype));
  return {
    target: TARGET,
    outcomeDefinition: 'all-game win probability; loss, draw, timeout, invalid-action abort, and other non-win terminal outcomes count as non-wins',
    totalNonWinBudget,
    // Backward-compatible alias. This is a non-win budget, not losses only.
    totalLossBudget: totalNonWinBudget,
    rankCount: FIELD_RANKS,
    archetypeCount: archetypes.length, archetypes
  };
}

if (require.main === module) {
  const file = path.resolve(__dirname, '../results/aichi-2026/field.csv');
  const field = parseField(fs.readFileSync(file, 'utf8'));
  process.stdout.write(JSON.stringify(fieldArchetypeFloors(field), null, 2) + '\n');
}

module.exports = {FIELD_RANKS, TARGET, fieldArchetypeFloors};
