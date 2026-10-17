'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let result = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    result = result * BigInt(n - i + 1) / BigInt(i);
  }
  return result;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

/**
 * Exact no-search T2 Underworld Door resource opportunity with Wobbuffet
 * selected as starting Active. Six random Prizes are marginalized out:
 * only the first seven and subsequent two ordinary draws are inspected.
 *
 * @param {{size:number,opening:number,wobbuffet:number,v:number,vmax:number,psychic:number,other:number,basics:number}} profile
 */
function wobbuffetNaturalTurnTwo(profile) {
  const { size, opening, wobbuffet, v, vmax, psychic, other, basics } = profile;
  assert.equal(wobbuffet, 1);
  assert.equal(wobbuffet + v + vmax + psychic + other, size);
  assert.ok(basics >= wobbuffet + v);
  const afterDraw = size - opening - 1;
  let favorable = 0n;
  let favorableWithoutPsychic = 0n;

  // Wobbuffet is in the opening seven. Of the first eight seen cards,
  // seven are independently drawn from the other 59 physical cards.
  for (let vDraw = 1; vDraw <= Math.min(v, opening); vDraw++) {
    for (let mDraw = 0; mDraw <= Math.min(vmax, opening - vDraw); mDraw++) {
      for (let eDraw = 0; eDraw <= Math.min(psychic, opening - vDraw - mDraw); eDraw++) {
        const oDraw = opening - vDraw - mDraw - eDraw;
        const weight = choose(v, vDraw) * choose(vmax, mDraw)
          * choose(psychic, eDraw) * choose(other, oDraw);
        let successNext = 0;
        if (mDraw > 0 && eDraw > 0) successNext = afterDraw;
        else if (mDraw === 0 && eDraw > 0) successNext = vmax;
        else if (eDraw === 0 && mDraw > 0) successNext = psychic;
        favorable += weight * BigInt(successNext);
        favorableWithoutPsychic += weight * BigInt(mDraw > 0 ? afterDraw : vmax);
      }
    }
  }

  const conditionalDenominator = choose(size - 1, opening) * BigInt(afterDraw);
  const openingLegalCount = choose(size, opening) - choose(size - basics, opening);
  const numerator = favorable * BigInt(opening) * choose(size, opening);
  const denominator = conditionalDenominator * BigInt(size) * openingLegalCount;
  const divisor = gcd(numerator, denominator);

  return {
    fraction: String(numerator / divisor) + '/' + String(denominator / divisor),
    percent: 100 * Number(numerator) / Number(denominator),
    wobbuffetOpeningPercent: 100 * Number(BigInt(opening) * choose(size, opening))
      / Number(BigInt(size) * openingLegalCount),
    withoutPsychicPercent: 100
      * Number(favorableWithoutPsychic * BigInt(opening) * choose(size, opening))
      / Number(denominator),
    conditionalOnWobbuffetPercent: 100 * Number(favorable) / Number(conditionalDenominator),
  };
}

/** @returns {Parameters<typeof wobbuffetNaturalTurnTwo>[0]} */
function sourceTempleProfile() {
  const source = require(path.resolve(__dirname, '../results/aichi-2026/candidate-temple-shadow-rider.json'));
  /** @param {string} name */
  const count = name => source.cards.filter(card => card.name === name)
    .reduce((total, card) => total + card.count, 0);
  const size = source.cards.reduce((total, card) => total + card.count, 0);
  const wobbuffet = count('Wobbuffet');
  const v = count('Shadow Rider Calyrex V');
  const vmax = count('Shadow Rider Calyrex VMAX');
  const psychic = count('Psychic Energy');
  const basics = source.category_counts['Pokémon'] - vmax;
  const profile = {
    size, opening: 7, wobbuffet, v, vmax, psychic,
    other: size - wobbuffet - v - vmax - psychic, basics,
  };
  assert.deepEqual(profile, {
    size: 60, opening: 7, wobbuffet: 1, v: 4, vmax: 3,
    psychic: 11, other: 41, basics: 15,
  });
  return profile;
}

if (require.main === module) {
  console.log(JSON.stringify({
    source: 'Temple v1',
    profile: sourceTempleProfile(),
    result: wobbuffetNaturalTurnTwo(sourceTempleProfile()),
  }, null, 2));
}

module.exports = { choose, wobbuffetNaturalTurnTwo, sourceTempleProfile };
