'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { fraction } = require('../simulation/evaluation/agent40-rank6-speed-trigger-counterwindow.cjs');
const {
  originalRank6PaymentCounts, eachComposition,
  exactTwoPaymentPaths, originalRank6TwoPaymentPaths
} = require('../simulation/evaluation/agent40-rank6-thunder-speed-payment-window.cjs');

test('source-locked rank6 payment categories match printed original 60', () => {
  assert.deepEqual(originalRank6PaymentCounts(), {
    thorns: 4, speed: 4, dce: 1, guzma: 3, thunder: 1, single: 3, other: 44
  });
});

test('composition combinatorial weights exhaust source-independent toy universe', () => {
  let weighted = 0n;
  eachComposition([3, 2, 1], 3, (_row, ways) => { weighted += ways; });
  assert.equal(weighted, 20n);
});

test('exact disjoint Speed and no-Speed payment windows; source + Prize marginal', () => {
  const r = originalRank6TwoPaymentPaths();
  assert.deepEqual(r.speed, {
    numerator: 40623492317n, denominator: 7529971449000n
  });
  assert.deepEqual(r.noSpeed, {
    numerator: 1207121n, denominator: 2310988680n
  });
  assert.deepEqual(r.union, {
    numerator: 66835042363n, denominator: 11294957173500n
  });
  assert.deepEqual(r.unconditional, {
    numerator: 66835042363n, denominator: 28272760337250n
  });
});

test('toy brute physical-card permutations independently reproduce both path probabilities', () => {
  const types = ['T', 'T', 'T', 'S', 'D', 'G', 'M', 'E', 'O'];
  const limits = { opening: 3, first: 4, fast: 3, slow: 1 };
  const rows = {
    speed: { favorable: 0n },
    noSpeed: { favorable: 0n }
  };

  /** @param {number[]} taken */
  function walk(taken) {
    if (taken.length === limits.first + limits.fast) {
      const seen = taken.map(i => types[i]);
      const early = seen.slice(0, limits.first);
      const ready = early.filter(x => x === 'T').length >= 2;
      const speed = early.includes('S');
      if (speed && ready && seen.includes('G') &&
          (seen.includes('D') || (seen.includes('M') &&
          seen.filter(x => x === 'S' || x === 'E').length >= 2))) {
        rows.speed.favorable += 1n;
      }
      return;
    }
    for (let i = 0; i < types.length; i += 1) {
      if (!taken.includes(i)) walk([...taken, i]);
    }
  }
  walk([]);

  /** @param {number[]} taken */
  function walkSlow(taken) {
    if (taken.length === limits.first + limits.slow) {
      const seen = taken.map(i => types[i]);
      const early = seen.slice(0, limits.first);
      if (!early.includes('S') && early.filter(x => x === 'T').length >= 2 &&
          seen.includes('G') && seen.includes('D') && seen.includes('M')) {
        rows.noSpeed.favorable += 1n;
      }
      return;
    }
    for (let i = 0; i < types.length; i += 1) {
      if (!taken.includes(i)) walkSlow([...taken, i]);
    }
  }
  walkSlow([]);

  const toy = exactTwoPaymentPaths(
    { thorns: 3, speed: 1, dce: 1, guzma: 1, thunder: 1, single: 1, other: 1 },
    limits.opening, limits.first, limits.fast, limits.slow
  );
  // Both branches are weighted against ALL Basic-valid openings, including
  // draws whose early Speed/no-Speed eligibility is false.
  // Enumerating only branch-specific denominators needs normalizing by the
  // fraction of legal openings in that branch; count all valid permutations.
  const countValid = (n) => {
    let total = 0n;
    /** @param {number[]} chosen */
    function rec(chosen) {
      if (chosen.length === n) {
        if (chosen.slice(0, limits.opening).some(i => types[i] === 'T')) total += 1n;
        return;
      }
      for (let i = 0; i < types.length; i += 1) {
        if (!chosen.includes(i)) rec([...chosen, i]);
      }
    }
    rec([]);
    return total;
  };
  assert.deepEqual(toy.speed, fraction(rows.speed.favorable, countValid(7)));
  assert.deepEqual(toy.noSpeed, fraction(rows.noSpeed.favorable, countValid(5)));
  assert.deepEqual(toy.speed, { numerator: 11n, denominator: 120n });
  assert.deepEqual(toy.noSpeed, { numerator: 3n, denominator: 160n });
  assert.deepEqual(toy.union, { numerator: 53n, denominator: 480n });
});

test('no Thunder prevents DCE-only one-attachment route and extra-single branch', () => {
  const r = exactTwoPaymentPaths(
    { thorns: 3, speed: 1, dce: 0, guzma: 1, thunder: 0, single: 1, other: 3 },
    2, 3, 2, 1
  );
  assert.deepEqual(r.union, { numerator: 0n, denominator: 1n });
});
