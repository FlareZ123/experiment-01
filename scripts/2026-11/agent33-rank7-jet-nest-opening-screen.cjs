'use strict';

const COUNTS = Object.freeze({
  jet: 1, nest: 1, wobbuffet: 3, otherBasics: 9, remaining: 46
});

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(k) ||
      n < 0 || k < 0 || k > n) return 0n;
  let value = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    value = value * BigInt(n - Math.min(k, n - k) + i) / BigInt(i);
  }
  return value;
}

/**
 * Count allocations of one printed identity into hand, Prizes, two draws,
 * and the remaining deck. Hand/Prize/draw groups are unordered, with
 * original physical cards treated as distinguishable within categories.
 * @param {number} categorySize
 * @param {number} hand
 * @param {number} prize
 * @param {number} draw
 * @returns {bigint}
 */
function allocation(categorySize, hand, prize, draw) {
  return choose(categorySize, hand) *
    choose(categorySize - hand, prize) *
    choose(categorySize - hand - prize, draw);
}

/** @param {number} zone @returns {[number, number, number]} */
function occupied(zone) {
  return [Number(zone === 0), Number(zone === 1), Number(zone === 2)];
}

/**
 * Exhaust all valid unsequenced category placements for 7 opening cards,
 * 6 hidden Prizes, and the first 2 natural draws. The original source 60
 * contains 1 Jet Energy, 1 Nest Ball, 3 Wobbuffet and 9 other Basics.
 *
 * The event is a resource LOCATION SCREEN, conditional on a legal initial
 * seven: both singletons available through those nine visible cards and
 * at least one Wobbuffet still in the remaining deck. It says nothing
 * about Item lock being active, opposing Artazon availability, being able
 * to attach Jet, or the payoff and winner of a game.
 *
 * @returns {{denominator:bigint, numerator:bigint,
 *   strictOtherBasicNumerator:bigint, sourceBasicCount:number}}
 */
function calculateWindow(extraVsSeeker, extraRobo = 0) {
  const { jet, nest, wobbuffet, otherBasics, remaining } = COUNTS;
  if (!Number.isSafeInteger(extraVsSeeker) ||
      extraVsSeeker < 0 || extraVsSeeker > 3 ||
      !Number.isSafeInteger(extraRobo) || extraRobo < 0 || extraRobo > 2) {
    throw new RangeError('Only three original VS Seeker and two Robo Substitute copies are eligible');
  }
  const itemCopies = nest + extraVsSeeker + extraRobo;
  const otherCopies = remaining - extraVsSeeker - extraRobo;
  const total = jet + nest + wobbuffet + otherBasics + remaining;
  const denominator =
    (choose(total, 7) - choose(total - wobbuffet - otherBasics, 7)) *
    choose(total - 7, 6) * choose(total - 13, 2);
  let numerator = 0n;
  let strictOtherBasicNumerator = 0n;

  // Jet must appear in the seven opening cards or the two ordinary draws.
  // At least one of the eligible Item copies must also appear there.
  // Item access alone is not proof of an independently playable Item.
  for (const jetZone of [0, 2]) {
    const [jh, jp, jd] = occupied(jetZone);
    for (let ih = 0; ih <= itemCopies; ih++) {
      for (let ip = 0; ip <= itemCopies - ih; ip++) {
        for (let id = 0; id <= Math.min(2, itemCopies - ih - ip); id++) {
          if (ih + id === 0) continue;
          const itemWeight = allocation(itemCopies, ih, ip, id);
          for (let wh = 0; wh <= wobbuffet; wh++) {
            for (let wp = 0; wp <= wobbuffet - wh; wp++) {
              for (let wd = 0; wd <= Math.min(2, wobbuffet - wh - wp); wd++) {
                if (wobbuffet - wh - wp - wd < 1) continue;
                const wweight = allocation(wobbuffet, wh, wp, wd);
                for (let bh = 0; bh <= Math.min(7, otherBasics); bh++) {
                  if (bh + wh === 0) continue;
                  for (let bp = 0; bp <= Math.min(6, otherBasics - bh); bp++) {
                    for (let bd = 0; bd <= Math.min(2, otherBasics - bh - bp); bd++) {
                      const rh = 7 - jh - ih - wh - bh;
                      const rp = 6 - jp - ip - wp - bp;
                      const rd = 2 - jd - id - wd - bd;
                      if (Math.min(rh, rp, rd) < 0 ||
                          rh + rp + rd > otherCopies) continue;
                      const ways = itemWeight * wweight *
                        allocation(otherBasics, bh, bp, bd) *
                        allocation(otherCopies, rh, rp, rd);
                      numerator += ways;
                      if (bh > 0) strictOtherBasicNumerator += ways;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return {denominator, numerator, strictOtherBasicNumerator,
    sourceBasicCount:wobbuffet+otherBasics, earlyItemCopies:itemCopies};
}

/** @returns {ReturnType<typeof calculateWindow>} */
function calculate() {
  return calculateWindow(0);
}

/**
 * A permissive LOCATION upper screen if any of rank7's one Nest Ball or
 * three VS Seeker cards could become a live Item payoff after Jet.
 * The source still needs a discarded Faba for the newly verified VS line;
 * this extra tactical condition is deliberately not included.
 * @returns {ReturnType<typeof calculateWindow>}
 */
function calculateUnion() {
  return calculateWindow(3);
}

/**
 * More plausible immediate Item families on an early locked turn before the
 * original-source discard contains a Supporter: one Nest and two Robo.
 * Each still requires its ordinary board/item conditions and opposing
 * Artazon/lock state, which this pure calculation does not observe.
 * @returns {ReturnType<typeof calculateWindow>}
 */
function calculateNestOrRobo() {
  return calculateWindow(0,2);
}

/**
 * Permissive LOCATION screen for one Nest, three VS Seeker and two Robo.
 * Additional tactical payability of Robo needs an actual open Bench, and VS
 * needs an eligible Supporter in the owner's public discard; neither is
 * implied by the count.
 * @returns {ReturnType<typeof calculateWindow>}
 */
function calculateAllItems() {
  return calculateWindow(3,2);
}

if (require.main === module) {
  const original = calculate();
  const augmented = calculateUnion();
  const allItems = calculateAllItems();
  const nestOrRobo = calculateNestOrRobo();
  const stringify = r => ({
    ...Object.fromEntries(Object.entries(r).map(([k,v]) =>
      [k,typeof v === 'bigint' ? v.toString() : v])),
    percent:Number(r.numerator * 100000000000n / r.denominator) / 1000000000,
    nonWobbStarterPercent:Number(r.strictOtherBasicNumerator * 100000000000n /
      r.denominator) / 1000000000
  });
  process.stdout.write(JSON.stringify({
    jetNestOnly:stringify(original),
    jetWithNestOrVsSeeker:stringify(augmented),
    jetWithNestVsOrRobo:stringify(allItems),
    jetWithNestOrRobo:stringify(nestOrRobo),
    competitiveQualifiedGames:0
  }, null, 2) + '\n');
}
module.exports = { COUNTS, choose, allocation, calculate,
  calculateWindow, calculateUnion, calculateAllItems,
  calculateNestOrRobo };
