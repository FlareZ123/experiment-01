'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadBasicIndex } = require('../scripts/aichi_opening_audit.cjs');
const { countsFromDeck, naturalEvolutionChance } = require('../scripts/first-evolution-natural.cjs');
const { weightedNaturalEvolutionChance } = require('../scripts/first-evolution-field.cjs');

const root = path.resolve(__dirname, '..');
const results = path.join(root, 'results/aichi-2026');
const index = loadBasicIndex(path.join(root, 'resources/cards/en'));
const field = JSON.parse(fs.readFileSync(path.join(results, 'full-decklists.json'), 'utf8'));
const decks = [
  ['champion', field.decks.find(deck => deck.rank === 1), [14, 3, 4]],
  ['hood', JSON.parse(fs.readFileSync(path.join(results, 'candidate-hood-shadow-rider.json'), 'utf8')), [14, 4, 4]],
  ['temple', JSON.parse(fs.readFileSync(path.join(results, 'candidate-temple-shadow-rider.json'), 'utf8')), [15, 4, 3]],
];

/** @param {number} actual @param {number} expected */
function close(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-10, `expected ${expected}, got ${actual}`);
}

test('frozen candidate source inventories have the correct number of Basic Pokémon', () => {
  for (const [label, deck, [basicCount, targetBasicCount, stageOneCount]] of decks) {
    assert.ok(deck, `missing source deck ${label}`);
    const actual = countsFromDeck(deck, index);
    assert.deepEqual(actual, { basicCount, targetBasicCount, stageOneCount }, label);
  }
});

test('source-derived Hood readiness uses 14, not 15, Basic Pokémon', () => {
  const hoodCounts = countsFromDeck(decks[1][1], index);
  for (const [extra, expected] of [
    [0, 0.2301436933],
    [1, 0.2704532378],
    [2, 0.3114561815],
  ]) {
    close(naturalEvolutionChance({
      deckSize: 60, openingSize: 7, prizeCount: 6,
      ...hoodCounts, bonusDraws: extra,
    }).conditional, expected);
  }
  close(weightedNaturalEvolutionChance(4, hoodCounts), 0.2873317621793535);
});
