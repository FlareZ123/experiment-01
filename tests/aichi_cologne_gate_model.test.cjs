'use strict';
const assert = require('node:assert/strict');
const {exactCologneGate, GROUPS} = require('../scripts/aichi_cologne_gate_model.cjs');

/** @returns {() => number} Seeded independent RNG. */
function makeRng(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

/**
 * Independently shuffle the physical category deck and classify separate
 * Colonge-and-Radiant access channels with no dependency on the exact classifier.
 */
function monteCarlo(count, seed) {
  const random = makeRng(seed);
  const cards = GROUPS.flatMap((qty, type) => Array(qty).fill(type));
  let valid = 0, access = 0, two = 0;
  for (let t = 0; t < count; t++) {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    const starting = cards.slice(0, 7);
    const prize = cards.slice(7, 13);
    const early = [...starting, cards[13]];
    if (!starting.some(c => c === 0 || c === 4 || c === 5)) continue;
    valid++;
    if (!starting.some(c => c === 4 || c === 5)) continue;
    const deck = cards.slice(14);
    const directRadiant = early.includes(0)
      || (deck.includes(0) && early.includes(1))
      || (prize.includes(0) && early.includes(2));
    const stoneReady = early.includes(6)
      && (early.includes(5) || (early.includes(7) && deck.includes(5)));
    const stoneCanFetchRadiant = deck.includes(0)
      || (prize.includes(0) && deck.includes(2));
    const useful = (early.includes(8) && (directRadiant || (stoneReady && stoneCanFetchRadiant)))
      || (deck.includes(8) && stoneReady && directRadiant);
    if (!useful) continue;
    access++;
    if (deck.filter(x => x === 3).length >= 2) two++;
  }
  return {access: access / valid, twoVmax: two / valid, validOpening: valid / count};
}
assert.deepEqual(GROUPS, [1, 5, 1, 4, 10, 3, 1, 4, 1, 30]);
const exact = exactCologneGate();
assert.ok(Math.abs(exact.access - 0.09425347695130508) < 1e-12);
assert.ok(Math.abs(exact.twoVmax - 0.09207585264820208) < 1e-12);
const mc = monteCarlo(600000, 34195076);
for (const key of ['access', 'twoVmax']) {
  assert.ok(Math.abs(exact[key] - mc[key]) < 0.002,
    key + ': exact ' + exact[key] + ', MC ' + mc[key]);
}
assert.ok(Math.abs(mc.validOpening - 0.8614093191287199) < 0.002);
console.log(JSON.stringify({exact, mc}, null, 2));
console.log('Exact hypothetical Cologne Gate access independently reproduced.');
