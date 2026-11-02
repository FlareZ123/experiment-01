'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { audit, readCard } = require('../scripts/agent17-temple-five-lightning-originals.cjs');

const original = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'results', 'aichi-2026', 'full-decklists.json'),
  'utf8'
));

test('exact original Aichi source corpus and five Lightning-cost attack targets', () => {
  const result = audit(original);
  assert.deepEqual(result.sevenAllSpecial, [4, 5, 6, 7, 17, 24, 29]);
  assert.deepEqual(result.focalLightningRanks, [4, 6, 17, 24, 29]);
  assert.equal(result.affected.length, 5);
  assert.equal(result.competitivelyQualifiedGames, 0);
});

test('two original Raichu sixties have Electro Rain and only Special Energy', () => {
  const result = audit(original);
  for (const rank of [4, 17]) {
    const row = result.affected.find((entry) => entry.rank === rank);
    assert.equal(row.printedPokemon, 'Alolan Raichu UNM57');
    assert.equal(row.affectedAttack, 'Electro Rain');
    assert.deepEqual(row.printedAttackCost, ['Lightning']);
    assert.equal(row.blocksElectroRainLightningDiscard, true);
    assert.deepEqual(row.energyInventory.map((entry) => [entry.name, entry.count]), [
      ['Reversal Energy', 4],
      ['Counter Energy', 4],
      ['Unit Energy LPM', 4]
    ]);
  }
});

test('three original Iron Thorns sixties pay Lightning for Volt Cyclone', () => {
  const rows = audit(original).affected.filter((entry) => [6, 24, 29].includes(entry.rank));
  assert.equal(rows.length, 3);
  for (const row of rows) {
    assert.equal(row.printedPokemon, 'Iron Thorns ex TWM77');
    assert.equal(row.affectedAttack, 'Volt Cyclone');
    assert.deepEqual(row.printedAttackCost, ['Lightning', 'Colorless', 'Colorless']);
    assert.equal(row.energyInventory.reduce((sum, entry) => sum + entry.count, 0), 8);
  }
});

test('no all-Special-wide denial claim: ranks 5 and 7 excluded', () => {
  const result = audit(original);
  assert.ok(result.sevenAllSpecial.includes(5));
  assert.ok(result.sevenAllSpecial.includes(7));
  assert.ok(!result.focalLightningRanks.includes(5));
  assert.ok(!result.focalLightningRanks.includes(7));
  assert.deepEqual(readCard('swsh10', 'swsh10-155').rules, [
    "All Special Energy attached to Pokémon (both yours and your opponent's) provide Colorless Energy and have no other effect."
  ]);
});

test('each affected original has printed different-name Stadium replacement resources', () => {
  const result = audit(original);
  assert.deepEqual(result.directStadiumReplacementCounts, [
    { rank: 4, copies: 3 },
    { rank: 6, copies: 3 },
    { rank: 17, copies: 1 },
    { rank: 24, copies: 2 },
    { rank: 29, copies: 4 }
  ]);
  const source17 = result.affected.find((entry) => entry.rank === 17);
  assert.deepEqual(source17.directStadiumReplacements, [
    { name: 'PokéStop', count: 1, printing: 'PGO68' }
  ]);
  const source4 = result.affected.find((entry) => entry.rank === 4);
  assert.deepEqual(source4.directStadiumReplacements, [
    { name: 'Sky Field', count: 3, printing: 'ROS89' }
  ]);
});

test('source change is rejected rather than silently overgeneralized', () => {
  const changed = structuredClone(original);
  const deck = changed.decks.find((entry) => entry.rank === 17);
  deck.cards.push({
    category: 'Energy', count: 1, name: 'Lightning Energy',
    printing: { set: 'SVE', number: '4', language: 'en' }
  });
  assert.throws(() => audit(changed), /Wrong source|Expected values|AssertionError|The expression evaluated to a falsy value/);
});

test('exact printed attack text protects against similarly named printings', () => {
  const raichu = readCard('sm11', 'sm11-57');
  const rain = raichu.attacks.find((attack) => attack.name === 'Electro Rain');
  assert.ok(rain.text.includes('Discard any amount of Lightning Energy'));
  assert.ok(rain.text.includes('for each Energy you discarded'));
  assert.ok(!rain.cost.includes('Colorless'));
});
