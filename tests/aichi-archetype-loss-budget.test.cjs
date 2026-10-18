'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseField} = require('../scripts/aichi-comparison-campaign.cjs');
const {fieldArchetypeFloors} =
  require('../scripts/aichi-archetype-loss-budget.cjs');

const dataPath = path.resolve(__dirname, '../results/aichi-2026/field.csv');
const field = parseField(fs.readFileSync(dataPath, 'utf8'));

test('actual 32-placement source manifest has the five expected multi-rank groups', () => {
  const report = fieldArchetypeFloors(field);
  assert.equal(report.rankCount, 32);
  assert.equal(report.archetypeCount, 14);
  assert.ok(Math.abs(report.totalLossBudget - 0.16) < 1e-12);
  assert.equal(report.archetypes.reduce((sum, row) => sum + row.count, 0), 32);
  assert.deepEqual(
    report.archetypes.filter(row => row.count > 1)
      .map(row => [row.archetype, row.count]),
    [
      ['Regidrago', 11],
      ['Absol Garbodor', 4],
      ['Iron Thorns', 3],
      ['Raichu Electrode Combo', 3],
      ['Snorlax Stall', 2]
    ]
  );
});

test('rank-level group thresholds match exact field provenance', () => {
  const report = fieldArchetypeFloors(field);
  const expected = new Map([
    ['Regidrago', {ranks:[10,12,13,14,18,20,21,23,27,28,32], floor:1-.16/11}],
    ['Absol Garbodor', {ranks:[8,11,16,22], floor:.96}],
    ['Iron Thorns', {ranks:[6,24,29], floor:1-.16/3}],
    ['Raichu Electrode Combo', {ranks:[4,17,25], floor:1-.16/3}],
    ['Snorlax Stall', {ranks:[3,7], floor:.92}]
  ]);
  for (const row of report.archetypes) {
    const match = expected.get(row.archetype);
    if (match) {
      assert.deepEqual(row.ranks, match.ranks);
      assert.ok(Math.abs(row.necessaryAverageWin - match.floor) < 1e-12);
    } else {
      assert.equal(row.count, 1);
      assert.ok(Math.abs(row.necessaryAverageWin - 0.84) < 1e-12);
    }
  }
});

test('row order is irrelevant to necessary group floors', () => {
  const original = fieldArchetypeFloors(field);
  const reverse = fieldArchetypeFloors([...field].reverse());
  assert.deepEqual(reverse, original);
});

test('duplicate rank, absent rank and empty archetype fail closed', () => {
  const duplicate = field.map(row => ({...row}));
  duplicate[0].rank = duplicate[1].rank;
  assert.throws(() => fieldArchetypeFloors(duplicate), /32 unique/);
  assert.throws(() => fieldArchetypeFloors(field.slice(1)), /32 unique/);
  const blank = field.map(row => ({...row}));
  blank[0].archetype = '';
  assert.throws(() => fieldArchetypeFloors(blank), /nonempty archetype/);
});

test('one rank relabeled moves one group and changes its necessary floor', () => {
  const changed = field.map(row => ({...row}));
  changed.find(row => row.rank === 23).archetype = 'Other Regidrago subtype';
  const report = fieldArchetypeFloors(changed);
  const regidrago = report.archetypes.find(row => row.archetype === 'Regidrago');
  assert.equal(regidrago.count, 10);
  assert.ok(Math.abs(regidrago.necessaryAverageWin - 0.984) < 1e-12);
  assert.equal(report.archetypeCount, 15);
});
