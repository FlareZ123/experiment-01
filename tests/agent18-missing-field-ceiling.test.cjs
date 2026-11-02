'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {missingFieldCeiling} = require('../scripts/agent18-missing-field-ceiling.cjs');

const types = new Map([
  ['Draw Supporter', 'Supporter'],
  ['Stadium', 'Stadium'],
  ['Search Item', 'Item'],
  ['One Tool', 'Pokémon Tool']
]);
/** @param {number} rank @param {number} n @returns {object} */
function deck(rank, n) {
  return {rank, archetype: 'Fixture', cards: [
    {name: 'Draw Supporter', category: 'Trainer', count: n},
    {name: 'Unown', category: 'Pokémon', count: 1},
    {name: 'Psychic Energy', category: 'Energy', count: 59 - n}
  ]};
}
const source = (decks) => ({decks, missing_full_lists: [{rank: 28}]});

test('11 physical Supporters cannot satisfy MISSING even if all enter Lost Zone', () => {
  const report = missingFieldCeiling(source([deck(1, 11)]), types);
  assert.equal(report.impossibleByPhysicalInventory, 1);
  assert.deepEqual(report.impossibleRanks, [1]);
  assert.equal(report.rows[0].missingDeficit, 1);
  assert.equal(report.rows[0].maxSupportersInOpponentLostZone, 11);
});

test('12 Supporters clears only the physical quantity gate', () => {
  const report = missingFieldCeiling(source([deck(2, 12), deck(1, 11)]), types);
  assert.deepEqual(report.quantityPossibleRanks, [2]);
  assert.equal(report.rows[1].missingDeficit, 0);
  assert.equal(report.competitiveQualifiedGames, 0);
});

test('classifies Items, Tools, Stadiums and Pokemon name separately', () => {
  const d = deck(1, 12);
  d.cards = [
    {category: 'Pokémon', name: 'Draw Supporter', count: 4},
    {category: 'Trainer', name: 'Draw Supporter', count: 11},
    {category: 'Trainer', name: 'Stadium', count: 2},
    {category: 'Trainer', name: 'Search Item', count: 3},
    {category: 'Trainer', name: 'One Tool', count: 1},
    {category: 'Energy', name: 'Psychic Energy', count: 39}
  ];
  const report = missingFieldCeiling(source([d]), types);
  assert.equal(report.rows[0].physicalSupporters, 11);
  assert.deepEqual(report.impossibleRanks, [1]);
});

test('missing opponent lists are excluded, even at a named rank', () => {
  const report = missingFieldCeiling(source([deck(1, 12)]), types);
  assert.deepEqual(report.missingFullListRanks, [28]);
  assert.equal(report.authenticatedOriginalSixties, 1);
});

test('rejects malformed, duplicate and unclassified source rows', () => {
  assert.throws(() => missingFieldCeiling(source([deck(1, 12), deck(1, 13)]), types), /duplicate/);
  assert.throws(() => missingFieldCeiling(source([deck(1, 12)]), new Map()), /unclassified/);
  const invalid = deck(1, 12);
  invalid.cards[2].count = 40;
  assert.throws(() => missingFieldCeiling(source([invalid]), types), /invalid original 60/);
});
