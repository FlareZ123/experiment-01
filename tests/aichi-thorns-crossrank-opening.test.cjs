'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const field = require('../results/aichi-2026/full-decklists.json');
const { choose } = require('../scripts/aichi-prize-conditionals.cjs');
const { groupsForRank, crossrankOpening } =
  require('../scripts/aichi-thorns-crossrank-opening.cjs');

/** Independent closed-category enumeration for the direct Thunder+DCE route. */
function directRouteOracle(dceCopies) {
  const other = 60 - 4 - 1 - dceCopies;
  let weighted = 0n;
  for (let basic = 1; basic <= 4; basic++) {
    for (let energy = 1; energy <= dceCopies; energy++) {
      const rest = 7 - basic - energy;
      weighted += choose(4, basic) * choose(dceCopies, energy) *
        choose(other, rest) * (basic === 1 ? 7n : 8n);
    }
  }
  const validSeven = choose(60, 7) - choose(56, 7);
  return Number(weighted * choose(60, 7)) /
    Number(8n * choose(60, 8) * validSeven);
}

test('each group comes directly from a legal 60-card source and 4 Basics', () => {
  assert.equal(field.published_deck_count, 29);
  for (const rank of [6, 24, 29]) {
    for (let tier = 0; tier <= 4; tier++) {
      const groups = groupsForRank(rank, tier);
      assert.equal(Object.values(groups).reduce((sum, count) => sum + count, 0), 60);
      assert.equal(groups.thorns, 4);
      assert.equal(groups.thunder, 1);
      assert.equal(groups.guzmaHala, 2);
      assert.equal(groups.tagCall, 2);
      assert.equal(groups.dce, rank === 24 ? 3 : 1);
    }
  }
  assert.throws(() => groupsForRank(23, 1), /published Iron Thorns/);
  assert.throws(() => groupsForRank(6, 5), /tier/);
});

test('nested discard-copy tiers come from the exact three-source inventory', () => {
  assert.deepEqual([6, 24, 29].map(rank =>
    Array.from({length: 5}, (_, tier) => groupsForRank(rank, tier).discards)), [
    [0, 7, 19, 30, 38],
    [0, 4, 13, 25, 32],
    [0, 8, 17, 28, 35]
  ]);
});

test('rank 6 reproduces independent previously published DCI frontier', () => {
  const out = crossrankOpening();
  const rank6 = out.rankReports.find(report => report.rank === 6);
  const published = [0.0484127507, 0.0963265130, 0.2483667502,
    0.3208071006, 0.3354814393];
  for (let i = 0; i < published.length; i++) {
    assert.ok(Math.abs(rank6.tiers[i].total.probability - published[i]) < 6e-10,
      'rank6 tier ' + i + ' must replicate source report');
  }
});

test('rank24 three-DCE direct route independently matches exact closed-category sum', () => {
  const output = crossrankOpening();
  for (const report of output.rankReports) {
    const oracle = directRouteOracle(report.printedDceCopies);
    for (const tier of report.tiers) {
      assert.ok(Math.abs(tier.byRoute.direct.probability - oracle) < 1e-12);
    }
  }
  assert.ok(directRouteOracle(3) > directRouteOracle(1));
});

test('opening resource opportunities increase monotonically with acceptance tiers', () => {
  for (const report of crossrankOpening().rankReports) {
    for (let i = 1; i < report.tiers.length; i++) {
      assert.ok(report.tiers[i].total.probability >=
        report.tiers[i - 1].total.probability);
    }
  }
});
