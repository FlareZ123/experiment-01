'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const data = require('../results/aichi-2026/full-decklists.json');
const absol = require('../resources/cards/en/me1.json').find(c => c.id === 'me1-86');
const calyrex = require('../resources/cards/en/swsh6.json').find(c => c.id === 'swsh6-75');

test('fixed Aichi Absol and Shadow Rider damage threshold', () => {
  assert.equal(absol.hp, '280');
  assert.equal(calyrex.hp, '320');
  assert.ok(calyrex.weaknesses.some(w => w.type === 'Darkness' && w.value === '×2'));
  assert.ok(absol.weaknesses.some(w => w.type === 'Grass' && w.value === '×2'));
  assert.equal(absol.attacks.find(a => a.name === 'Claw of Darkness').damage, '200');
  const geist = calyrex.attacks.find(a => a.name === 'Max Geist');
  assert.equal(geist.damage, '10+');
  assert.ok(geist.text.includes('30 more damage for each Psychic Energy'));
  assert.ok(calyrex.rules.some(rule => rule.includes('takes 3 Prize cards')));
  assert.ok(absol.rules.some(rule => rule.includes('takes 3 Prize cards')));
  assert.equal(200 * 2, 400);
  assert.equal(Math.ceil((280 - 10) / 30), 9);
  assert.equal(10 + 8 * 30, 250);
  assert.equal(10 + 9 * 30, 280);
  const ranks = data.decks.filter(d => d.archetype === 'Absol Garbodor').map(d => d.rank).sort((a,b)=>a-b);
  assert.deepEqual(ranks, [8,11,16,22]);
});
