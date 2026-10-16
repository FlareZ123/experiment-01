'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const field = require('../results/aichi-2026/full-decklists.json');
const source = require('../results/als/new-moon-perfection-source-60.json');

/**
 * Count copies of one exactly named card in a source-preserved 60.
 * @param {{cards?:{name:string,count:number}[],entries?:{name_en:string,count:number}[]}} deck
 * @param {string} name
 * @returns {number}
 */
function copies(deck, name) {
  const rows = deck.cards || deck.entries.map(entry => ({
    name: entry.name_en, count: entry.count
  }));
  return rows.filter(card => card.name === name)
    .reduce((sum, card) => sum + card.count, 0);
}

test('new Moon source list has two distinct Stadium answers and a one-one shield', () => {
  assert.equal(source.counts.total, 60);
  assert.equal(source.entries.reduce((sum, card) => sum + card.count, 0), 60);
  for (const [name, expected] of [
    ['Lunatone', 1], ['Solrock', 1], ['Mewtwo & Mew-GX', 2],
    ['Sky Field', 2], ['Path to the Peak', 2], ['Silent Lab', 0]
  ]) {
    assert.equal(copies(source, name), expected, name);
  }
});

test('only ranks 9, 13, 15 and 32 of the published field contain Silent Lab', () => {
  const inventory = field.decks
    .filter(deck => copies(deck, 'Silent Lab') > 0)
    .map(deck => [deck.rank, copies(deck, 'Silent Lab')]);
  assert.deepEqual(inventory, [[9,2],[13,1],[15,1],[32,1]]);
});

test('Path to the Peak appears in seven published opponents with eight copies', () => {
  const inventory = field.decks
    .filter(deck => copies(deck, 'Path to the Peak') > 0)
    .map(deck => [deck.rank, copies(deck, 'Path to the Peak')]);
  assert.deepEqual(inventory, [[5,2],[9,1],[12,1],[15,1],[20,1],[21,1],[27,1]]);
  assert.equal(inventory.reduce((total, [,quantity]) => total + quantity, 0), 8);
});
