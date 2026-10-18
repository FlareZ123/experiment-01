'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Exact source-rank11 opening-hand/Prize census.
 * Usage: node scripts/rank11-boostshake-opening-census.cjs
 * Access to an early lock is not evidence of policy competence or game wins.
 */
const buckets = [
  ['Oranguru V'], ['Battle VIP Pass'], ['Float Stone'],
  ['Forest Seal Stone'], ['Boost Shake'], ['Trubbish'],
  ['Garbodor'], ['Mega Absol ex', 'Latias ex', 'Tapu Lele-GX',
    'Crobat V', 'Squawkabilly ex']
];
const expected = [2, 4, 3, 2, 2, 2, 2, 7, 36];

/** @param {number} n @param {number} k @returns {bigint} */
function C(n, k) {
  if (k < 0 || n < k) return 0n;
  let v = 1n;
  for (let i = 1, m = Math.min(k, n - k); i <= m; i++) {
    v = v * BigInt(n - m + i) / BigInt(i);
  }
  return v;
}

/** @returns {number[]} */
function loadCounts() {
  const file = path.resolve(__dirname, '../results/aichi-2026/full-decklists.json');
  const source = JSON.parse(fs.readFileSync(file, 'utf8'));
  const cards = source.decks.find(d => d.rank === 11).cards;
  const byName = new Map(cards.map(c => [c.name, c.count]));
  assert.equal(cards.reduce((a, c) => a + c.count, 0), 60);
  const a = buckets.map(names => names.reduce((a, n) => {
    assert.ok(byName.has(n), 'Missing printed card ' + n);
    return a + byName.get(n);
  }, 0));
  a.push(60 - a.reduce((x, y) => x + y, 0));
  assert.deepEqual(a, expected, 'Frozen source-rank11 counts changed');
  return a;
}

/**
 * Number of Prize choices that leave the requested deck targets.
 * Index meanings: O,V,F,S,B,T,G,otherBasic,other.
 * @param {number[]} total @param {number[]} hand @param {number[]} targets
 * @returns {bigint}
 */
function goodPrizeChoices(total, hand, targets) {
  let answer = 0n;
  for (let mask = 0; mask < (1 << targets.length); mask++) {
    let forced = 0;
    let parity = 0;
    for (let j = 0; j < targets.length; j++) {
      if (mask & (1 << j)) {
        forced += total[targets[j]] - hand[targets[j]];
        parity++;
      }
    }
    const ways = C(53 - forced, 6 - forced);
    answer += parity % 2 ? -ways : ways;
  }
  return answer;
}

/** @returns {Record<string,bigint>} */
function census() {
  const n = loadCounts();
  const hand = Array(n.length).fill(0);
  const p = C(53, 6);
  const r = {allHands: 0n, valid: 0n, direct: 0n,
    v1Hand: 0n, v1Targets: 0n, total: C(60, 7) * p};

  /** @param {number} i @param {number} remain @param {bigint} ways */
  function enumerate(i, remain, ways) {
    if (i === n.length) {
      if (remain) return;
      r.allHands += ways;
      if (!hand[0] && !hand[5] && !hand[7]) return;
      r.valid += ways * p;
      if (hand[2] && hand[4] && (hand[1] || hand[5])) {
        const targets = hand[5] ? [6] : [5, 6];
        r.direct += ways * goodPrizeChoices(n, hand, targets);
      }
      if (hand[0] && hand[1] && hand[2] && !hand[3] && !hand[4]) {
        r.v1Hand += ways * p;
        r.v1Targets += ways * goodPrizeChoices(n, hand, [5, 3, 4, 6]);
      }
      return;
    }
    for (let h = 0; h <= Math.min(n[i], remain); h++) {
      hand[i] = h;
      enumerate(i + 1, remain - h, ways * C(n[i], h));
    }
    hand[i] = 0;
  }
  enumerate(0, 7, 1n);
  assert.equal(r.allHands, C(60, 7));
  assert.equal(r.total, 8866337641761600n);
  assert.equal(r.valid, 6894276702593280n);
  assert.equal(r.direct, 169890696085236n);
  assert.equal(r.v1Hand, 127592737981800n);
  assert.equal(r.v1Targets, 117097385243124n);
  return r;
}

/** @param {bigint} x @param {bigint} d @returns {string} */
function percent(x, d) {
  return (Number(x) * 100 / Number(d)).toFixed(8) + '%';
}
if (require.main === module) {
  const r = census();
  console.log(JSON.stringify({
    validHandFraction: percent(r.valid, r.total),
    directWithSearchableGarbodor: percent(r.direct, r.valid),
    v1NecessaryHandOnly: percent(r.v1Hand, r.valid),
    v1WithSearchableTargets: percent(r.v1Targets, r.valid),
    exactIntegerNumerators: Object.fromEntries(
      Object.entries(r).map(([k, v]) => [k, String(v)])),
    qualifiesCompetitiveGames: false
  }, null, 2));
}
module.exports = {C, loadCounts, goodPrizeChoices, census};
