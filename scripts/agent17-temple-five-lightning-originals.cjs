'use strict';

/**
 * Source-locked paper-text screen for Temple of Sinnoh versus the original
 * Aichi 2026 source decks. This audits printed Energy supply and one named
 * attack per source. It is not an engine game or a claim of a winning matchup.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const BASIC_ENERGIES = new Set([
  'Grass Energy', 'Fire Energy', 'Water Energy', 'Lightning Energy',
  'Psychic Energy', 'Fighting Energy', 'Darkness Energy', 'Metal Energy',
  'Fairy Energy'
]);

const PRINTED_STADIUM_ANSWERS = new Map([
  [4, [{ name: 'Sky Field', count: 3, printing: 'ROS89' }]],
  [6, [
    { name: 'Tropical Beach', count: 1, printing: 'BWP50' },
    { name: 'Thunder Mountain ♢', count: 1, printing: 'LOT191' },
    { name: 'Wondrous Labyrinth ♢', count: 1, printing: 'TEU158' }
  ]],
  [17, [{ name: 'PokéStop', count: 1, printing: 'PGO68' }]],
  [24, [
    { name: 'Thunder Mountain ♢', count: 1, printing: 'LOT191' },
    { name: 'Wondrous Labyrinth ♢', count: 1, printing: 'TEU158' }
  ]],
  [29, [
    { name: 'Tropical Beach', count: 2, printing: 'BWP50' },
    { name: 'Thunder Mountain ♢', count: 1, printing: 'LOT191' },
    { name: 'Wondrous Labyrinth ♢', count: 1, printing: 'TEU158' }
  ]]
]);

const TARGETS = [
  { rank: 4, pokemon: 'Alolan Raichu', printing: 'UNM57', cardId: 'sm11-57',
    file: 'sm11', attack: 'Electro Rain', expectedEnergy: 12 },
  { rank: 6, pokemon: 'Iron Thorns ex', printing: 'TWM77', cardId: 'sv6-77',
    file: 'sv6', attack: 'Volt Cyclone', expectedEnergy: 8 },
  { rank: 17, pokemon: 'Alolan Raichu', printing: 'UNM57', cardId: 'sm11-57',
    file: 'sm11', attack: 'Electro Rain', expectedEnergy: 12 },
  { rank: 24, pokemon: 'Iron Thorns ex', printing: 'TWM77', cardId: 'sv6-77',
    file: 'sv6', attack: 'Volt Cyclone', expectedEnergy: 8 },
  { rank: 29, pokemon: 'Iron Thorns ex', printing: 'TWM77', cardId: 'sv6-77',
    file: 'sv6', attack: 'Volt Cyclone', expectedEnergy: 8 }
];

/** @param {string} file @param {string} id @returns {object} */
function readCard(file, id) {
  const cards = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'resources', 'cards', 'en', file + '.json'), 'utf8'
  ));
  const card = cards.find((candidate) => candidate.id === id);
  assert.ok(card, 'Missing exact card ' + id);
  return card;
}

/** @param {object} source @returns {object} */
function audit(source) {
  assert.equal(source.decks.length, 29, 'Use the frozen 29-original corpus');
  const temple = readCard('swsh10', 'swsh10-155');
  assert.equal(temple.name, 'Temple of Sinnoh');
  assert.ok(temple.rules.some((rule) =>
    rule.includes('All Special Energy attached') &&
    rule.includes('provide Colorless Energy') &&
    rule.includes('have no other effect')
  ));

  const sevenAllSpecial = source.decks
    .filter((deck) => {
      const energies = deck.cards.filter((card) => card.category === 'Energy');
      return energies.length > 0 &&
        energies.every((card) => !BASIC_ENERGIES.has(card.name));
    })
    .map((deck) => deck.rank).sort((a, b) => a - b);

  const affected = TARGETS.map((target) => {
    const deck = source.decks.find((entry) => entry.rank === target.rank);
    assert.ok(deck, 'Missing source rank ' + target.rank);
    const sourcePokemon = deck.cards.find((entry) =>
      entry.category === 'Pokémon' &&
      entry.name === target.pokemon &&
      entry.printing.set + entry.printing.number === target.printing
    );
    assert.ok(sourcePokemon, 'Wrong source Pokémon printing at rank ' + target.rank);
    const energies = deck.cards.filter((entry) => entry.category === 'Energy');
    assert.equal(energies.reduce((sum, entry) => sum + entry.count, 0), target.expectedEnergy);
    assert.ok(energies.every((entry) => !BASIC_ENERGIES.has(entry.name)));

    const stadiumAnswers = PRINTED_STADIUM_ANSWERS.get(target.rank);
    assert.ok(stadiumAnswers);
    const directStadiumReplacements = stadiumAnswers.map((answer) => {
      const printedSource = deck.cards.find((entry) =>
        entry.category === 'Trainer' &&
        entry.name === answer.name &&
        entry.printing.set + entry.printing.number === answer.printing
      );
      assert.ok(printedSource, 'Missing Stadium replacement at rank ' + target.rank);
      assert.equal(printedSource.count, answer.count);
      assert.notEqual(answer.name, 'Temple of Sinnoh');
      return answer;
    });
    const directReplacementTotal = directStadiumReplacements.reduce(
      (sum, entry) => sum + entry.count, 0
    );
    assert.ok(directReplacementTotal > 0);

    const printed = readCard(target.file, target.cardId);
    assert.equal(printed.name, target.pokemon);
    const attack = printed.attacks.find((entry) => entry.name === target.attack);
    assert.ok(attack && attack.cost.includes('Lightning'));
    if (target.attack === 'Electro Rain') {
      assert.match(attack.text, /Discard any amount of Lightning Energy/);
    }
    return {
      rank: target.rank,
      archetype: deck.archetype,
      printedPokemon: target.pokemon + ' ' + target.printing,
      affectedAttack: target.attack,
      printedAttackCost: attack.cost,
      directStadiumReplacements,
      directReplacementTotal,
      energyInventory: energies.map((entry) => ({
        name: entry.name, count: entry.count,
        printing: entry.printing.set + entry.printing.number
      })),
      blocksLightningPaymentWhileTempleStays: true,
      blocksElectroRainLightningDiscard: target.attack === 'Electro Rain'
    };
  });
  return {
    scope: '29 authenticated original Aichi 2026 printed 60-card lists',
    sevenAllSpecial,
    focalLightningRanks: affected.map((entry) => entry.rank),
    affected,
    directStadiumReplacementCounts: affected.map(({ rank, directReplacementTotal }) => ({ rank, copies: directReplacementTotal })),
    interpretation: 'Printed Energy cannot provide Lightning while Temple of Sinnoh stays in play; other cards, Stadium removal, alternate win paths, and full-game decisions remain outside this test.',
    competitivelyQualifiedGames: 0
  };
}

if (require.main === module) {
  const original = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'results', 'aichi-2026', 'full-decklists.json'), 'utf8'
  ));
  process.stdout.write(JSON.stringify(audit(original), null, 2) + '\n');
}

module.exports = { audit, readCard };
