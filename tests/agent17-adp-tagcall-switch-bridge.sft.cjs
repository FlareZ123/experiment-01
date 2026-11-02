'use strict';

const assert = require('node:assert/strict');
const candidate = require('../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');
const cardsXY = require('../resources/cards/en/xy6.json');
const cardsSM = require('../resources/cards/en/sm12.json');
const cardsSV = require('../resources/cards/en/sv1.json');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let result = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i += 1) {
    result = result * BigInt(n - i + 1) / BigInt(i);
  }
  return result;
}

/** @param {string} id @returns {number} */
function count(id) {
  return candidate.cards.find((row) => row.id === id)?.count || 0;
}

// ADP2, non-ADP Basics5, Tag Call4, Switch2, G&H3, DDE4, other40.
const counts = [
  count('sm12-156'),
  count('swsh12-135') + count('sm2-60') + count('swsh3-104'),
  count('sm12-206'),
  count('sv1-194'),
  count('sm12-193'),
  count('xy6-97')
];
counts.push(60 - counts.reduce((a, b) => a + b, 0));
assert.deepEqual(counts, [2, 5, 4, 2, 3, 4, 40]);
assert.equal(candidate.cards.reduce((s, row) => s + row.count, 0), 60);
assert.match(cardsSM.find((row) => row.id === 'sm12-206').rules[0], /up to 2 TAG TEAM cards/);
assert.match(cardsSV.find((row) => row.id === 'sv1-194').rules[0], /Switch your Active Pokémon/);
assert.match(cardsXY.find((row) => row.id === 'xy6-97').rules[0], /provides only 2 Energy/);

/** @param {number[]} remaining @param {number[]} required @returns {bigint} */
function acceptablePrizes(remaining, required) {
  let countGood = 0n;
  for (let mask = 0; mask < (1 << required.length); mask += 1) {
    let totalExcluded = 0;
    let parity = 0;
    for (let index = 0; index < required.length; index += 1) {
      if (mask & (1 << index)) {
        totalExcluded += remaining[required[index]];
        parity += 1;
      }
    }
    const choices = choose(52 - totalExcluded, 6 - totalExcluded);
    countGood += parity % 2 ? -choices : choices;
  }
  return countGood;
}

/**
 * Exact no-extra first-eight Tag Call + Switch physical bridge for a non-ADP
 * Basic initial Active. The held Tag Call fetches missing ADP and/or G&H,
 * and G&H fetches missing DDE. All unheld prerequisites must survive Prizes.
 * @param {number[]} groups
 * @returns {{numerator:bigint,denominator:bigint}}
 */
function countBridge(groups) {
  assert.equal(groups.reduce((a, b) => a + b, 0), 60);
  const valid7 = choose(60, 7) -
    choose(60 - groups[0] - groups[1], 7);
  const denominator = valid7 * 53n * choose(52, 6);
  let numerator = 0n;
  const first7 = Array(groups.length).fill(0);

  /** @param {number} index @param {number} unselected @param {bigint} ways */
  function opening(index, unselected, ways) {
    if (index === groups.length - 1) {
      if (unselected > groups[index]) return;
      first7[index] = unselected;
      if (first7[0] || first7[1] === 0) return;
      const openingWays = ways * choose(groups[index], unselected);
      for (let drawn = 0; drawn < groups.length; drawn += 1) {
        const available = groups[drawn] - first7[drawn];
        if (!available) continue;
        const first8 = first7.slice();
        first8[drawn] += 1;
        if (!first8[2] || !first8[3]) continue;
        const remain = groups.map((v, i) => v - first8[i]);
        const needed = [0, 4, 5].filter((i) => !first8[i]);
        numerator += openingWays * BigInt(available) *
          acceptablePrizes(remain, needed);
      }
      return;
    }
    for (let c = 0; c <= Math.min(unselected, groups[index]); c += 1) {
      first7[index] = c;
      opening(index + 1, unselected - c, ways * choose(groups[index], c));
    }
  }
  opening(0, 7, 1n);
  return { numerator, denominator };
}

const actual = countBridge(counts);
assert.equal(actual.denominator, 250397245379590400n);
assert.equal(actual.numerator, 14206363895848805n);
const p = Number(actual.numerator) / Number(actual.denominator);
assert.ok(Math.abs(p - 0.05673530423352952) < 1e-14);
// Structural negative controls: no Switch, no Tag Call, or no ADP.
for (const index of [0, 2, 3]) {
  const changed = counts.slice();
  changed[changed.length - 1] += changed[index];
  changed[index] = 0;
  assert.equal(countBridge(changed).numerator, 0n);
}

console.log(JSON.stringify({
  status: 'PASS',
  deckIdentity: candidate.canonicalCardsSha256,
  bridgeFromNonADPBasicPercentOfBasicValidSeven: 100 * p,
  bridgePhysicalNumerator: actual.numerator.toString(),
  conditionalDenominator: actual.denominator.toString(),
  mutuallyExclusiveWithADPInitiallyActive: true,
  combinedWithAgent17NoSwitchT1OpportunityPercent: 100 * (p + 0.289936530125),
  paperStatus: 'Physical opportunity only: no legal payment, selected source counter, native attack, or competitive result proved'
}, null, 2));
