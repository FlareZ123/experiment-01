"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let result = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    result = result * BigInt(n - Math.min(k, n - k) + i) / BigInt(i);
  }
  return result;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

/** @param {bigint} numerator @param {bigint} denominator */
function fraction(numerator, denominator) {
  const divisor = gcd(numerator, denominator);
  return {
    numerator: String(numerator / divisor),
    denominator: String(denominator / divisor),
    percent: Number(numerator) / Number(denominator) * 100
  };
}

/**
 * Exact opportunity for two distinct Items to be directly seen at separate
 * own-turn deadlines. Opening must include a Basic; facedown Prizes are
 * marginalized over all equally likely physical positions. The first own
 * normal draw is draw 1, regardless of actual global turn number.
 *
 * Categories Basic, first Item, second Item and other are disjoint. Items
 * have no other access routes here: no tutoring, mulligan bonus, extra draw,
 * replacement hand, discard/recovery, lock or strategic play is simulated.
 *
 * @param {{size:number,basics:number,firstItem:number,secondItem:number,
 *   opening:number,prizes:number,firstDeadline:number,secondDeadline:number}} p
 * @returns {{basicValidOpening:object,first:object,second:object,
 *   joint:object,conditionalSecondGivenFirst:object,denominator:string}}
 */
function exactTwoItemTiming(p) {
  const {size, basics, firstItem, secondItem, opening, prizes,
    firstDeadline, secondDeadline} = p;
  const args = [size, basics, firstItem, secondItem, opening, prizes,
    firstDeadline, secondDeadline];
  assert.ok(args.every(Number.isSafeInteger));
  assert.ok(size > 0 && basics > 0 && firstItem > 0 && secondItem > 0);
  assert.ok(opening > 0 && prizes >= 0 && firstDeadline >= 0);
  assert.ok(firstDeadline <= secondDeadline && secondDeadline >= 1);
  assert.ok(size >= opening + prizes + secondDeadline);
  const others = size - basics - firstItem - secondItem;
  assert.ok(others >= 0);
  const categories = [basics, firstItem, secondItem, others];
  const openingChoices = choose(size, opening);
  const legalOpenings = openingChoices - choose(size - basics, opening);
  assert.ok(legalOpenings > 0n);
  let ordinaryDrawOrder = 1n;
  for (let i = 0; i < secondDeadline; i++) {
    ordinaryDrawOrder *= BigInt(size - opening - i);
  }
  const expectedDenominator = legalOpenings * ordinaryDrawOrder;
  const totals = {all: 0n, first: 0n, second: 0n, joint: 0n};
  const openingCounts = [0, 0, 0, 0];

  /** @param {number} group @param {number} left @param {bigint} ways */
  function pickOpening(group, left, ways) {
    if (group === 4) {
      if (left !== 0 || openingCounts[0] === 0) return;
      const remaining = categories.map((n, i) => n - openingCounts[i]);
      /** @param {number} draw @param {bigint} weight
       *  @param {number} seenFirst @param {number} seenSecond */
      function orderedDraws(draw, weight, seenFirst, seenSecond) {
        if (draw > secondDeadline) {
          totals.all += weight;
          if (seenFirst > 0) totals.first += weight;
          if (seenSecond > 0) totals.second += weight;
          if (seenFirst > 0 && seenSecond > 0) totals.joint += weight;
          return;
        }
        for (let k = 0; k < remaining.length; k++) {
          const available = remaining[k];
          if (available === 0) continue;
          remaining[k]--;
          orderedDraws(draw + 1, weight * BigInt(available),
            seenFirst + Number(draw <= firstDeadline && k === 1),
            seenSecond + Number(k === 2));
          remaining[k]++;
        }
      }
      orderedDraws(1, ways, openingCounts[1], openingCounts[2]);
      return;
    }
    for (let n = 0; n <= Math.min(categories[group], left); n++) {
      openingCounts[group] = n;
      pickOpening(group + 1, left - n,
        ways * choose(categories[group], n));
    }
    openingCounts[group] = 0;
  }
  pickOpening(0, opening, 1n);
  assert.equal(totals.all, expectedDenominator,
    "Basic-valid opening and ordered draws must partition exactly");
  return {
    basicValidOpening: fraction(legalOpenings, openingChoices),
    first: fraction(totals.first, totals.all),
    second: fraction(totals.second, totals.all),
    joint: fraction(totals.joint, totals.all),
    conditionalSecondGivenFirst: fraction(totals.joint, totals.first),
    denominator: String(totals.all)
  };
}

/** @param {{entries:object[]}} manifest */
function frozenNewMoonOpportunity(manifest) {
  assert.ok(Array.isArray(manifest.entries));
  const sum = rows => rows.reduce((a, entry) => a + entry.count, 0);
  assert.equal(sum(manifest.entries), 60);
  const byName = name => sum(manifest.entries.filter(e => e.name_en === name));
  const pokemon = manifest.entries.filter(e => e.type === "Pokémon");
  assert.equal(sum(pokemon), 19);
  // The exact frozen list's only Evolution cards are its two Dusclops.
  assert.equal(byName("Dusclops"), 2);
  const basics = sum(pokemon) - byName("Dusclops");
  const firstItem = byName("Field Blower");
  const secondItem = byName("Escape Rope");
  assert.deepEqual([basics, firstItem, secondItem], [17, 2, 1]);
  return {
    candidateHash: manifest.canonical_id_count_sha256,
    firstDeadline: "First own turn going second (global T2)",
    secondDeadline: "Third own turn going second (global T6)",
    cardCounts: {basics, fieldBlower: firstItem, escapeRope: secondItem},
    model: exactTwoItemTiming({size: 60, basics, firstItem, secondItem,
      opening: 7, prizes: 6, firstDeadline: 1, secondDeadline: 3}),
    interpretation: "Physical direct visibility only, conditional Basic-valid seven; no action, search, locks or winning inference"
  };
}

if (require.main === module) {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname,
    "../results/als/new-moon-lockbreak-english-proxy-60.json"), "utf8"));
  process.stdout.write(JSON.stringify(frozenNewMoonOpportunity(manifest), null, 2) + "\n");
}

module.exports = {choose, exactTwoItemTiming, frozenNewMoonOpportunity};
