'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const source = require('../results/aichi-2026/full-decklists.json');
const rank6 = source.decks.find(deck => deck.rank === 6);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let out = 1n;
  for (let i = 1; i <= k; i++) {
    out = out * BigInt(n - k + i) / BigInt(i);
  }
  return out;
}

/** @param {string} name @returns {number} */
function copies(name) {
  return rank6.cards.filter(card => card.name === name)
    .reduce((count, card) => count + card.count, 0);
}

const thorns = copies('Iron Thorns ex');
const speed = copies('Speed Lightning Energy');
const basicValidSeven = choose(60, 7) - choose(60 - thorns, 7);
const validSevenPlusDraw = basicValidSeven * 53n;
const noSpeedWithBasicSeven =
  choose(60 - speed, 7) - choose(60 - thorns - speed, 7);
const noSpeedThroughDraw = noSpeedWithBasicSeven * BigInt(53 - speed);
const speedByFirstDraw = validSevenPlusDraw - noSpeedThroughDraw;

test('source rank6 60 has exactly four Basics and four Speed Lightning', () => {
  assert.equal(rank6.cards.reduce((sum, card) => sum + card.count, 0), 60);
  assert.equal(thorns, 4);
  assert.equal(speed, 4);
  assert.equal(rank6.cards.filter(card => card.category === 'Pokémon')
    .reduce((sum, card) => sum + card.count, 0), 4);
});

test('exact original-seven plus opening draw card-location screen', () => {
  assert.equal(validSevenPlusDraw, 8177344560n);
  assert.equal(noSpeedThroughDraw, 4808509160n);
  assert.equal(speedByFirstDraw, 3368835400n);
  assert.ok(Math.abs(Number(speedByFirstDraw) /
    Number(validSevenPlusDraw) - 0.41197180518464055) < 1e-14);
  assert.ok(Math.abs(1 - Number(noSpeedWithBasicSeven) /
    Number(basicValidSeven) - 0.36396950356706015) < 1e-14);
});

test('seven independent Basic-valid opening hands is an illustrative null', () => {
  const chanceNone = Math.pow(Number(noSpeedThroughDraw) /
    Number(validSevenPlusDraw), 7);
  assert.ok(Math.abs(chanceNone - 0.024310117115804136) < 1e-14);
});

console.log(JSON.stringify({
  sourceRank: rank6.rank, basicCount: thorns, speedCount: speed,
  basicValidSevenPlusDraw: String(validSevenPlusDraw),
  speedByEighthCard: String(speedByFirstDraw),
  speedGivenBasicValidSeven: Number(speedByFirstDraw) /
    Number(validSevenPlusDraw),
  warning: 'Card-location only. No archived source owner hands were recovered.'
}, null, 2));
