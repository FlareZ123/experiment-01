'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const roster = JSON.parse(fs.readFileSync(
  path.join(root, 'results/aichi-2026/full-decklists.json'), 'utf8'
));
const cardDir = path.join(root, 'resources/cards/en');
const allCards = fs.readdirSync(cardDir)
  .filter(file => file.endsWith('.json'))
  .flatMap(file => JSON.parse(fs.readFileSync(path.join(cardDir, file), 'utf8')));

const key = value => String(value)
  .normalize('NFKC')
  .replace(/[♢◇]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '');
const nameAliases = new Map([
  ['battlecompressor', 'battlecompressorteamflaregear'],
  ['unitenergylpm', 'unitenergylightningpsychicmetal']
]);
const cardKey = value => nameAliases.get(key(value)) || key(value);

const aceSpecNames = new Set(allCards
  .filter(card =>
    (card.rules || []).some(rule => /ACE SPEC/i.test(String(rule))) ||
    (card.subtypes || []).some(subtype => /ACE SPEC/i.test(String(subtype))))
  .map(card => cardKey(card.name)));
const prismStarNames = new Set(allCards
  .filter(card =>
    /[♢◇]/.test(card.name) ||
    (card.subtypes || []).some(subtype => /Prism Star/i.test(String(subtype))))
  .map(card => cardKey(card.name)));
const radiantNames = new Set(allCards
  .filter(card => card.name.startsWith('Radiant '))
  .map(card => cardKey(card.name)));
const basicEnergyNames = new Set([
  'grassenergy', 'fireenergy', 'waterenergy', 'lightningenergy',
  'psychicenergy', 'fightingenergy', 'darknessenergy', 'metalenergy',
  'basicgrassenergy', 'basicfireenergy', 'basicwaterenergy',
  'basiclightningenergy', 'basicpsychicenergy', 'basicfightingenergy',
  'basicdarknessenergy', 'basicmetalenergy'
]);

const eligibleRanks = [
  1, 2, 4, 5,
  8, 9, 10, 11, 12, 13, 14, 15, 16,
  17, 18, 19, 20, 21, 22,
  26, 27, 30, 31, 32
];

test('all 24 identity-screened Aichi lists pass 60-card construction rules', () => {
  const decks = eligibleRanks.map(rank => {
    const deck = roster.decks.find(row => row.rank === rank);
    assert.ok(deck, `missing authenticated Aichi rank ${rank}`);
    return deck;
  });
  assert.equal(decks.length, 24);

  for (const deck of decks) {
    const copies = deck.cards.reduce((sum, card) => sum + card.count, 0);
    assert.equal(copies, 60, `rank ${deck.rank} is not 60 cards`);

    const countsByName = new Map();
    for (const card of deck.cards) {
      const normalizedName = cardKey(card.name);
      countsByName.set(normalizedName,
        (countsByName.get(normalizedName) || 0) + card.count);
    }

    const fourCopyViolations = [...countsByName]
      .filter(([name, count]) => !basicEnergyNames.has(name) && count > 4);
    assert.deepEqual(fourCopyViolations, [],
      `four-copy rule violation at rank ${deck.rank}`);

    const aceSpecCopies = [...countsByName]
      .filter(([name]) => aceSpecNames.has(name))
      .reduce((sum, [, count]) => sum + count, 0);
    assert.equal(aceSpecCopies, 1,
      `rank ${deck.rank} must contain exactly one ACE SPEC`);

    const prismStarCopies = [...countsByName]
      .filter(([name]) => prismStarNames.has(name));
    assert.ok(prismStarCopies.every(([, count]) => count <= 1),
      `Prism Star copy limit exceeded at rank ${deck.rank}`);

    const radiantCopies = [...countsByName]
      .filter(([name]) => radiantNames.has(name))
      .reduce((sum, [, count]) => sum + count, 0);
    assert.ok(radiantCopies <= 1,
      `Radiant Pokémon limit exceeded at rank ${deck.rank}`);
  }
});
