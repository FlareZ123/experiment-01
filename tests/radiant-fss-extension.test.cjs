'use strict';
const assert = require('node:assert/strict');
const { computeForestSealIncrement, GROUPS } = require('../scripts/radiant-fss-extension.cjs');

function seededRng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/** Independent physical-card Monte Carlo; does not use the combinatorial classifier. */
function estimate(includeTurnDraw, trials, seed) {
  const random = seededRng(seed);
  const shuffled = GROUPS.flatMap((count, category) => Array(count).fill(category));
  let valid = 0, incremental = 0, incrementalTwo = 0, forestDirect = 0, forestPrized = 0;
  for (let i = 0; i < trials; i++) {
    for (let k = 59; k >= 1; k--) {
      const j = Math.floor(random() * (k + 1));
      [shuffled[k], shuffled[j]] = [shuffled[j], shuffled[k]];
    }
    const opening = shuffled.slice(0, 7);
    const early = includeTurnDraw ? [...opening, shuffled[13]] : opening;
    if (!opening.some((c) => c === 0 || c === 4 || c === 5)) continue;
    valid++;
    const otherBasicInitial = opening.includes(4) || opening.includes(5);
    const radiantPosition = shuffled.indexOf(0);
    const radiantInHand = radiantPosition < 7 || (includeTurnDraw && radiantPosition === 13);
    const radiantPrized = radiantPosition >= 7 && radiantPosition <= 12;
    const radiantInDeck = radiantPosition >= (includeTurnDraw ? 14 : 13);
    const normalRoute = otherBasicInitial && (radiantInHand || (radiantInDeck && early.includes(1)) || (radiantPrized && early.includes(2)));
    if (normalRoute || !otherBasicInitial || !early.includes(6)) continue;
    const deckCards = shuffled.slice(includeTurnDraw ? 14 : 13);
    const vOnBoard = early.includes(5) || (early.includes(7) && deckCards.includes(5));
    if (!vOnBoard) continue;
    const direct = radiantInDeck;
    const prized = radiantPrized && deckCards.includes(2);
    if (!direct && !prized) continue;
    incremental++;
    if (direct) forestDirect++;
    if (prized) forestPrized++;
    if (deckCards.filter((c) => c === 3).length >= 2) incrementalTwo++;
  }
  return {
    valid: valid / trials,
    increment: incremental / valid,
    twoIncrement: incrementalTwo / valid,
    direct: forestDirect / valid,
    prize: forestPrized / valid
  };
}

assert.deepEqual(GROUPS, [1, 5, 1, 4, 10, 3, 1, 4, 31]);
for (const includeTurnDraw of [false, true]) {
  const exact = computeForestSealIncrement(includeTurnDraw);
  const additional = exact.additionalDirect + exact.additionalPrizeRescue;
  const twoAdditional = exact.additionalTwoTargetDirect + exact.additionalTwoTargetPrizeRescue;
  const expected = includeTurnDraw ? [0.5632836062140792, 0.5466603454943688] : [0.5092805662213461, 0.497741690455413];
  assert.ok(Math.abs(exact.extendedAccess - expected[0]) < 1e-12);
  assert.ok(Math.abs(exact.extendedTwoTarget - expected[1]) < 1e-12);
  const sampled = estimate(includeTurnDraw, 300000, includeTurnDraw ? 601235 : 601236);
  for (const [key, target] of [['increment', additional], ['twoIncrement', twoAdditional], ['direct', exact.additionalDirect], ['prize', exact.additionalPrizeRescue]]) {
    assert.ok(Math.abs(sampled[key] - target) < 0.003, key + ': exact=' + target + ', sampled=' + sampled[key]);
  }
  console.log(JSON.stringify({ phase: includeTurnDraw ? 'first turn after draw' : 'pre-turn setup', exact, sampled }));
}
console.log('Forest Seal Stone marginal access exact-vs-shuffle checks passed.');
