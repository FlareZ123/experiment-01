'use strict';

const assert = require('node:assert/strict');
const { choose, sourceCandidates } = require('./aichi-radiant-start-tradeoff.cjs');
const { sourceTurnProfiles } = require('./aichi-radiant-wobbuffet-turnone.cjs');

const KEYS = ['radiant', 'search', 'heavy', 'vmax', 'wobbuffet', 'shadowV', 'otherBasic', 'other'];

/** Split the known source profile to distinguish Shadow Rider V from other Basic starters. */
function expandProfile(label) {
  const p = sourceTurnProfiles()[label];
  const shadowV = sourceCandidates()[label].shadowV;
  const list = [p[0], p[1], p[2], p[3], p[4], shadowV, p[5] - shadowV, p[6]];
  assert.equal(list.reduce((a, b) => a + b, 0), 60);
  assert.ok(list.every(n => Number.isInteger(n) && n >= 0));
  return list;
}

/**
 * Enumerate mutually exclusive category counts with exact combinatorial weights.
 * @param {number[]} available
 * @param {number} count
 * @param {(counts:number[], multiplicity:bigint)=>void} emit
 */
function selectCategories(available, count, emit) {
  const current = Array(available.length).fill(0);
  function visit(i, left, weight) {
    if (i === available.length) {
      if (left === 0) emit(current.slice(), weight);
      return;
    }
    for (let n = 0; n <= Math.min(available[i], left); n += 1) {
      current[i] = n;
      visit(i + 1, left - n, weight * choose(available[i], n));
    }
  }
  visit(0, count, 1n);
}

/**
 * Counts two distinct ways to be structurally VMAX-ready by the start of turn 2:
 * (a) naturally bench Shadow Rider V on turn 1 and hold VMAX by turn 2;
 * (b) have the first-turn restricted direct Radiant Gate access and 2 VMAX in deck,
 *     excluding forced-Active Wobbuffet before any legal switch.
 *
 * Item discard costs, opponent locks, strategic value, and gameplay are omitted.
 * The player has seven opening cards, random Prizes, T1 draw and T2 draw.
 * @param {number[]} groups Eight disjoint card categories, total <= 60.
 * @param {{openingSize?:number,prizeCount?:number}} [options]
 */
function calculate(groups, options = {}) {
  const h = options.openingSize ?? 7;
  const q = options.prizeCount ?? 6;
  const N = groups.reduce((a, b) => a + b, 0);
  assert.equal(groups.length, KEYS.length);
  assert.ok(groups.every(n => Number.isInteger(n) && n >= 0));
  assert.ok(N <= 60 && h >= 1 && q >= 0 && N - h - q >= 2);
  const tally = {valid:0n, natural:0n, gate:0n, overlap:0n, either:0n, gateBlocked:0n};

  selectCategories(groups, h, (opening, hWeight) => {
    if (opening[0] + opening[4] + opening[5] + opening[6] === 0) return;
    const afterOpening = groups.map((n, i) => n - opening[i]);
    selectCategories(afterOpening, q, (prizes, pWeight) => {
      const afterPrizes = afterOpening.map((n, i) => n - prizes[i]);
      for (let firstDraw = 0; firstDraw < groups.length; firstDraw += 1) {
        if (!afterPrizes[firstDraw]) continue;
        const weight = hWeight * pWeight * BigInt(afterPrizes[firstDraw]);
        const hand = opening.map((n, i) => n + Number(i === firstDraw));
        const deck = afterPrizes.map((n, i) => n - Number(i === firstDraw));
        const possibleSecondDraws = N - h - q - 1;

        const shadowVReady = hand[5] >= 1;
        const naturalSecondDrawCount = shadowVReady
          ? (hand[3] >= 1 ? possibleSecondDraws : deck[3])
          : 0;

        const alternateStarter = opening[4] + opening[5] + opening[6] > 0;
        let gateRoute = false;
        if (opening[0] && alternateStarter) gateRoute = true;
        else if (firstDraw === 0 && alternateStarter) gateRoute = true;
        else if (deck[0] && alternateStarter && hand[1]) gateRoute = true;
        else if (prizes[0] && alternateStarter && hand[2]) gateRoute = true;
        const gateHasTwoVMAX = gateRoute && deck[3] >= 2;
        const forcedWobbuffet = opening[4] > 0 && opening[5] + opening[6] === 0;
        const gateSecondDrawCount = gateHasTwoVMAX && !forcedWobbuffet
          ? possibleSecondDraws : 0;
        const overlapCount = gateSecondDrawCount ? naturalSecondDrawCount : 0;

        tally.valid += weight * BigInt(possibleSecondDraws);
        tally.natural += weight * BigInt(naturalSecondDrawCount);
        tally.gate += weight * BigInt(gateSecondDrawCount);
        tally.overlap += weight * BigInt(overlapCount);
        tally.either += weight * BigInt(naturalSecondDrawCount + gateSecondDrawCount - overlapCount);
        if (gateHasTwoVMAX && forcedWobbuffet) {
          tally.gateBlocked += weight * BigInt(possibleSecondDraws);
        }
      }
    });
  });
  assert.ok(tally.valid > 0n);
  assert.equal(tally.either, tally.natural + tally.gate - tally.overlap);
  const d = Number(tally.valid);
  return {
    ...Object.fromEntries(Object.entries(tally).map(([k, v]) => [k, Number(v) / d])),
    denominator: tally.valid.toString(),
    numerators: Object.fromEntries(Object.entries(tally).map(([k, v]) => [k, v.toString()])),
  };
}

module.exports = { calculate, expandProfile, KEYS };

if (require.main === module) {
  for (const name of ['champion', 'hood', 'temple']) {
    console.log(JSON.stringify({name, ...calculate(expandProfile(name))}));
  }
}
