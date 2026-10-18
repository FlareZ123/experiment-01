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
  ['Garbodor'], ['Crobat V'], ['Muscle Band'],
  ['Mega Absol ex', 'Latias ex', 'Tapu Lele-GX', 'Squawkabilly ex']
];
const expected = [2, 4, 3, 2, 2, 2, 2, 1, 1, 6, 35];

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
 * Index meanings: Oranguru,VIP,Float,Seal,Shake,Trubbish,Garbodor,
 * CrobatV,MuscleBand,otherBasic,other.
 * @param {number[]} total @param {number[]} hand @param {number[]} targets
 * @param {number} [cardsNotHeld=53] Deck+Prize pool after the hand and draw
 * @returns {bigint}
 */
function goodPrizeChoices(total, hand, targets, cardsNotHeld = 53) {
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
    const ways = C(cardsNotHeld - forced, 6 - forced);
    answer += parity % 2 ? -ways : ways;
  }
  return answer;
}

/**
 * Inclusion-exclusion over disjoint deck target groups. A requirement may be
 * met by any remaining printing in its group. Groups must not overlap.
 * @param {number[]} total @param {number[]} hand
 * @param {number[][]} groups @param {number} [cardsNotHeld=53]
 * @returns {bigint}
 */
function goodPrizeGroups(total, hand, groups, cardsNotHeld = 53) {
  let ways = 0n;
  for (let mask = 0; mask < (1 << groups.length); mask++) {
    let forced = 0;
    let parity = 0;
    for (let i = 0; i < groups.length; i++) {
      if (mask & (1 << i)) {
        forced += groups[i].reduce((n, k) => n + total[k] - hand[k], 0);
        parity++;
      }
    }
    ways += (parity % 2 ? -1n : 1n) *
      C(cardsNotHeld - forced, 6 - forced);
  }
  return ways;
}

/**
 * A held Seal can find an unprized Boost Shake using any established Pokémon
 * V. Held VIP can search for both missing Trubbish and a V, if necessary.
 * @param {number[]} hand @returns {boolean}
 */
function heldSealOpportunity(hand) {
  return hand[2] > 0 && hand[3] > 0 && hand[4] === 0 &&
    (hand[5] > 0 || hand[1] > 0) &&
    (hand[0] + hand[7] > 0 || hand[1] > 0);
}

/** @param {number[]} hand @returns {number[][]} */
function heldSealRequiredGroups(hand) {
  return [[4], [6],
    ...(hand[5] ? [] : [[5]]),
    ...(hand[0] + hand[7] ? [] : [[0, 7]])];
}

/**
 * Garbotoxin accepts any Pokémon Tool: Float Stone, Forest Seal Stone or
 * Muscle Band. A held-Seal route uses one Seal on an established Pokémon V
 * and requires a separate Tool on Trubbish.
 * @param {number[]} hand @returns {boolean}
 */
function directAnyToolOpportunity(hand) {
  return hand[4] > 0 && (hand[5] > 0 || hand[1] > 0) &&
    hand[2] + hand[3] + hand[8] > 0;
}
/** @param {number[]} hand @returns {boolean} */
function heldSealAnyToolOpportunity(hand) {
  return hand[3] > 0 && hand[4] === 0 &&
    (hand[5] > 0 || hand[1] > 0) &&
    (hand[0] + hand[7] > 0 || hand[1] > 0) &&
    (hand[2] + hand[8] > 0 || hand[3] > 1);
}

/** @returns {Record<string,bigint>} */
function census() {
  const n = loadCounts();
  const hand = Array(n.length).fill(0);
  const p = C(53, 6);
  const r = {allHands: 0n, valid: 0n, direct: 0n, heldSeal: 0n,
    anyToolDirect:0n, anyToolHeldSeal:0n,
    v1Hand: 0n, v1Targets: 0n, total: C(60, 7) * p};

  /** @param {number} i @param {number} remain @param {bigint} ways */
  function enumerate(i, remain, ways) {
    if (i === n.length) {
      if (remain) return;
      r.allHands += ways;
      if (!hand[0] && !hand[5] && !hand[7] && !hand[9]) return;
      r.valid += ways * p;
      if (hand[2] && hand[4] && (hand[1] || hand[5])) {
        const targets = hand[5] ? [6] : [5, 6];
        r.direct += ways * goodPrizeChoices(n, hand, targets);
      }
      if (heldSealOpportunity(hand)) {
        r.heldSeal += ways * goodPrizeGroups(n, hand,
          heldSealRequiredGroups(hand), 53);
      }
      if (directAnyToolOpportunity(hand)) {
        r.anyToolDirect += ways * goodPrizeChoices(n, hand,
          hand[5] ? [6] : [5, 6]);
      }
      if (heldSealAnyToolOpportunity(hand)) {
        r.anyToolHeldSeal += ways * goodPrizeGroups(n, hand,
          heldSealRequiredGroups(hand), 53);
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
  assert.equal(r.heldSeal, 102325528271124n);
  assert.equal(r.anyToolDirect, 306517297500960n);
  assert.equal(r.anyToolHeldSeal, 146449497648753n);
  assert.equal(r.v1Hand, 127592737981800n);
  assert.equal(r.v1Targets, 117097385243124n);
  return r;
}


/**
 * Exact actual first-turn census: initial seven, six Prizes, then normal
 * first-turn draw. An effective eight-card hand must preserve validity
 * of its first seven. Conditional on an unordered H8, each possible
 * distinguished draw card contributes one physical ordering. If H8 has
 * exactly one Basic, only seven of the eight can be the final draw.
 * Both possible starting seats receive the normal start-of-turn draw;
 * any bonus draws, Trainer actions or search from hand are excluded.
 * @returns {Record<string,bigint>}
 */
function censusAfterFirstDraw() {
  const n = loadCounts();
  const hand = Array(n.length).fill(0);
  const p = C(52, 6);
  const r = {
    allHands:0n, valid:0n, direct:0n, heldSeal:0n,
    anyToolDirect:0n, anyToolHeldSeal:0n,
    v1Hand:0n, v1Targets:0n,
    total:C(60, 8) * 8n * p
  };
  /** @param {number} i @param {number} remain @param {bigint} ways */
  function enumerate(i, remain, ways) {
    if (i === n.length) {
      if (remain) return;
      r.allHands += ways;
      const basics = hand[0] + hand[5] + hand[7] + hand[9];
      const legalFinalDraws = basics >= 2 ? 8 : basics === 1 ? 7 : 0;
      const weightedWays = ways * BigInt(legalFinalDraws);
      r.valid += weightedWays * p;
      if (hand[2] && hand[4] && (hand[1] || hand[5])) {
        r.direct += weightedWays * goodPrizeChoices(n, hand,
          hand[5] ? [6] : [5, 6], 52);
      }
      if (heldSealOpportunity(hand)) {
        r.heldSeal += weightedWays * goodPrizeGroups(n, hand,
          heldSealRequiredGroups(hand), 52);
      }
      if (directAnyToolOpportunity(hand)) {
        r.anyToolDirect += weightedWays * goodPrizeChoices(n, hand,
          hand[5] ? [6] : [5, 6], 52);
      }
      if (heldSealAnyToolOpportunity(hand)) {
        r.anyToolHeldSeal += weightedWays * goodPrizeGroups(n, hand,
          heldSealRequiredGroups(hand), 52);
      }
      if (hand[0] && hand[1] && hand[2] && !hand[3] && !hand[4]) {
        r.v1Hand += weightedWays * p;
        r.v1Targets += weightedWays *
          goodPrizeChoices(n, hand, [5, 3, 4, 6], 52);
      }
      return;
    }
    for (let h = 0; h <= Math.min(n[i], remain); h++) {
      hand[i] = h;
      enumerate(i + 1, remain - h, ways * C(n[i], h));
    }
    hand[i] = 0;
  }
  enumerate(0, 8, 1n);
  assert.equal(r.allHands, C(60, 8));
  // Independent derivation: each valid H7/Prize6 deal offers 47 deck
  // cards for the first normal draw, irrespective of its identity.
  assert.equal(r.total, 416717869162795200n);
  assert.equal(r.valid, census().valid * 47n);
  assert.equal(r.valid, 324031005021884160n);
  assert.equal(r.direct, 11911482095606528n);
  assert.equal(r.heldSeal, 7376246746128421n);
  assert.equal(r.anyToolDirect, 20917841360559248n);
  assert.equal(r.anyToolHeldSeal, 10403861960264413n);
  assert.equal(r.v1Hand, 8012265580359040n);
  assert.equal(r.v1Targets, 7228094214428032n);
  return r;
}

/** @param {bigint} x @param {bigint} d @returns {string} */
function percent(x, d) {
  return (Number(x) * 100 / Number(d)).toFixed(8) + '%';
}
if (require.main === module) {
  const r = census();
  const afterDraw = censusAfterFirstDraw();
  const numeric = values => Object.fromEntries(
    Object.entries(values).map(([k, v]) => [k, String(v)]));
  console.log(JSON.stringify({
    initialSeven: {
      validHandFraction: percent(r.valid, r.total),
      directWithSearchableGarbodor: percent(r.direct, r.valid),
      heldSealVStarRoute: percent(r.heldSeal, r.valid),
      anyToolDirect: percent(r.anyToolDirect, r.valid),
      anyToolHeldSeal: percent(r.anyToolHeldSeal, r.valid),
      broadDisjointUnion: percent(r.anyToolDirect + r.anyToolHeldSeal, r.valid),
      disjointDirectOrHeldSeal: percent(r.direct + r.heldSeal, r.valid),
      v1NecessaryHandOnly: percent(r.v1Hand, r.valid),
      v1WithSearchableTargets: percent(r.v1Targets, r.valid),
      exactIntegerNumerators: numeric(r)
    },
    initialSevenPlusFirstNormalDraw: {
      validHandFraction: percent(afterDraw.valid, afterDraw.total),
      directWithSearchableGarbodor:
        percent(afterDraw.direct, afterDraw.valid),
      heldSealVStarRoute: percent(afterDraw.heldSeal, afterDraw.valid),
      anyToolDirect: percent(afterDraw.anyToolDirect, afterDraw.valid),
      anyToolHeldSeal: percent(afterDraw.anyToolHeldSeal, afterDraw.valid),
      broadDisjointUnion:
        percent(afterDraw.anyToolDirect + afterDraw.anyToolHeldSeal, afterDraw.valid),
      disjointDirectOrHeldSeal:
        percent(afterDraw.direct + afterDraw.heldSeal, afterDraw.valid),
      v1NecessaryHandOnly: percent(afterDraw.v1Hand, afterDraw.valid),
      v1WithSearchableTargets:
        percent(afterDraw.v1Targets, afterDraw.valid),
      exactIntegerNumerators: numeric(afterDraw)
    },
    qualifiesCompetitiveGames: false
  }, null, 2));
}
module.exports = {C, loadCounts, goodPrizeChoices, goodPrizeGroups,
  heldSealOpportunity, heldSealRequiredGroups,
  directAnyToolOpportunity, heldSealAnyToolOpportunity,
  census, censusAfterFirstDraw};
