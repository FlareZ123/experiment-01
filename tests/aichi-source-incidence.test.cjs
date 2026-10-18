'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { analyzeIncidence } = require('../scripts/aichi-source-incidence.cjs');

const item = (name, count, set, number) => ({
  category: 'Pokémon', name, count,
  printing: { set, number, language: 'en' }
});

test('identical Pokémon name with distinct printings counts as one deck', () => {
  const fixture = { decks: [
    { rank: 16, cards: [
      item('Garbodor', 2, 'LTR', '68'),
      item('Garbodor', 1, 'BKP', '57'),
      item('Psychic Energy', 57, 'MEE', '5')
    ] },
    { rank: 8, cards: [
      item('Garbodor', 1, 'LTR', '68'),
      item('Psychic Energy', 59, 'MEE', '5')
    ] }
  ] };
  const report = analyzeIncidence(fixture);
  const garbodor = report.nameIncidence.find(x => x.name === 'Garbodor');
  assert.deepEqual(garbodor, {
    name: 'Garbodor', decks: 2, copies: 4, ranks: [8, 16]
  });
  assert.deepEqual(report.mixedPrintingNames, [{
    rank: 16, name: 'Garbodor', copies: 3,
    printings: [
      { id: 'LTR/68/en', copies: 2 },
      { id: 'BKP/57/en', copies: 1 }
    ]
  }]);
});

test('source-locked 29-deck Aichi incidence and mixed-printing regression', () => {
  const file = path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json');
  const report = analyzeIncidence(JSON.parse(fs.readFileSync(file, 'utf8')));
  assert.equal(report.availableDecks, 29);
  assert.deepEqual(report.missingRanks, [23, 25, 28]);
  const count = name => report.nameIncidence.find(x => x.name === name);
  assert.deepEqual([count('Guzma').decks, count('VS Seeker').decks,
    count('Budew').decks, count('Garbodor').decks,
    count('Temple of Sinnoh').decks, count('Field Blower').decks],
  [25, 23, 14, 4, 5, 9]);
  assert.deepEqual(report.mixedPrintingNames.map(x => [x.rank, x.name]),
    [[15, 'Pidgeotto'], [15, 'Vileplume'], [16, 'Garbodor'],
      [22, 'Trubbish'], [31, 'Dusknoir']]);
});

test('source integrity rejects non-60-card and duplicate-rank inputs', () => {
  assert.throws(() => analyzeIncidence({decks:[
    {rank:1,cards:[item('Garbodor',3,'BKP','57')]}
  ]}), /not 60 cards/);
  assert.throws(() => analyzeIncidence({decks:[
    {rank:1,cards:[item('Psychic Energy',60,'MEE','5')]},
    {rank:1,cards:[item('Psychic Energy',60,'MEE','5')]}
  ]}), /distinct integers/);
});
