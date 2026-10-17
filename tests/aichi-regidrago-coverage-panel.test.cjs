'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const manifest = require('../results/aichi-2026/full-decklists.json');
const { regidragoPanels } = require('../scripts/aichi-regidrago-coverage-panel.cjs');

test('the nine published Regidrago source decks yield exact panel maxima', () => {
  const result = regidragoPanels(manifest);
  assert.deepEqual(result.sourceRanks, [10, 12, 13, 14, 18, 20, 21, 27, 32]);
  assert.equal(result.publishedRegidragoLists, 9);
  assert.equal(result.distinctNames, 60);
  assert.equal(result.coreNames, 20);
  assert.equal(result.coreSlots, 34);
  assert.equal(result.minPanelSizeForAllNames, 7);
  assert.deepEqual(result.panels.map(p => p.covered),
    [36, 49, 53, 56, 58, 59, 60, 60, 60]);
  assert.deepEqual(result.panels[1].ranks, [10, 32]);
  assert.deepEqual(result.panels[2].ranks, [10, 27, 32]);
  assert.deepEqual(result.panels[6].ranks, [10, 13, 14, 18, 20, 27, 32]);
  assert.equal(result.panels[3].sameCoveragePanelCount, 2);
  assert.equal(result.panelNameCoverageOnly, true);
});

test('row splitting, source order and card ordering do not alter panel results', () => {
  const cloned = structuredClone(manifest);
  cloned.decks.reverse();
  for (const deck of cloned.decks) {
    deck.cards.reverse();
    const row = deck.cards.find(c => c.count >= 2);
    if (row) {
      row.count -= 1;
      deck.cards.push({...structuredClone(row), count: 1});
    }
  }
  assert.deepEqual(regidragoPanels(cloned), regidragoPanels(manifest));
});

test('requires valid 60-card sources, unique ranks and a published baseline', () => {
  const altered = structuredClone(manifest);
  const rank10 = altered.decks.find(d => d.rank === 10);
  rank10.cards[0].count = 0;
  assert.throws(() => regidragoPanels(altered), /Invalid card row/);
  rank10.cards[0].count = 3;
  assert.throws(() => regidragoPanels(altered), /60-card/);
  assert.throws(() => regidragoPanels(manifest, 23), /Baseline/);
  const dupe = {decks: [manifest.decks.find(d => d.rank === 10),
    manifest.decks.find(d => d.rank === 10)]};
  assert.throws(() => regidragoPanels(dupe), /distinct/);
});

test('every published rank is retained and all-name panel covers the union', () => {
  const result = regidragoPanels(manifest);
  assert.equal(result.panels.length, 9);
  for (const p of result.panels) {
    assert.equal(p.ranks.length, p.size);
    assert.ok(p.ranks.includes(10));
    assert.equal(p.covered + p.uncoveredNames.length, result.distinctNames);
  }
  assert.deepEqual(result.panels[6].uncoveredNames, []);
});
