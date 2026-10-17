'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * Exhaustively select name-diverse Regidrago source opponent panels that
 * contain an already studied baseline rank.
 *
 * This measures exposure to distinct displayed card names only. It is not
 * a measure of battle-state coverage, effect relevance or win probability.
 *
 * @param {{decks:Array<{rank:number,archetype:string,cards:Array<{name:string,count:number,printing?:object}>}>}} manifest
 * @param {number} baselineRank
 * @returns {object}
 */
function regidragoPanels(manifest, baselineRank = 10) {
  const decks = manifest.decks.filter(d => d.archetype === 'Regidrago')
    .slice().sort((a, b) => a.rank - b.rank);
  const ranks = decks.map(d => d.rank);
  if (new Set(ranks).size !== ranks.length || decks.length === 0 || decks.length > 20) {
    throw new Error('Invalid distinct published Regidrago ranks');
  }
  const baselineIndex = ranks.indexOf(baselineRank);
  if (baselineIndex < 0) throw new Error('Baseline Regidrago rank missing');
  const counts = decks.map(d => {
    const map = new Map();
    let total = 0;
    for (const c of d.cards) {
      if (typeof c.name !== 'string' || !c.name ||
          !Number.isInteger(c.count) || c.count <= 0) {
        throw new Error('Invalid card row');
      }
      total += c.count;
      map.set(c.name, (map.get(c.name) || 0) + c.count);
    }
    if (total !== 60) throw new Error('Expected a 60-card source deck');
    return map;
  });
  const universe = [...new Set(counts.flatMap(m => [...m.keys()]))].sort();
  const frequency = new Map(universe.map(n => [
    n, counts.reduce((total, m) => total + Number(m.has(n)), 0)
  ]));
  const core = universe.filter(n => frequency.get(n) === decks.length);
  const coreSlots = core.reduce((sum, n) =>
    sum + Math.min(...counts.map(m => m.get(n))), 0);
  const best = new Map();
  for (let mask = 1; mask < 2 ** decks.length; mask++) {
    if (!(mask & (1 << baselineIndex))) continue;
    const selected = decks.filter((_, i) => mask & (1 << i));
    const selectedCounts = counts.filter((_, i) => mask & (1 << i));
    const names = new Set(selectedCounts.flatMap(m => [...m.keys()]));
    const covered = names.size;
    const singletonNames = [...names].filter(n => frequency.get(n) === 1).length;
    const ranksInPanel = selected.map(d => d.rank);
    const size = ranksInPanel.length;
    const candidate = {
      size, ranks: ranksInPanel, covered,
      uncoveredNames: universe.filter(n => !names.has(n)),
      singletonNames
    };
    const prior = best.get(size);
    if (!prior || covered > prior.covered) {
      best.set(size, {...candidate, sameCoveragePanelCount: 1});
    } else if (covered === prior.covered) {
      const count = prior.sameCoveragePanelCount + 1;
      const earlier = singletonNames > prior.singletonNames ||
        (singletonNames === prior.singletonNames &&
          compareRanks(ranksInPanel, prior.ranks) < 0);
      best.set(size, {...(earlier ? candidate : prior),
        sameCoveragePanelCount: count});
    }
  }
  const panels = [...best.values()].sort((a, b) => a.size - b.size)
    .map((p, index, arr) => ({
      ...p, additionalNamesOverPreviousSize:
        index === 0 ? p.covered : p.covered - arr[index - 1].covered
    }));
  return {
    baselineRank, sourceRanks: ranks, publishedRegidragoLists: decks.length,
    distinctNames: universe.length, coreNames: core.length, coreSlots,
    panelNameCoverageOnly: true,
    minPanelSizeForAllNames: panels.find(p => p.covered === universe.length)?.size ?? null,
    panels
  };
}

/** @param {number[]} a @param {number[]} b */
function compareRanks(a, b) {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return a.length - b.length;
}

module.exports = { regidragoPanels };

if (require.main === module) {
  const manifest = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, '../results/aichi-2026/full-decklists.json'), 'utf8'));
  process.stdout.write(JSON.stringify(regidragoPanels(manifest), null, 2) + '\n');
}
