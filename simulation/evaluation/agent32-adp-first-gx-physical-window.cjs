'use strict';

const assert = require('node:assert/strict');
const fixed60 = require('../../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');
const { choose } = require('./agent5-adp-thorton-prize-availability.cjs');

const VERSION = 'agent32-adp-first-gx-physical-window-v1';
const BASIC_IDS = new Set(['sm12-156','swsh12-135','sm2-60','swsh3-104']);
const IDS = Object.freeze({
  adp: 'sm12-156',
  dde: 'xy6-97',
  guzmaHala: 'sm12-193',
  tagCall: 'sm12-206'
});

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) { const t = a % b; a = b; b = t; }
  return a;
}

/** @param {bigint} numerator @param {bigint} denominator @returns {object} */
function ratio(numerator, denominator) {
  assert.ok(denominator > 0n);
  const g = gcd(numerator, denominator);
  return {
    numerator: (numerator / g).toString(),
    denominator: (denominator / g).toString(),
    fraction: Number(numerator) / Number(denominator),
    percent: Number(numerator) * 100 / Number(denominator)
  };
}

/**
 * Count Prize allocations that leave at least one copy of every required
 * physical card group in the 52-card post-first-draw remainder.
 * @param {number[]} remaining Required distinct groups' remaining copy counts.
 * @returns {bigint}
 */
function prizeSurvival(remaining) {
  if (remaining.some(n => !Number.isSafeInteger(n) || n <= 0)) return 0n;
  let ways = 0n;
  for (let mask = 0; mask < (1 << remaining.length); mask++) {
    let exhausted = 0, parity = 0;
    for (let i = 0; i < remaining.length; i++) {
      if (mask & (1 << i)) { exhausted += remaining[i]; parity++; }
    }
    if (exhausted > 6) continue;
    const count = choose(52 - exhausted, 6 - exhausted);
    ways += parity % 2 === 0 ? count : -count;
  }
  return ways;
}

/**
 * Exact owner-location screen on the printed fixed 60, for going second.
 * Seven starting cards are drawn first, followed by the ordinary first-turn
 * eighth card; six Prize cards are sampled disjointly from the other 52.
 * ADP must have been among the INITIAL seven to start Active.
 *
 * Direct branch: DDE in first eight. Search branches: no held DDE,
 * G&H in first eight, or Tag Call there with G&H still in deck;
 * a DDE must survive Prizes in both search branches.
 *
 * Physically enough extra hand cards exist to pay G&H's two-card option,
 * but their strategic discardability, Item/Supporter permission, attack
 * permission, Stadium/card-effect fidelity and opponent interference are
 * deliberately outside this physical-access event.
 *
 * @param {{id:string,count:number}[]} [rows] Fixed 60 source.
 * @returns {object} Disjoint exact numerators and conditional probabilities.
 */
function evaluate(rows = fixed60.cards) {
  assert.equal(rows.reduce((sum, c) => sum + c.count, 0), 60);
  const m = new Map(rows.map(c => [c.id, c.count]));
  assert.equal(m.size, rows.length, 'A printing may occur only once in the manifest');
  const get = key => m.get(IDS[key]) || 0;
  const basic = rows.reduce((sum, c) => sum +
    (BASIC_IDS.has(c.id) ? c.count : 0), 0);
  const adp = get('adp');
  const counts = [
    adp, basic - adp, get('dde'), get('guzmaHala'), get('tagCall'),
    60 - basic - get('dde') - get('guzmaHala') - get('tagCall')
  ];
  assert.ok(counts.every(n => Number.isSafeInteger(n) && n >= 0));
  assert.ok(basic > 0 && basic <= 60);
  const categories = ['ADP','Other Basic','DDE','Guzma & Hala','Tag Call','Other'];
  const allPrizeSets = choose(52, 6);
  const validSeven = choose(60, 7) - choose(60 - basic, 7);
  const denominator = validSeven * 53n * allPrizeSets;
  const favorable = [0n, 0n, 0n];
  let allValidMass = 0n;
  const h = Array(counts.length).fill(0);

  /** @param {number} category @param {number} left @param {bigint} ways */
  function walk(category, left, ways) {
    if (category === counts.length) {
      if (left !== 0 || h[0] === 0) return;
      for (let drawn = 0; drawn < counts.length; drawn++) {
        const available = counts[drawn] - h[drawn];
        if (available <= 0) continue;
        const e = [...h]; e[drawn]++;
        const handWays = ways * BigInt(available);
        allValidMass += handWays * allPrizeSets;
        if (e[2] > 0) {
          favorable[0] += handWays * allPrizeSets;
        } else if (e[3] > 0) {
          favorable[1] += handWays * prizeSurvival([counts[2]]);
        } else if (e[4] > 0) {
          favorable[2] += handWays *
            prizeSurvival([counts[2], counts[3]]);
        }
      }
      return;
    }
    for (let n = 0; n <= Math.min(counts[category], left); n++) {
      h[category] = n;
      walk(category + 1, left - n, ways * choose(counts[category], n));
    }
  }
  walk(0, 7, 1n);
  const total = favorable.reduce((sum, n) => sum + n, 0n);
  const adpStarter = (choose(60,7) - choose(60 - adp,7)) *
    53n * allPrizeSets;
  assert.equal(allValidMass, adpStarter);
  assert.ok(total <= adpStarter && adpStarter <= denominator);
  return {
    version: VERSION,
    deck: 'results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json',
    canonicalCardsSha256: fixed60.canonicalCardsSha256,
    physicalCategories: Object.fromEntries(categories.map((name, i) => [name, counts[i]])),
    basicCount: basic,
    conditioning: 'Initial seven contain at least one Basic; genuine ADP in initial seven; first ordinary draw; then disjoint six Prizes',
    validSevenCount: validSeven.toString(),
    denominator: denominator.toString(),
    directHeldDDE: ratio(favorable[0], denominator),
    guzmaHalaHeldSearchDDE: ratio(favorable[1], denominator),
    tagOnlySearchDDE: ratio(favorable[2], denominator),
    combined: ratio(total, denominator),
    adpStarter: ratio(adpStarter, denominator),
    claimedWins: 0,
    exclusions: 'No additional draws, search for ADP, Active switching, opponent first turn, Item/Supporter lock, paper payment choice, native prompts, game state or win rate'
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(evaluate(), null, 2) + '\n');
module.exports = { VERSION, BASIC_IDS, IDS, gcd, ratio, prizeSurvival, evaluate };
