'use strict';

/**
 * Exact rank-31 original-60 direct hand-access model.
 * Frozen source: results/aichi-2026/full-decklists.json (rank 31).
 * Sampling: uniformly valid opening seven, six unseen Prizes, one mandatory draw.
 * Choice: use noneligible Basic Active if possible; otherwise non-Koffing
 * eligible Basic; otherwise a uniformly chosen Koffing. No Bench cards played.
 * This deliberately omits mulligan bonuses, search/draw effects and game play.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const CLASSES = ['koffing', 'eligibleBasic', 'otherBasic', 'eligibleEvolution', 'roxie', 'other'];
const ORDER_SCALE = 420n; // LCM(1..7), for exact hand-order fractions.

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let v = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    v = (v * BigInt(n - Math.min(k, n - k) + i)) / BigInt(i);
  }
  return v;
}

/** @param {object} deck @returns {Record<string, number>} */
function classify(deck, {includeModernEx = false} = {}) {
  const out = Object.fromEntries(CLASSES.map(k => [k, 0]));
  const eligibleBasics = new Set(['Duskull', 'Unown', 'Chimecho', 'Radiant Alakazam',
    ...(includeModernEx ? ['Bloodmoon Ursaluna ex', 'Latias ex'] : [])]);
  const otherBasics = new Set(['Gengar & Mimikyu-GX', 'Tapu Lele-GX',
    ...(includeModernEx ? [] : ['Bloodmoon Ursaluna ex', 'Latias ex'])]);
  const eligibleEvolutions = new Set(['Dusclops', 'Dusknoir']);
  for (const card of deck.cards) {
    const n = card.name;
    const bucket = n === 'Koffing' ? 'koffing'
      : n === 'Roxie' ? 'roxie'
      : eligibleBasics.has(n) ? 'eligibleBasic'
      : otherBasics.has(n) ? 'otherBasic'
      : eligibleEvolutions.has(n) ? 'eligibleEvolution' : 'other';
    out[bucket] += card.count;
    if (n === 'Roxie') assert.deepEqual([card.printing.set, String(card.printing.number)], ['CEC', '205']);
    if (n === 'Koffing') assert.deepEqual([card.printing.set, String(card.printing.number)], ['CEC', '76']);
  }
  assert.deepEqual(out, {
    koffing: 3, eligibleBasic: includeModernEx ? 10 : 8,
    otherBasic: includeModernEx ? 2 : 4,
    eligibleEvolution: 7, roxie: 4, other: 34,
  });
  assert.equal(deck.cards.reduce((s, c) => s + c.count, 0), 60);
  return out;
}

/** @param {Record<string, number>} inventory */
function analyze(inventory) {
  assert.equal(CLASSES.reduce((s, k) => s + inventory[k], 0), 60);
  const stats = {
    validSeven: 0n, openingRawKoffingRoxie: 0n,
    openingRetainedKoffingRoxie: 0n, openingRoxiePayment: 0n,
    afterDrawRoxieHeld: 0n, afterDrawPaymentAtLeastOne: 0n,
    afterDrawPaymentAtLeastTwo: 0n, afterDrawRetainedKoffingRoxie: 0n,
    afterDrawKoffingAndSecondPayment: 0n, afterDrawTwoKoffingAndRoxie: 0n,
    afterDrawOrderedRoxieBeforeKoffingScaled: 0n,
  };
  for (let k = 0; k <= inventory.koffing; k++) {
    for (let g = 0; g <= Math.min(7, inventory.eligibleBasic); g++) {
      for (let b = 0; b <= inventory.otherBasic; b++) {
        for (let e = 0; e <= inventory.eligibleEvolution; e++) {
          for (let r = 0; r <= inventory.roxie; r++) {
            const o = 7 - k - g - b - e - r;
            if (o < 0 || o > inventory.other) continue;
            if (k + g + b === 0) continue;
            const ways = choose(inventory.koffing, k) * choose(inventory.eligibleBasic, g)
              * choose(inventory.otherBasic, b) * choose(inventory.eligibleEvolution, e)
              * choose(inventory.roxie, r) * choose(inventory.other, o);
            stats.validSeven += ways;
            const activeIsKoffing = b + g === 0;
            const retainedK = k - Number(activeIsKoffing);
            const retainedEligible = k + g + e - Number(b === 0);
            if (k > 0 && r > 0) stats.openingRawKoffingRoxie += ways;
            if (retainedK > 0 && r > 0) stats.openingRetainedKoffingRoxie += ways;
            if (retainedEligible > 0 && r > 0) stats.openingRoxiePayment += ways;
            const opening = {koffing: k, eligibleBasic: g, otherBasic: b,
              eligibleEvolution: e, roxie: r, other: o};
            for (const drawClass of CLASSES) {
              const available = inventory[drawClass] - opening[drawClass];
              if (!available) continue;
              const weighted = ways * BigInt(available);
              const nR = r + Number(drawClass === 'roxie');
              const nK = retainedK + Number(drawClass === 'koffing');
              const nEligible = retainedEligible + Number(
                drawClass === 'koffing' || drawClass === 'eligibleBasic' || drawClass === 'eligibleEvolution');
              if (nR === 0) continue;
              stats.afterDrawRoxieHeld += weighted;
              if (nEligible > 0) stats.afterDrawPaymentAtLeastOne += weighted;
              if (nEligible >= 2) stats.afterDrawPaymentAtLeastTwo += weighted;
              if (nK === 0) continue;
              stats.afterDrawRetainedKoffingRoxie += weighted;
              if (nEligible >= 2) stats.afterDrawKoffingAndSecondPayment += weighted;
              if (nK >= 2) stats.afterDrawTwoKoffingAndRoxie += weighted;
              // A uniform choice of which same-class Basic is Active means the
              // retained initial cards are exchangeably ordered.
              if (r > 0 && retainedK > 0) {
                stats.afterDrawOrderedRoxieBeforeKoffingScaled +=
                  weighted * ORDER_SCALE * BigInt(r) / BigInt(r + retainedK);
              } else if (r > 0) {
                // Koffing drawn eighth, Roxie already in the opening hand.
                stats.afterDrawOrderedRoxieBeforeKoffingScaled += weighted * ORDER_SCALE;
              }
            }
          }
        }
      }
    }
  }
  const normalizer = stats.validSeven * 53n;
  assert(normalizer > 0n);
  return Object.fromEntries(Object.entries(stats).map(([name, count]) => {
    const isOpening = name.startsWith('opening');
    const ordered = name.endsWith('Scaled');
    const den = (name === 'validSeven' ? choose(60, 7)
      : isOpening ? stats.validSeven : normalizer) * (ordered ? ORDER_SCALE : 1n);
    return [name, {numerator: count.toString(), denominator: den.toString(),
      percent: Number(count) / Number(den) * 100}];
  }));
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'results', 'aichi-2026', 'full-decklists.json'), 'utf8'));
  const source = manifest.decks.find(deck => deck.rank === 31);
  assert(source, 'Authenticated original rank 31 is missing');
  console.log(JSON.stringify({rank: 31, source: manifest.source,
    conservative: analyze(classify(source)),
    modernExEligible: analyze(classify(source, {includeModernEx: true}))}, null, 2));
}

if (require.main === module) main();
module.exports = {choose, classify, analyze};
