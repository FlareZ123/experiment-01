'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const manifest = require('../results/aichi-2026/full-decklists.json');

/**
 * @param {number} rank
 * @returns {object}
 */
function deck(rank) {
  const selected = manifest.decks.find((entry) => entry.rank === rank);
  assert.ok(selected, `Published rank ${rank} missing`);
  return selected;
}

/**
 * @param {object} selected
 * @param {string} cardName
 * @returns {number}
 */
function copies(selected, cardName) {
  return selected.cards
    .filter((entry) => entry.name === cardName)
    .reduce((sum, entry) => sum + entry.count, 0);
}

test('all published Aichi 2026 decks remain complete and missing ranks explicit', () => {
  assert.equal(manifest.decks.length, 29);
  assert.deepEqual(manifest.missing_full_lists.map((entry) => entry.rank), [23, 25, 28]);
  for (const selected of manifest.decks) {
    const total = selected.cards.reduce((sum, entry) => sum + entry.count, 0);
    assert.equal(total, 60, `Rank ${selected.rank} source total`);
  }
});

test('rank 22 registered list preserves Wally, not intended Hisuian Heavy Ball', () => {
  const registered = deck(22);
  assert.equal(registered.player, 'Haruya Mori');
  assert.equal(copies(registered, 'Vikavolt V'), 2);
  assert.equal(copies(registered, 'Wally'), 1);
  assert.equal(copies(registered, 'Hisuian Heavy Ball'), 0);
  const wally = registered.cards.find((entry) => entry.name === 'Wally');
  assert.deepEqual(wally.printing, { set: 'ROS', number: '94', language: 'en' });
});

test('do not apply the rank 22 discrepancy to a different Absol deck', () => {
  const other = deck(8);
  assert.equal(copies(other, 'Wally'), 1);
  assert.equal(copies(other, 'Hisuian Heavy Ball'), 1);
  assert.equal(copies(other, 'Vikavolt V'), 0);
});
