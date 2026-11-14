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
 * Exact combinatorial upper-bound model for early recovery of Prized Mimikyu
 * and Dialga-GX via Hisuian Heavy Ball. If at least one copy of a core species
 * is outside Prizes, that species is optimistically treated as accessible.
 * A Heavy Ball is needed only for a species whose every copy is Prized.
 *
 * Arven, when seen, may fetch one additional unprized Heavy Ball from deck.
 * Assumes an eligible Tool remains, the Heavy Ball can be played, and no
 * opponent disruption. This is access feasibility, not line execution or win.
 */
function exactEarlyAccess({
  mimikyuCopies = 1,
  dialgaCopies = 1,
  heavyBallCopies = 1,
  naturalDraws = 0,
  includeArven = true,
  totalBasics = 14
}) {
  for (const [name, value, min, max] of [
    ['mimikyuCopies', mimikyuCopies, 1, 4],
    ['dialgaCopies', dialgaCopies, 1, 4],
    ['heavyBallCopies', heavyBallCopies, 1, 4],
    ['naturalDraws', naturalDraws, 0, 2],
    ['totalBasics', totalBasics, 2, 20]
  ]) {
    if (!Number.isSafeInteger(value) || value < min || value > max) throw new RangeError(name + ' out of range');
  }
  const arven = includeArven ? 1 : 0;
  const otherBasics = totalBasics - mimikyuCopies - dialgaCopies;
  if (otherBasics < 0) throw new RangeError('core Basic copies exceed totalBasics');
  const otherNonBasics = 60 - mimikyuCopies - dialgaCopies - heavyBallCopies - arven - otherBasics;
  if (otherNonBasics < 0) throw new RangeError('card counts exceed 60');
  const totals = [mimikyuCopies, dialgaCopies, heavyBallCopies, arven, otherBasics, otherNonBasics];
  const denominator = choose(60, 6) * choose(54, 7) * choose(47, naturalDraws);
  let validWays = 0n, successWays = 0n, hardPrizeBlockWays = 0n, earlyAccessMissWays = 0n;
  const requiredHeavyWays = [0n, 0n, 0n];

  for (const prizes of compositions(6, totals)) {
    const prizeWays = product(totals.map((count, i) => choose(count, prizes[i])));
    const afterPrizes = totals.map((count, i) => count - prizes[i]);
    const requiredHeavy = Number(prizes[0] === mimikyuCopies) + Number(prizes[1] === dialgaCopies);
    const unprizedHeavy = heavyBallCopies - prizes[2];
    for (const hand of compositions(7, afterPrizes)) {
      if (hand[0] + hand[1] + hand[4] === 0) continue;
      const handWays = product(afterPrizes.map((count, i) => choose(count, hand[i])));
      const afterHand = afterPrizes.map((count, i) => count - hand[i]);
      for (const draws of compositions(naturalDraws, afterHand)) {
        const drawWays = product(afterHand.map((count, i) => choose(count, draws[i])));
        const ways = prizeWays * handWays * drawWays;
        validWays += ways;
        requiredHeavyWays[requiredHeavy] += ways;
        const seenHeavy = hand[2] + draws[2];
        const arvenSeen = includeArven && hand[3] + draws[3] > 0;
        const arvenSearch = arvenSeen && unprizedHeavy > seenHeavy ? 1 : 0;
        const accessibleHeavy = Math.min(unprizedHeavy, seenHeavy + arvenSearch);
        if (requiredHeavy > unprizedHeavy) hardPrizeBlockWays += ways;
        else if (accessibleHeavy < requiredHeavy) earlyAccessMissWays += ways;
        else successWays += ways;
      }
    }
  }
  if (validWays !== successWays + hardPrizeBlockWays + earlyAccessMissWays) {
    throw new Error('access outcome partition does not sum to valid openings');
  }
  const conditional = n => ratio(n, validWays);
  return {
    mimikyuCopies, dialgaCopies, heavyBallCopies, naturalDraws, includeArven,
    totalBasics, otherBasics,
    validOpeningProbability: ratio(validWays, denominator),
    requiredHeavyDistributionGivenValidOpening: requiredHeavyWays.map(conditional),
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
  const variants = [
    [1, 1, 1], [1, 1, 2], [2, 1, 1], [1, 2, 1], [2, 2, 1], [2, 2, 2]
  ];
  return variants.flatMap(([mimikyuCopies, dialgaCopies, heavyBallCopies]) =>
    [0, 1, 2].map(naturalDraws => exactEarlyAccess({
      mimikyuCopies, dialgaCopies, heavyBallCopies, naturalDraws, includeArven: true
    })));
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = { exactEarlyAccess, run };
