'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { auditEnergy } = require('./aichi_energy_audit.cjs');

/** @param {string} energyName @param {number} amount */
function syntheticDeck(energyName, amount) {
  return {rank:1, archetype:'synthetic', cards:[
    {category:'Energy',name:energyName,count:amount},
    {category:'Trainer',name:'Test',count:60-amount}
  ]};
}

test('classifies a Basic Energy and a Special Energy', () => {
  const a = auditEnergy({decks:[syntheticDeck('Psychic Energy', 10)]});
  assert.equal(a.basicEnergySlots, 10);
  assert.equal(a.specialEnergySlots, 0);
  assert.deepEqual(a.basicOnlyRanks, [1]);
  const b = auditEnergy({decks:[syntheticDeck('Double Dragon Energy', 4)]});
  assert.equal(b.basicEnergySlots, 0);
  assert.equal(b.specialEnergySlots, 4);
  assert.deepEqual(b.specialOnlyRanks, [1]);
});

test('rejects an incomplete deck', () => {
  assert.throws(() => auditEnergy({decks:[{rank:5,cards:[
    {category:'Energy',name:'Grass Energy',count:3}
  ]}]}), /Non-60-card/);
});

test('published-field count invariants', () => {
  const filename = path.resolve(__dirname, '../results/aichi-2026/full-decklists.json');
  const report = auditEnergy(JSON.parse(fs.readFileSync(filename, 'utf8')));
  assert.equal(report.publishedDecks, 29);
  assert.equal(report.totalEnergySlots, 238);
  assert.equal(report.basicEnergySlots, 120);
  assert.equal(report.specialEnergySlots, 118);
  assert.deepEqual(report.specialOnlyRanks, [4,5,6,7,17,24,29]);
  assert.deepEqual(report.basicOnlyRanks, [1,8,11,16,22]);
  assert.equal(report.mixedRanks.length, 17);
  assert.equal(report.decksWithAnySpecial, 24);
  assert.equal(report.decksWithAtLeastFourSpecial, 18);
});
