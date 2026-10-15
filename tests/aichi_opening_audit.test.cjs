'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  normalizeName, choose, mulliganProbability,
  opponentDrawOpportunities, audit,
} = require('../scripts/aichi_opening_audit.cjs');

test('Prism Star glyph normalization', () => {
  assert.equal(normalizeName('Ditto ♢'), 'Ditto ◇');
  assert.equal(normalizeName('Tapu Koko ♢'), 'Tapu Koko ◇');
});

test('exact combinatorics match independent calculations', () => {
  assert.equal(choose(60, 7), 386206920);
  assert.ok(Math.abs(mulliganProbability(14) - 0.1385906808712801) < 1e-12);
  assert.ok(Math.abs(mulliganProbability(4) - 0.6005003742553343) < 1e-12);
});

test('simultaneous mulligans do not offer additional cards', () => {
  const p = mulliganProbability(4);
  assert.equal(opponentDrawOpportunities(p, 1), 0);
  assert.ok(Math.abs(opponentDrawOpportunities(p, 0) - p / (1 - p)) < 1e-12);
  assert.ok(Math.abs(
    opponentDrawOpportunities(p, mulliganProbability(14)) - 1.4123525560019534,
  ) < 1e-12);
});

test('Basic status depends on actual Pokémon stage, including Mega ex', () => {
  const cards = [
    { name: 'Mega Absol ex', category: 'Pokémon', count: 4 },
    { name: 'Mega Lopunny ex', category: 'Pokémon', count: 2 },
    { name: 'Psychic Energy', category: 'Energy', count: 54 },
  ];
  const deck = { rank: 8, archetype: 'Synthetic test', category_counts: { 'Pokémon': 6, Energy: 54 }, cards };
  const index = new Map([['Mega Absol ex', true], ['Mega Lopunny ex', false]]);
  assert.equal(audit([deck], index)[0].basicCount, 4);
  assert.throws(() => audit([deck], new Map()), /unknown or ambiguous stage/);
  assert.throws(() => audit([{ ...deck, cards: cards.slice(0, 2) }], index), /contains 6 cards/);
});

test('historical Pokémon lacking subtype metadata do not poison the card-stage index', () => {
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const { loadBasicIndex } = require('../scripts/aichi_opening_audit.cjs');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'aichi-stage-'));
  try {
    fs.writeFileSync(path.join(directory, 'sample.json'), JSON.stringify([
      { name: 'Ancient card', supertype: 'Pokémon' },
      { name: 'Modern Basic', supertype: 'Pokémon', subtypes: ['Basic'] },
      { name: 'Modern Evolved', supertype: 'Pokémon', subtypes: ['Stage 1'] },
    ]));
    const index = loadBasicIndex(directory);
    assert.equal(index.has('Ancient card'), false);
    assert.equal(index.get('Modern Basic'), true);
    assert.equal(index.get('Modern Evolved'), false);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
