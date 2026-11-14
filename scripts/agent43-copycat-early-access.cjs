'use strict';

const chooseCache = new Map();
function choose(n, k) {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(k) || k < 0 || k > n) return 0n;
  const key = n + ':' + k;
  if (chooseCache.has(key)) return chooseCache.get(key);
  k = Math.min(k, n - k);
  let value = 1n;
  for (let i = 1; i <= k; i++) value = value * BigInt(n - k + i) / BigInt(i);
  chooseCache.set(key, value);
  return value;
}
function compositions(total, bounds) {
  const result = [], current = Array(bounds.length).fill(0);
  function visit(index, remaining) {
    if (index === bounds.length - 1) {
      if (remaining <= bounds[index]) { current[index] = remaining; result.push(current.slice()); }
      return;
    }
    for (let value = 0; value <= Math.min(bounds[index], remaining); value++) {
      current[index] = value;
      visit(index + 1, remaining - value);
    }
  }
  visit(0, total);
  return result;
}
function product(values) { return values.reduce((a, b) => a * b, 1n); }
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a < 0n ? -a : a;
}
function fraction(numerator, denominator) {
  const divisor = gcd(numerator, denominator);
  return { numerator: (numerator / divisor).toString(), denominator: (denominator / divisor).toString() };
}
function ratio(numerator, denominator) { return Number(numerator) / Number(denominator); }

/**
 * Exact combinatorial upper-bound model for early recovery of Prized
 * Mimikyu/Dialga-GX via Hisuian Heavy Ball. Categories are Mimikyu, Dialga,
 * Heavy Ball, Arven, other Basic Pokémon, and all remaining non-Basic cards.
 *
 * Assumptions: any unprized core Basic is otherwise accessible; any seen
 * Arven can fetch one unprized Heavy Ball from deck; Arven has an eligible
 * Tool target; Heavy Ball can be played when seen; no opponent disruption.
 * This is access feasibility, not counterline execution or win probability.
 */
function exactEarlyAccess({ heavyBallCopies, naturalDraws, includeArven = true }) {
  if (![1, 2].includes(heavyBallCopies)) throw new RangeError('heavyBallCopies must be 1 or 2');
  if (![0, 1, 2].includes(naturalDraws)) throw new RangeError('naturalDraws must be 0, 1 or 2');
  const mimikyu = 1, dialga = 1, arven = includeArven ? 1 : 0, otherBasics = 12;
  const otherNonBasics = 60 - mimikyu - dialga - heavyBallCopies - arven - otherBasics;
  const totals = [mimikyu, dialga, heavyBallCopies, arven, otherBasics, otherNonBasics];
  const denominator = choose(60, 6) * choose(54, 7) * choose(47, naturalDraws);
  let validWays = 0n, successWays = 0n, hardPrizeBlockWays = 0n, earlyAccessMissWays = 0n;
  const prizedCoreWays = [0n, 0n, 0n];
  for (const prizes of compositions(6, totals)) {
    const prizeWays = product(totals.map((count, i) => choose(count, prizes[i])));
    const afterPrizes = totals.map((count, i) => count - prizes[i]);
    const prizedCore = prizes[0] + prizes[1];
    const unprizedHeavy = heavyBallCopies - prizes[2];
    for (const hand of compositions(7, afterPrizes)) {
      if (hand[0] + hand[1] + hand[4] === 0) continue;
      const handWays = product(afterPrizes.map((count, i) => choose(count, hand[i])));
      const afterHand = afterPrizes.map((count, i) => count - hand[i]);
      for (const draws of compositions(naturalDraws, afterHand)) {
        const drawWays = product(afterHand.map((count, i) => choose(count, draws[i])));
        const ways = prizeWays * handWays * drawWays;
        validWays += ways;
        prizedCoreWays[prizedCore] += ways;
        const seenHeavy = hand[2] + draws[2];
        const arvenSeen = includeArven && hand[3] + draws[3] > 0;
        const arvenSearch = arvenSeen && unprizedHeavy > seenHeavy ? 1 : 0;
        const accessibleHeavy = Math.min(unprizedHeavy, seenHeavy + arvenSearch);
        if (prizedCore > unprizedHeavy) hardPrizeBlockWays += ways;
        else if (accessibleHeavy < prizedCore) earlyAccessMissWays += ways;
        else successWays += ways;
      }
    }
  }
  if (validWays !== successWays + hardPrizeBlockWays + earlyAccessMissWays) {
    throw new Error('access outcome partition does not sum to valid openings');
  }
  const conditional = n => ratio(n, validWays);
  return {
    heavyBallCopies, naturalDraws, includeArven,
    validOpeningProbability: ratio(validWays, denominator),
    corePrizeDistributionGivenValidOpening: prizedCoreWays.map(conditional),
    earlyCoreRecoveryProbabilityGivenValidOpening: conditional(successWays),
    hardPrizeOnlyObstructionGivenValidOpening: conditional(hardPrizeBlockWays),
    recoverableButNotSeenByHorizonGivenValidOpening: conditional(earlyAccessMissWays),
    exact: {
      validOpenings: fraction(validWays, denominator),
      earlyCoreRecovery: fraction(successWays, validWays),
      hardPrizeOnlyObstruction: fraction(hardPrizeBlockWays, validWays),
      recoverableButNotSeen: fraction(earlyAccessMissWays, validWays)
    }
  };
}
function run() {
  return [1, 2].flatMap(heavyBallCopies => [0, 1, 2].map(naturalDraws =>
    exactEarlyAccess({ heavyBallCopies, naturalDraws, includeArven: true })));
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = { exactEarlyAccess, run };
