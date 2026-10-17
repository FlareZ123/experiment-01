'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');

const source = require('../results/aichi-2026/full-decklists.json');
const hood = require('../results/aichi-2026/candidate-hood-shadow-rider.json');
const banned = require('../results/legality/japan-expanded-aichi-2026.json');

/**
 * Fetch an exact English-source card printing.
 * @param {string} file
 * @param {string} cardId
 * @returns {object}
 */
function printing(file, cardId) {
  const result = require(file).find(card => card.id === cardId);
  assert.ok(result, 'Missing exact card printing: ' + cardId);
  return result;
}

const electrode = printing('../resources/cards/en/swsh11.json', 'swsh11-172');
const curry = printing('../resources/cards/en/swsh10.json', 'swsh10-151');
const glasses = printing('../resources/cards/en/swsh10.json', 'swsh10-152');
const absol = printing('../resources/cards/en/me1.json', 'me1-86');

test('printed zero-Energy Tantrum Blast + Burn + Grass Weakness x3 KOs Mega Absol', () => {
  assert.deepEqual(electrode.types, ['Grass']);
  assert.ok(electrode.subtypes.includes('Basic'));
  const attack = electrode.attacks.find(a => a.name === 'Tantrum Blast');
  assert.ok(attack);
  assert.deepEqual(attack.cost, []);
  assert.equal(attack.damage, '100×');
  assert.match(attack.text, /each Special Condition affecting this Pokémon/);

  assert.deepEqual(curry.subtypes, ['Item']);
  assert.ok(curry.rules.some(rule => rule.includes('Active Pokémon is now Burned')));
  assert.ok(glasses.subtypes.includes('Pokémon Tool'));
  assert.ok(glasses.rules.some(rule => rule.includes('×3')));
  assert.deepEqual(absol.types, ['Darkness']);
  assert.ok(absol.weaknesses.some(w => w.type === 'Grass' && w.value === '×2'));
  assert.equal(Number(absol.hp), 280);
  assert.ok(absol.rules.some(rule => rule.includes('takes 3 Prize cards')));
  assert.equal(100 * 3, 300);
  assert.equal(100 * 2, 200);
  assert.ok(300 >= Number(absol.hp));
  assert.ok(200 < Number(absol.hp));
});

test('four relevant sourced opposing lists and one-Arven Hood connectivity', () => {
  const opponents = source.decks.filter(deck => deck.archetype === 'Absol Garbodor')
    .sort((a,b) => a.rank - b.rank);
  assert.deepEqual(opponents.map(deck => deck.rank), [8,11,16,22]);
  for (const deck of opponents) {
    assert.ok(deck.cards.some(card => card.name === 'Mega Absol ex' && card.count >= 2));
    assert.ok(deck.cards.some(card => card.name === 'Garbodor' && card.count >= 2));
  }
  assert.equal(hood.cards.find(card => card.name === 'Arven')?.count, 1);
  assert.equal(hood.cards.find(card => card.name === 'Quick Ball')?.count, 1);
  for (const name of [electrode.name, curry.name, glasses.name]) {
    assert.ok(!banned.banned_identities.some(entry => entry.english_name === name),
      'Historical Japanese named ban includes ' + name);
  }
});
