'use strict';

const assert = require('node:assert/strict');

/** Exact binomial coefficient for nonnegative integer arguments. */
function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) return 0n;
  let product = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i += 1) {
    product = (product * BigInt(n - Math.min(k, n - k) + i)) / BigInt(i);
  }
  return product;
}

/** Count valid opening hands for one complete six-card Prize set with b Basics. */
function validHands(b) {
  return choose(54, 7) - choose(42 + b, 7);
}

const MARKED = ['T', 'C', 'D', 'L1', 'L2', 'P1', 'P2', 'P3', 'P4', 'W'];
const idx = Object.fromEntries(MARKED.map((name, i) => [name, i]));

/** Count paired six-Prize / seven-opening allocations realizing one exact marked-Prize pattern. */
function patternWeight(mask) {
  let k = 0;
  for (let v = mask; v > 0; v >>= 1) k += v & 1;
  if (k > 6) return 0n;
  let weight = 0n;
  for (let b = 0; b <= 6 - k; b += 1) {
    weight += choose(12, b) * choose(38, 6 - k - b) * validHands(b);
  }
  return weight;
}

/** The published rank-26 obstruction F and the new Damage Pump obstruction G. */
function classify(mask) {
  const prized = (name) => (mask & (1 << idx[name])) !== 0;
  const pumpCount = ['P1', 'P2', 'P3', 'P4'].filter(prized).length;
  const energyLock = prized('T') &&
    (prized('C') || prized('D') || (prized('L1') && prized('L2')));
  const pumpLock = prized('T') &&
    (pumpCount >= 3 || (pumpCount >= 2 && prized('W')));
  return { energyLock, pumpLock };
}

/** Enumerate all marked outcomes and integrate over the unmarked Basic Prize allocation. */
function enumerate() {
  const result = { total: 0n, energyLock: 0n, pumpLock: 0n, intersection: 0n, union: 0n };
  for (let mask = 0; mask < 1 << MARKED.length; mask += 1) {
    const weight = patternWeight(mask);
    const { energyLock, pumpLock } = classify(mask);
    result.total += weight;
    if (energyLock) result.energyLock += weight;
    if (pumpLock) result.pumpLock += weight;
    if (energyLock && pumpLock) result.intersection += weight;
    if (energyLock || pumpLock) result.union += weight;
  }
  return result;
}


/** Expand the physical-card Prize census with two original TM: Crisis Punch copies. */
function enumerateWithCrisisTools() {
  const counts = { total: 0n, oldUnion: 0n, toolLock: 0n, newUnion: 0n };
  for (let mask = 0; mask < 1 << (MARKED.length + 2); mask += 1) {
    let k = 0;
    for (let v = mask; v > 0; v >>= 1) k += v & 1;
    if (k > 6) continue;
    let weight = 0n;
    for (let b = 0; b <= 6 - k; b += 1) {
      weight += choose(12, b) * choose(36, 6 - k - b) * validHands(b);
    }
    const prior = classify(mask & ((1 << MARKED.length) - 1));
    const originalUnion = prior.energyLock || prior.pumpLock;
    const toolLock = (mask & (1 << idx.T)) !== 0 &&
      (mask & (3 << MARKED.length)) === (3 << MARKED.length);
    counts.total += weight;
    if (originalUnion) counts.oldUnion += weight;
    if (toolLock) counts.toolLock += weight;
    if (originalUnion || toolLock) counts.newUnion += weight;
  }
  return counts;
}

/** The conditional Probability(q_k) of k specified non-Basic cards being Prized. */
function qNumerator(k) {
  return (choose(60 - k, 7) - choose(48 - k, 7)) * choose(53 - k, 6 - k);
}
const qDenominator = (choose(60, 7) - choose(48, 7)) * choose(53, 6);

/** Assert two fractions are exactly equal by cross multiplication. */
function assertFraction(actualNum, actualDen, expectedNum, expectedDen) {
  assert.equal(actualNum * expectedDen, expectedNum * actualDen);
}

/** Paired-mulligan, bench-all sole-defender Basic probability for four-Basic opponent. */
function soleBasicProbability() {
  const n = (a, b) => Number(choose(a, b));
  const qs = n(48, 7) / n(60, 7);
  const ps = 1 - qs;
  const qd = n(56, 7) / n(60, 7);
  const pd = 1 - qd;
  const normalizer = 1 - qs * qd;
  const r = 4 * n(56, 6) / (n(60, 7) - n(56, 7));
  let result = r * (1 - pd * qs / normalizer);
  for (let k = 1; k <= 47; k += 1) {
    result += r * (ps * pd * qs ** k / normalizer) * (n(50, k) / n(53, k));
  }
  return result;
}

/** Run every exact-arithmetic and independent identity check. */
function testAndReport() {
  const x = enumerate();
  const totalValidPairAllocations =
    choose(60, 6) * choose(54, 7) *
    (choose(60, 7) - choose(48, 7)) / choose(60, 7);
  assert.equal(x.total, totalValidPairAllocations);
  assert.equal(x.union, x.energyLock + x.pumpLock - x.intersection);
  assertFraction(x.energyLock, x.total, 2564127669643n, 149499993622980n);
  assertFraction(x.pumpLock, x.total, 246645247n, 821428536390n);
  assertFraction(x.union, x.total, 93060602099n, 5339285486535n);
  assertFraction(x.energyLock, x.total,
    2n * qNumerator(2) - 2n * qNumerator(4) + qNumerator(5), qDenominator);
  assertFraction(x.pumpLock, x.total,
    10n * qNumerator(4) - 15n * qNumerator(5) + 6n * qNumerator(6), qDenominator);
  const extended = enumerateWithCrisisTools();
  assertFraction(extended.oldUnion, extended.total, x.union, x.total);
  assertFraction(extended.toolLock, extended.total, 212710n, 355596769n);
  assertFraction(extended.newUnion, extended.total, 671403282958n, 37374998405745n);
  const lone = soleBasicProbability();
  assert.ok(Math.abs(lone - 0.8367357777206609) < 1e-12);
  const p = (v) => Number(v) / Number(x.total);
  const ceiling = lone * (1 - p(x.union));
  assert.ok(Math.abs(ceiling - 0.8221519658100914) < 1e-12);
  console.log('Agent47 exact Prize-pattern test PASS (1,024 marked masks).');
  console.log('P(existing F | valid seven):', (100 * p(x.energyLock)).toFixed(9) + '%');
  console.log('P(new Pump G | valid seven):', (100 * p(x.pumpLock)).toFixed(9) + '%');
  console.log('P(G outside F | valid seven):', (100 * p(x.pumpLock - x.intersection)).toFixed(9) + '%');
  console.log('P(F or G | valid seven):', (100 * p(x.union)).toFixed(9) + '%');
  console.log('Iron Thorns bench-all first-turn upper bound:', (100 * ceiling).toFixed(9) + '%');
  const crisisCeiling = lone *
    (1 - Number(extended.newUnion) / Number(extended.total));
  assert.ok(Math.abs(crisisCeiling - 0.8217046828151501) < 1e-12);
  console.log('P(Ticket plus both Crisis Tools Prized | valid seven):',
    (100 * Number(extended.toolLock) / Number(extended.total)).toFixed(9) + '%');
  console.log('P(F or G or Crisis-Tool lock | valid seven):',
    (100 * Number(extended.newUnion) / Number(extended.total)).toFixed(9) + '%');
  console.log('Further tightened first-turn bench-all upper bound:',
    (100 * crisisCeiling).toFixed(9) + '%');
}

if (require.main === module) testAndReport();
module.exports = { choose, patternWeight, classify, enumerate, enumerateWithCrisisTools, qNumerator, soleBasicProbability, testAndReport };
