'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {
  choose, fraction, originalRank6Counts, originalRank6Counterwindow
} = require('./agent40-rank6-speed-trigger-counterwindow.cjs');

const LABELS = ['thorns', 'speed', 'dce', 'guzma', 'thunder', 'single', 'other'];

/** @returns {{thorns:number,speed:number,dce:number,guzma:number,thunder:number,single:number,other:number}} */
function originalRank6PaymentCounts() {
  const source = require(path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json'));
  const deck = source.decks.find(row => row.rank === 6);
  assert(deck);
  const count = (name, set, number) => deck.cards
    .filter(card => card.name === name && card.printing.set === set &&
      card.printing.number === number)
    .reduce((sum, card) => sum + card.count, 0);
  const base = originalRank6Counts();
  const thunder = count('Thunder Mountain ♢', 'LOT', '191');
  const single = count('Capture Energy', 'RCL', '171') +
    count('Spiky Energy', 'JTG', '159');
  assert.equal(thunder, 1);
  assert.equal(single, 3);
  return {
    thorns: base.thorns,
    speed: base.speed,
    dce: base.dce,
    guzma: base.guzma,
    thunder,
    single,
    other: base.other - thunder - single
  };
}

/**
 * Enumerate physically distinct unordered draws of a given size, preserving
 * category multiplicities and passing their exact binomial weighting.
 *
 * @param {number[]} available
 * @param {number} picks
 * @param {(counts:number[], ways:bigint)=>void} visit
 */
function eachComposition(available, picks, visit) {
  const row = Array(available.length).fill(0);
  /** @param {number} i @param {number} remaining @param {bigint} ways */
  function walk(i, remaining, ways) {
    if (i === available.length - 1) {
      if (remaining > available[i]) return;
      row[i] = remaining;
      visit(row.slice(), ways * choose(available[i], remaining));
      return;
    }
    for (let n = 0; n <= Math.min(available[i], remaining); n += 1) {
      row[i] = n;
      walk(i + 1, remaining - n, ways * choose(available[i], n));
    }
  }
  walk(0, picks, 1n);
}

/**
 * Disjoint source turn-one policy branches:
 * A: Speed is in the first eight. Attach it on turn one, draw two, and see
 *    eleven cards by turn three. Pay with Speed+DCE, or Speed+another single
 *    Energy with Thunder Mountain reducing Volt Cyclone's Lightning cost.
 * B: No Speed in the first eight. Only nine cards are naturally seen by turn
 *    three. Pay with DCE alone under Thunder Mountain's one-Lightning discount.
 *
 * Both require two Thorns by the first eight and a held Guzma by the relevant
 * deadline. Opposing disruption, player choice, Item lock and native execution
 * are outside this source-card-location enumeration.
 *
 * @param {{thorns:number,speed:number,dce:number,guzma:number,
 * thunder:number,single:number,other:number}} counts
 * @param {number} openingSize
 * @param {number} firstWindowSize
 * @param {number} speedLaterSize
 * @param {number} noSpeedLaterSize
 * @returns {{speed:ReturnType<typeof fraction>,noSpeed:ReturnType<typeof fraction>,
 * union:ReturnType<typeof fraction>,unconditional:ReturnType<typeof fraction>,
 * ways:{speed:bigint,noSpeed:bigint}}}
 */
function exactTwoPaymentPaths(counts, openingSize, firstWindowSize,
  speedLaterSize, noSpeedLaterSize) {
  assert.equal(firstWindowSize, openingSize + 1);
  const available = LABELS.map(label => counts[label]);
  assert(available.every(n => Number.isSafeInteger(n) && n >= 0));
  const total = available.reduce((sum, n) => sum + n, 0);
  assert(total >= firstWindowSize + Math.max(speedLaterSize, noSpeedLaterSize));
  const initial = choose(total, firstWindowSize);
  const valid = choose(total, openingSize) - choose(total - counts.thorns, openingSize);
  assert(valid > 0n);

  let speedWays = 0n;
  let noSpeedWays = 0n;
  eachComposition(available, firstWindowSize, (early, earlyWays) => {
    if (early[0] < 2) return;
    const remaining = available.map((n, i) => n - early[i]);
    const isSpeed = early[1] >= 1;
    const laterSize = isSpeed ? speedLaterSize : noSpeedLaterSize;
    eachComposition(remaining, laterSize, (later, lateWays) => {
      const combined = early.map((n, i) => n + later[i]);
      if (combined[3] < 1) return;
      if (isSpeed) {
        const withDce = combined[2] >= 1;
        const withDiscountAndSecondEnergy =
          combined[4] >= 1 && combined[1] + combined[5] >= 2;
        if (withDce || withDiscountAndSecondEnergy) {
          speedWays += earlyWays * lateWays;
        }
      } else if (combined[2] >= 1 && combined[4] >= 1) {
        noSpeedWays += earlyWays * lateWays;
      }
    });
  });

  const speedDenom = initial * choose(total - firstWindowSize, speedLaterSize);
  const noSpeedDenom = initial * choose(total - firstWindowSize, noSpeedLaterSize);
  const speed = fraction(speedWays * choose(total, openingSize), speedDenom * valid);
  const noSpeed = fraction(noSpeedWays * choose(total, openingSize), noSpeedDenom * valid);
  const union = fraction(
    speed.numerator * noSpeed.denominator + noSpeed.numerator * speed.denominator,
    speed.denominator * noSpeed.denominator
  );
  const unconditional = fraction(
    union.numerator * valid,
    union.denominator * choose(total, openingSize)
  );
  return { speed, noSpeed, union, unconditional, ways: { speed: speedWays, noSpeed: noSpeedWays } };
}

/** @returns {ReturnType<typeof exactTwoPaymentPaths>} */
function originalRank6TwoPaymentPaths() {
  return exactTwoPaymentPaths(originalRank6PaymentCounts(), 7, 8, 3, 1);
}

module.exports = {
  originalRank6PaymentCounts, eachComposition,
  exactTwoPaymentPaths, originalRank6TwoPaymentPaths
};
