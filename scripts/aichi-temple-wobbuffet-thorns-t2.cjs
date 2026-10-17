'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { mulliganProbability } = require('./aichi_opening_audit.cjs');
const { bonusExactly, bonusAtLeast } = require('./aichi_bonus_draws.cjs');

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
 * only the first seven, optionally accepted setup bonus draws, and two
 * ordinary turn-start draws are inspected.
 *
 * @param {{size:number,opening:number,wobbuffet:number,v:number,vmax:number,psychic:number,other:number,basics:number}} profile
 * @param {number} [bonusDraws] Number of opposing mulligan bonuses accepted.
 */
function wobbuffetNaturalTurnTwo(profile, bonusDraws = 0) {
  const { size, opening, wobbuffet, v, vmax, psychic, other, basics } = profile;
  assert.equal(wobbuffet, 1);
  assert.equal(wobbuffet + v + vmax + psychic + other, size);
  assert.ok(basics >= wobbuffet + v);
  const maxBonuses = size === 60 && opening === 7 ? 45 : size - opening - 2;
  assert.ok(Number.isInteger(bonusDraws) && bonusDraws >= 0 && bonusDraws <= maxBonuses);
  const firstTurnOther = opening + bonusDraws;
  const afterDraw = size - firstTurnOther - 1;
  let favorable = 0n;
  let favorableWithoutPsychic = 0n;

  // With Wobbuffet fixed in the initial seven, the other first-turn cards
  // are a uniform subset of the other 59 physical cards.
  for (let vDraw = 1; vDraw <= Math.min(v, firstTurnOther); vDraw++) {
    for (let mDraw = 0; mDraw <= Math.min(vmax, firstTurnOther - vDraw); mDraw++) {
      for (let eDraw = 0; eDraw <= Math.min(psychic, firstTurnOther - vDraw - mDraw); eDraw++) {
        const oDraw = firstTurnOther - vDraw - mDraw - eDraw;
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

  const conditionalDenominator = choose(size - 1, firstTurnOther) * BigInt(afterDraw);
  const openingLegalCount = choose(size, opening) - choose(size - basics, opening);
  const numerator = favorable * BigInt(opening) * choose(size, opening);
  const denominator = conditionalDenominator * BigInt(size) * openingLegalCount;
  const divisor = gcd(numerator, denominator);

  return {
    bonusDraws,
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

/**
 * Exact source-deck opponent mulligan-offer distribution is weighted into
 * the restricted Wobbuffet setup event. Accept every offer but cap at 45 so
 * both ordinary turn draws remain possible.
 * @param {number} opponentBasics
 * @param {Parameters<typeof wobbuffetNaturalTurnTwo>[0]} profile
 */
function weightedVersusOpponent(opponentBasics, profile) {
  assert.ok(Number.isInteger(opponentBasics) && opponentBasics >= 1 && opponentBasics <= 60);
  assert.equal(profile.size, 60);
  const pA = mulliganProbability(opponentBasics);
  const pB = mulliganProbability(profile.basics);
  let percent = 0;
  for (let d = 0; d < 45; d++) {
    percent += bonusExactly(pA, pB, d) * wobbuffetNaturalTurnTwo(profile, d).percent;
  }
  percent += bonusAtLeast(pA, pB, 45) * wobbuffetNaturalTurnTwo(profile, 45).percent;
  return {
    opponentBasics,
    candidateBasics: profile.basics,
    percent,
    noBonusPercent: wobbuffetNaturalTurnTwo(profile).percent,
    atLeastOneBonusOffer: bonusAtLeast(pA, pB, 1),
    allOfferedBonusesTaken: true,
    tailCap: 45,
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
    noBonus: wobbuffetNaturalTurnTwo(sourceTempleProfile()),
    bonusScenarios: [0, 1, 2, 3, 4, 5].map(d => wobbuffetNaturalTurnTwo(sourceTempleProfile(), d)),
    ironThornsFourBasics: weightedVersusOpponent(4, sourceTempleProfile()),
  }, null, 2));
}

module.exports = { choose, wobbuffetNaturalTurnTwo, sourceTempleProfile, weightedVersusOpponent };
