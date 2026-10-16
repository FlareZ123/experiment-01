'use strict';

/**
 * Exact nine-card / six-Prize opening-access model for an early Hood-protected
 * Shadow Rider. This estimates resource presence, never executed game lines.
 *
 * Starting seven must contain any Basic; Shadow Rider V must be accessible
 * by the first turn draw to be played before the second turn; a VMAX must be
 * directly in hand by the second turn draw. Hood is either directly in hand
 * by then or potentially searchable via a drawn Arven if at least one copy
 * is outside both hand and Prizes.
 *
 * Arven Supporter use is treated as an optimistic opportunity, not a promise:
 * no Item/Ability/Supporter lock, Supporter contention, or discard/search
 * sequencing is simulated. No optional opponent mulligan draws or other
 * search and draw effects are included.
 */

/** @param {number} n @param {number} k */
function choose(n, k) {
  if (k < 0 || k > n) return 0;
  let value = 1;
  for (let i = 1; i <= Math.min(k, n - k); i += 1) {
    value = value * (n - i + 1) / i;
  }
  return value;
}

/**
 * @typedef {object} HoodOpeningConfig
 * @property {number} [totalCards]
 * @property {number} [initialHandSize]
 * @property {number} [prizeCount]
 * @property {number} [basicCount]
 * @property {number} riderV
 * @property {number} riderVMAX
 * @property {number} hoodCount
 * @property {number} arvenCount
 */

/**
 * @param {HoodOpeningConfig} options
 * @returns {object} Exact probabilities conditional on a legal Basic opening.
 */
function exactHoodOpening(options) {
  const {
    totalCards = 60, initialHandSize = 7, prizeCount = 6,
    basicCount = 14, riderV, riderVMAX, hoodCount, arvenCount
  } = options;
  const numbers = [
    totalCards, initialHandSize, prizeCount, basicCount,
    riderV, riderVMAX, hoodCount, arvenCount
  ];
  if (numbers.some(n => !Number.isInteger(n) || n < 0) ||
      riderV > basicCount || initialHandSize < 1 ||
      totalCards - initialHandSize - prizeCount < 2) {
    throw new Error('Invalid opening model configuration.');
  }

  // Group indices: Shadow Rider V, VMAX, Hood, Arven, other Basics, rest.
  const groups = [
    riderV, riderVMAX, hoodCount, arvenCount, basicCount - riderV,
    totalCards - basicCount - riderVMAX - hoodCount - arvenCount
  ];
  if (groups.some(n => n < 0)) {
    throw new Error('Model categories exceed the deck size.');
  }

  const totalHandWays = choose(totalCards, initialHandSize);
  const unobservedAfterDraws = totalCards - initialHandSize - 2;
  const results = { valid: 0, ready: 0, direct: 0, available: 0 };

  /** @param {number[]} initial @param {number} combinations */
  function measure(initial, combinations) {
    // A hand with no Basic is a mulligan and is excluded from this deal.
    if (initial[0] + initial[4] === 0) return;
    const firstHandProbability = combinations / totalHandWays;
    results.valid += firstHandProbability;
    const remaining = groups.map((size, i) => size - initial[i]);
    const firstDrawPool = totalCards - initialHandSize;
    const secondDrawPool = firstDrawPool - 1;

    for (let first = 0; first < groups.length; first += 1) {
      if (remaining[first] === 0) continue;
      const firstProbability = firstHandProbability * remaining[first] / firstDrawPool;
      remaining[first] -= 1;
      for (let second = 0; second < groups.length; second += 1) {
        if (remaining[second] === 0) continue;
        const weight = firstProbability * remaining[second] / secondDrawPool;
        if (initial[0] + Number(first === 0) < 1 ||
            initial[1] + Number(first === 1) + Number(second === 1) < 1) {
          continue;
        }
        results.ready += weight;
        const directHood = initial[2] + Number(first === 2) + Number(second === 2);
        if (directHood > 0) {
          results.direct += weight;
          results.available += weight;
        } else {
          const arven = initial[3] + Number(first === 3) + Number(second === 3);
          const remainingHoods = hoodCount;
          if (arven > 0 && remainingHoods > 0) {
            // After the nine observed cards, the six Prizes are a uniform
            // subset of the remaining 51. All remaining Hoods in Prizes
            // is the only Prize failure mode for Arven's Hood search.
            const allPrized = remainingHoods <= prizeCount
              ? choose(prizeCount, remainingHoods) /
                choose(unobservedAfterDraws, remainingHoods)
              : 0;
            results.available += weight * (1 - allPrized);
          }
        }
      }
      remaining[first] += 1;
    }
  }

  /** @param {number} index @param {number} left @param {number[]} hand @param {number} ways */
  function visit(index, left, hand, ways) {
    if (index === groups.length) {
      if (left === 0) measure(hand, ways);
      return;
    }
    for (let qty = 0; qty <= Math.min(groups[index], left); qty += 1) {
      hand.push(qty);
      visit(index + 1, left - qty, hand, ways * choose(groups[index], qty));
      hand.pop();
    }
  }
  visit(0, initialHandSize, [], 1);

  const conditioned = n => n / results.valid;
  return {
    config: {
      totalCards, initialHandSize, prizeCount, basicCount,
      riderV, riderVMAX, hoodCount, arvenCount
    },
    validOpeningProbability: results.valid,
    readyVAndVMAXByTurn2: conditioned(results.ready),
    readyWithDirectHoodByTurn2: conditioned(results.direct),
    readyWithDirectOrArvenHoodByTurn2: conditioned(results.available),
    arvenAdditionalReadyByTurn2: conditioned(results.available - results.direct),
    hoodOpportunityAmongReady: results.ready ? results.available / results.ready : 0,
    evidence: 'exact finite-population resource-access submodel; not executed game lines or wins'
  };
}

if (require.main === module) {
  const scenarios = [
    { label: 'rank-1 reference', riderV: 3, riderVMAX: 4, hoodCount: 0, arvenCount: 0 },
    { label: 'Temple Shadow Rider v1', riderV: 4, riderVMAX: 3, hoodCount: 0, arvenCount: 0 },
    { label: 'Hood Shield v1', riderV: 4, riderVMAX: 4, hoodCount: 2, arvenCount: 1 },
    { label: 'Hood Shield minus fourth V', riderV: 3, riderVMAX: 4, hoodCount: 2, arvenCount: 1 }
  ];
  for (const scenario of scenarios) {
    const { label, ...options } = scenario;
    console.log(JSON.stringify({ label, ...exactHoodOpening(options) }));
  }
}

module.exports = { choose, exactHoodOpening };
