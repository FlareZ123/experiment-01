'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const readText = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const readJson = relative => JSON.parse(readText(relative));
const gitBlobSha = text => {
  const bytes = Buffer.from(text, 'utf8');
  return crypto.createHash('sha1')
    .update(Buffer.from(`blob ${bytes.length}\\0`, 'utf8'))
    .update(bytes)
    .digest('hex');
};

const rosterText = readText('results/aichi-2026/full-decklists.json');
const coverageText = readText('results/aichi-2026/card-coverage.json');
const roster = JSON.parse(rosterText);
const normalized = readJson(
  'results/aichi-2026/2026-11/agent39-ranks8-16-expanded-normalized-inputs-20261113.json'
);
const sve = readJson('resources/cards/en/sve.json');
const xy4 = readJson('resources/cards/en/xy4.json');

const cardDir = path.join(root, 'resources/cards/en');
const allCards = fs.readdirSync(cardDir)
  .filter(file => file.endsWith('.json'))
  .flatMap(file => JSON.parse(fs.readFileSync(path.join(cardDir, file), 'utf8')));
const aceSpecNames = new Set(allCards
  .filter(card =>
    (card.rules || []).some(rule => /ACE SPEC/i.test(String(rule))) ||
    (card.subtypes || []).some(subtype => /ACE SPEC/i.test(String(subtype))))
  .map(card => card.name));
const prismKey = name => name.replace(/♢/g, '◇');
const prismStarNames = new Set(allCards
  .filter(card =>
    card.name.includes('◇') || card.name.includes('♢') ||
    (card.subtypes || []).some(subtype => /Prism Star/i.test(String(subtype))))
  .map(card => prismKey(card.name)));
const radiantNames = new Set(allCards
  .filter(card => card.name.startsWith('Radiant '))
  .map(card => card.name));

const basicEnergyNames = new Set([
  'Grass Energy', 'Fire Energy', 'Water Energy', 'Lightning Energy',
  'Psychic Energy', 'Fighting Energy', 'Darkness Energy', 'Metal Energy'
]);
const energyMap = {
  'Grass Energy': { name: 'Basic Grass Energy', number: '1', id: 'sve-1' },
  'Fire Energy': { name: 'Basic Fire Energy', number: '2', id: 'sve-2' },
  'Lightning Energy': { name: 'Basic Lightning Energy', number: '4', id: 'sve-4' },
  'Darkness Energy': { name: 'Basic Darkness Energy', number: '7', id: 'sve-7' }
};
const expectedAceSpec = {
  8: 'Secret Box',
  9: 'Secret Box',
  10: 'Prime Catcher',
  11: 'Secret Box',
  12: 'Megaton Blower',
  13: 'Megaton Blower',
  14: 'Megaton Blower',
  15: 'Grand Tree',
  16: 'Secret Box'
};

test('normalized ranks 8–16 preserve exact 60-card lists and satisfy deck construction rules', () => {
  assert.equal(gitBlobSha(rosterText), normalized.source.roster_blob_sha);
  assert.equal(gitBlobSha(coverageText), normalized.source.coverage_blob_sha);
  assert.deepEqual(normalized.decks.map(deck => deck.rank),
    [8, 9, 10, 11, 12, 13, 14, 15, 16]);

  let totalCards = 0;
  let aliasCopies = 0;
  let energyCopies = 0;
  let changedRows = 0;

  for (const deck of normalized.decks) {
    const sourceDeck = roster.decks.find(row => row.rank === deck.rank);
    assert.ok(sourceDeck, `missing source rank ${deck.rank}`);
    assert.deepEqual(deck.source_cards, sourceDeck.cards);
    assert.equal(deck.source_card_count, 60);
    assert.equal(deck.normalized_card_count, 60);
    assert.equal(deck.admitted_to_verified_field, false);
    assert.equal(deck.normalized_cards.length, sourceDeck.cards.length);

    const sourceTotal = sourceDeck.cards.reduce((sum, card) => sum + card.count, 0);
    const normalizedTotal = deck.normalized_cards.reduce((sum, card) => sum + card.count, 0);
    assert.equal(sourceTotal, 60);
    assert.equal(normalizedTotal, 60);
    totalCards += normalizedTotal;

    const countsByName = new Map();
    for (const card of sourceDeck.cards) {
      countsByName.set(card.name, (countsByName.get(card.name) || 0) + card.count);
    }
    const fourCopyViolations = [...countsByName]
      .filter(([name, count]) => !basicEnergyNames.has(name) && count > 4);
    assert.deepEqual(fourCopyViolations, [], `four-copy violation at rank ${deck.rank}`);

    const aceSpecCards = sourceDeck.cards.filter(card => aceSpecNames.has(card.name));
    const aceSpecCopies = aceSpecCards.reduce((sum, card) => sum + card.count, 0);
    assert.equal(aceSpecCopies, 1, `expected exactly one ACE SPEC at rank ${deck.rank}`);
    assert.deepEqual(aceSpecCards.map(card => card.name), [expectedAceSpec[deck.rank]]);

    const prismStarCopies = [...countsByName]
      .filter(([name]) => prismStarNames.has(prismKey(name)));
    assert.ok(prismStarCopies.every(([, count]) => count <= 1),
      `duplicate Prism Star identity at rank ${deck.rank}`);
    if (deck.rank === 8) assert.deepEqual(prismStarCopies, [['Tapu Koko ♢', 1]]);
    else assert.deepEqual(prismStarCopies, []);

    const radiantCopies = [...countsByName]
      .filter(([name]) => radiantNames.has(name))
      .reduce((sum, [, count]) => sum + count, 0);
    assert.ok(radiantCopies <= 1, `Radiant Pokémon limit exceeded at rank ${deck.rank}`);

    for (let i = 0; i < sourceDeck.cards.length; i++) {
      const source = sourceDeck.cards[i];
      const target = deck.normalized_cards[i];

      if (source.category === 'Energy' && source.printing?.set === 'MEE') {
        const expected = energyMap[source.name];
        assert.ok(expected, `unexpected MEE energy at rank ${deck.rank}: ${source.name}`);
        assert.equal(target.source_name, source.name);
        assert.deepEqual(target.source_printing, source.printing);
        assert.equal(target.name, expected.name);
        assert.deepEqual(target.printing, {
          set: 'SVE', number: expected.number, language: 'en'
        });
        assert.equal(target.card_id, expected.id);
        assert.equal(target.count, source.count);
        const card = sve.find(row => row.id === expected.id);
        assert.ok(card, `missing SVE card ${expected.id}`);
        assert.equal(card.name, expected.name);
        assert.equal(card.legalities?.expanded, 'Legal');
        energyCopies += source.count;
        changedRows++;
        continue;
      }

      if (source.name === 'Battle Compressor' &&
          source.printing?.set === 'PHF' &&
          String(source.printing?.number) === '92') {
        assert.equal(target.source_name, source.name);
        assert.deepEqual(target.source_printing, source.printing);
        assert.equal(target.name, 'Battle Compressor Team Flare Gear');
        assert.equal(target.card_id, 'xy4-92');
        assert.deepEqual(target.printing, source.printing);
        assert.equal(target.count, source.count);
        const card = xy4.find(row => row.id === 'xy4-92');
        assert.ok(card, 'missing canonical Battle Compressor card');
        assert.equal(card.name, 'Battle Compressor Team Flare Gear');
        assert.equal(card.legalities?.expanded, 'Legal');
        aliasCopies += source.count;
        changedRows++;
        continue;
      }

      assert.deepEqual(target, source,
        `unexpected card change at rank ${deck.rank}: ${source.name}`);
    }
  }

  assert.equal(totalCards, 540);
  assert.equal(aliasCopies, 10);
  assert.equal(energyCopies, 51);
  assert.equal(changedRows, 20);
  assert.equal(normalized.physical_print_status.includes('unresolved'), true);
});
