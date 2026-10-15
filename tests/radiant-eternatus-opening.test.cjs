'use strict';
const assert = require('node:assert/strict');
const { classify, exactOpening, GROUPS } = require('../scripts/radiant-eternatus-opening.cjs');

/** Deterministic XORShift32 random values between zero and one. */
function makeRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * Independent uniform-deal Monte Carlo: opening 7, Prizes 6, first draw 1.
 * @param {boolean} includeTurnDraw
 * @param {number} iterations
 * @param {number} seed
 */
function monteCarlo(includeTurnDraw, iterations, seed) {
  const random = makeRandom(seed);
  const counts = { valid: 0, access: 0, twoVmax: 0, forcedActive: 0 };
  const deck = GROUPS.flatMap((quantity, i) => Array(quantity).fill(i));
  for (let trial = 0; trial < iterations; trial++) {
    for (let k = deck.length - 1; k > 0; k--) {
      const j = Math.floor(random() * (k + 1));
      [deck[k], deck[j]] = [deck[j], deck[k]];
    }
    const opening = Array(GROUPS.length).fill(0);
    const prizes = Array(GROUPS.length).fill(0);
    const drawn = Array(GROUPS.length).fill(0);
    for (let i = 0; i < 7; i++) opening[deck[i]]++;
    for (let i = 7; i < 13; i++) prizes[deck[i]]++;
    if (includeTurnDraw) drawn[deck[13]]++;
    if (!opening[0] && !opening[4]) continue;
    counts.valid++;
    const result = classify(opening, prizes, drawn);
    if (result.forcedEternatusActive) counts.forcedActive++;
    if (result.route) counts.access++;
    if (result.route && result.twoVmax) counts.twoVmax++;
  }
  return {
    validProbability: counts.valid / iterations,
    access: counts.access / counts.valid,
    twoVmax: counts.twoVmax / counts.valid,
    forcedActive: counts.forcedActive / counts.valid
  };
}

assert.deepEqual(GROUPS, [1, 5, 1, 4, 13, 36]);
assert.equal(classify([1, 0, 0, 0, 0, 6], [0, 0, 0, 0, 0, 6], [0, 0, 0, 0, 1, 0]).route, null);
assert.equal(classify([0, 1, 0, 0, 1, 5], [0, 0, 0, 0, 0, 6], [0, 0, 0, 0, 0, 0]).route, 'search-item');
assert.equal(classify([0, 0, 1, 0, 1, 5], [1, 0, 0, 0, 0, 5], [0, 0, 0, 0, 0, 0]).route, 'heavy-ball');
assert.equal(classify([1, 0, 0, 2, 1, 3], [0, 0, 0, 2, 0, 4], [0, 0, 0, 0, 0, 0]).twoVmax, false);
assert.equal(classify([0, 0, 0, 0, 0, 7], [0, 0, 0, 0, 0, 6], [1, 0, 0, 0, 0, 0]).route, null);

for (const includeTurnDraw of [false, true]) {
  const exact = exactOpening(includeTurnDraw);
  assert.ok(Math.abs(exact.validProbability - 0.8614093191287199) < 1e-12);
  const expected = includeTurnDraw ? [0.5220484476786743, 0.5065943762478146] : [0.47282215963400764, 0.46205832601419733];
  assert.ok(Math.abs(exact.access - expected[0]) < 1e-12);
  assert.ok(Math.abs(exact.twoVmax - expected[1]) < 1e-12);
  assert.ok(Math.abs(Object.values(exact.routes).reduce((x, y) => x + y, 0) - exact.access) < 1e-12);
  assert.ok(Math.abs(Object.values(exact.twoVmaxRoutes).reduce((x, y) => x + y, 0) - exact.twoVmax) < 1e-12);
  const monte = monteCarlo(includeTurnDraw, 200000, includeTurnDraw ? 812345 : 512345);
  for (const key of ['validProbability', 'access', 'twoVmax', 'forcedActive']) {
    assert.ok(Math.abs(monte[key] - exact[key]) < 0.006, key + ': exact=' + exact[key] + ', sampled=' + monte[key]);
  }
  console.log((includeTurnDraw ? 'After first-turn draw' : 'Setup only') + ': exact access ' + (100*exact.access).toFixed(4) + '%, exact two-target ' + (100*exact.twoVmax).toFixed(4) + '%, Monte Carlo ' + JSON.stringify(monte));
}
console.log('All Radiant Eternatus opening-state tests passed.');
