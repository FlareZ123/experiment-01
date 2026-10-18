'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const {decks} = require('../results/aichi-2026/full-decklists.json');
const clefairy = require('../resources/cards/en/sv9.json').find(c => c.id === 'sv9-56');
const hood = require('../resources/cards/en/sm10.json').find(c => c.id === 'sm10-186');
const regidrago = require('../resources/cards/en/swsh12.json').find(c => c.id === 'swsh12-136');
test('conditional Fairy Zone versus Hood damage envelope at rank32', () => {
  assert.ok(clefairy.abilities.some(a => a.name === 'Fairy Zone' && /Weakness/.test(a.text)));
  assert.ok(hood.rules.some(t => t.includes("opponent's Abilities")));
  assert.equal(regidrago.hp, '280');
  assert.ok(!regidrago.weaknesses?.length);
  assert.equal(150 * 2, 300);
  assert.equal(200 * 2, 400);
  assert.ok(150 < 280 && 200 < 280);
  const d = decks.find(x => x.rank === 32);
  assert.equal(d.cards.find(x => x.name === 'Stealthy Hood')?.count, 1);
  assert.equal(d.cards.find(x => x.name === 'Budew')?.count, 2);
});
