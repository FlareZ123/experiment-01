'use strict';

const assert = require('node:assert/strict');

/** Exact binomial coefficient as BigInt. */
function choose(n, k) {
  assert.ok(Number.isSafeInteger(n) && n >= 0, 'n must be a non-negative integer');
  assert.ok(Number.isSafeInteger(k), 'k must be an integer');
  if (k < 0 || k > n) return 0n;
  const width = Math.min(k, n - k);
  let value = 1n;
  for (let i = 1; i <= width; i++) {
    value = value * BigInt(n - width + i) / BigInt(i);
  }
  return value;
}

function gcd(a, b) {
  while (b !== 0n) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a;
}

function exactFraction(numerator, denominator) {
  assert.ok(denominator > 0n);
  const divisor = gcd(numerator, denominator);
  const n = numerator / divisor;
  const d = denominator / divisor;
  return {
    numerator: n.toString(),
    denominator: d.toString(),
    probability: Number(n) / Number(d),
    percent: 100 * Number(n) / Number(d)
  };
}

/**
 * Probability that at least one required identity is entirely in the Prize
 * cards. Copies of the two required identities are disjoint card slots.
 */
function prizeUnavailable(mimikyuCopies, dialgaCopies, {
  deckSize = 60,
  prizeCount = 6
} = {}) {
  for (const [name, value] of [
    ['mimikyuCopies', mimikyuCopies],
    ['dialgaCopies', dialgaCopies],
    ['deckSize', deckSize],
    ['prizeCount', prizeCount]
  ]) {
    assert.ok(Number.isSafeInteger(value) && value >= 0, name + ' must be a non-negative integer');
  }
  assert.ok(mimikyuCopies > 0 && dialgaCopies > 0,
    'both required identities need at least one copy');
  assert.ok(prizeCount <= deckSize, 'prizeCount cannot exceed deckSize');
  assert.ok(mimikyuCopies + dialgaCopies <= deckSize,
    'required copies cannot exceed deckSize');

  const denominator = choose(deckSize, prizeCount);
  const mimikyuAllPrized = choose(deckSize - mimikyuCopies,
    prizeCount - mimikyuCopies);
  const dialgaAllPrized = choose(deckSize - dialgaCopies,
    prizeCount - dialgaCopies);
  const bothAllPrized = choose(deckSize - mimikyuCopies - dialgaCopies,
    prizeCount - mimikyuCopies - dialgaCopies);

  return exactFraction(
    mimikyuAllPrized + dialgaAllPrized - bothAllPrized,
    denominator
  );
}

function study() {
  return [
    [1, 1],
    [2, 1],
    [1, 2],
    [2, 2]
  ].map(([mimikyuCopies, dialgaCopies]) => {
    const unavailable = prizeUnavailable(mimikyuCopies, dialgaCopies);
    const available = exactFraction(
      BigInt(unavailable.denominator) - BigInt(unavailable.numerator),
      BigInt(unavailable.denominator)
    );
    return { mimikyuCopies, dialgaCopies, unavailable, available };
  });
}

if (require.main === module) {
  const result = {
    schema: 'hood-copycat-prize-reliability-v1',
    deckSize: 60,
    prizeCount: 6,
    assumptions: 'Uniform six-card Prize sample without replacement; the specific line requires at least one Mimikyu and one Dialga outside Prizes.',
    rows: study()
  };
  console.log(JSON.stringify(result, null, 2));
}

module.exports = { choose, exactFraction, prizeUnavailable, study };
