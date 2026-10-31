'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const VERSION = 'agent9-crobat-vip-exact-opening-v1';
const RANKS = [4, 5, 8, 11, 16, 19, 22, 26, 30];

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let result = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    result = result * BigInt(n - i + 1) / BigInt(i);
  }
  return result;
}

/**
 * Exact source opening count. At least one Crobat must remain in hand after
 * selecting an Active Basic, which may be another Crobat when two are held.
 * @param {{basicCount:number,vipCount:number,crobatCount?:number,total?:number,opening?:number}} args
 * @returns {object} Exact rational numerators and denominators as BigInt.
 */
function openingCohold(args) {
  const { basicCount: B, vipCount: V, crobatCount: K = 1,
    total = 60, opening = 7 } = args;
  assert.ok([B, V, K, total, opening].every(Number.isSafeInteger));
  assert.ok(K >= 1 && B >= K && V >= 1 && B + V <= total && opening < total);
  const other = total - B - V;
  const denominator = choose(total, opening) - choose(total - B, opening);
  const next = total - opening;
  let first = 0n;
  let nextScaled = 0n;
  let crowdedFirst = 0n;
  let crowdedNextScaled = 0n;
  for (let c = 0; c <= K; c++) {
    for (let v = 0; v <= V; v++) {
      for (let o = 0; o <= B - K; o++) {
        if (c + o < 1) continue;
        const weight = choose(K, c) * choose(V, v) *
          choose(B - K, o) * choose(other, opening - c - v - o);
        const retainedCrobat = c - (o === 0 ? 1 : 0);
        const successFirst = retainedCrobat >= 1 && v >= 1;
        if (successFirst) first += weight;
        let successScaled = 0n;
        if (successFirst) successScaled = BigInt(next);
        else if (retainedCrobat >= 1 && v === 0) successScaled = BigInt(V);
        else if (retainedCrobat === 0 && v >= 1)
          successScaled = BigInt(K - c);
        nextScaled += weight * successScaled;
        // Sensitivity: Bench every opening Basic except the Active and one
        // Crobat reserved in hand, leaving room for two VIP Basics and Crobat.
        if (successFirst && c + o <= 4) crowdedFirst += weight;
        if (successScaled > 0n &&
            c + o <= (retainedCrobat >= 1 ? 4 : 3))
          crowdedNextScaled += weight * successScaled;
      }
    }
  }
  return {
    validSeven: denominator,
    goingFirst: { numerator: first, denominator },
    goingSecond: { numerator: nextScaled, denominator: denominator * BigInt(next) },
    benchEveryOtherBasicFirst: { numerator: crowdedFirst, denominator },
    benchEveryOtherBasicSecond: { numerator: crowdedNextScaled,
      denominator: denominator * BigInt(next) }
  };
}

/** @param {{numerator:bigint,denominator:bigint}} fraction */
function percent(fraction) {
  return (100 * Number(fraction.numerator) / Number(fraction.denominator)).toFixed(10);
}

/**
 * Exact source printed Pokémon are identified by set code and collector number.
 * Some set codes (e.g. ASR) map to both main set and Trainer Gallery.
 * @param {object} source Original source 60 from full-decklists.json.
 * @param {Array<object>} sets From resources/sets/en.json.
 * @param {(id:string)=>Array<object>} cardsForSet Loads original English printing metadata.
 */
function sourceCounts(source, sets, cardsForSet) {
  assert.equal(source.cards.reduce((n, card) => n + card.count, 0), 60);
  const pokemon = source.cards.filter(card => card.category === 'Pokémon');
  let basics = 0;
  for (const row of pokemon) {
    const candidates = sets.filter(s => s.ptcgoCode === row.printing.set);
    assert.ok(candidates.length > 0, `Unmapped set ${row.printing.set}`);
    const number = String(Number(row.printing.number));
    const matching = candidates.flatMap(set => cardsForSet(set.id)
      .filter(card => card.id === `${set.id}-${number}`));
    assert.equal(matching.length, 1, `Ambiguous ${row.name} ${row.printing.set} ${number}`);
    const printed = matching[0];
    assert.equal(printed.supertype, 'Pokémon');
    assert.equal(printed.name.replaceAll('◇', '♢'), row.name);
    if (printed.subtypes.includes('Basic')) basics += row.count;
  }
  const count = name => source.cards.filter(row => row.name === name)
    .reduce((sum, row) => sum + row.count, 0);
  const vip = count('Battle VIP Pass');
  const crobat = count('Crobat V');
  assert.ok(crobat >= 1 && crobat <= basics);
  return { rank: source.rank, archetype: source.archetype,
    basicCount: basics, vipCount: vip, crobatCount: crobat };
}

/** Conditional hand-card count when both played and Crobat's optional draw is taken. */
function handAfterBoth(startHand, order) {
  assert.ok(Number.isSafeInteger(startHand) && startHand >= 2);
  assert.ok(order === 'vip-first' || order === 'crobat-first');
  if (order === 'vip-first') return Math.max(6, startHand - 2);
  return Math.max(6, startHand - 1) - 1;
}

/** Full original-card database audit and exact results. */
function run(root = path.resolve(__dirname, '..')) {
  const source = require(path.join(root, 'results/aichi-2026/full-decklists.json'));
  const sets = require(path.join(root, 'resources/sets/en.json'));
  const cached = new Map();
  const cardsForSet = id => {
    if (!cached.has(id)) cached.set(id, JSON.parse(fs.readFileSync(
      path.join(root, 'resources/cards/en', `${id}.json`), 'utf8')));
    return cached.get(id);
  };
  const rows = RANKS.map(rank => {
    const deck = source.decks.find(row => row.rank === rank);
    assert.ok(deck, `Missing source rank ${rank}`);
    const inventory = sourceCounts(deck, sets, cardsForSet);
    const probability = openingCohold({...inventory,crobatCount:inventory.crobatCount});
    return { ...inventory, goingFirstPercent: percent(probability.goingFirst),
      goingSecondPercent: percent(probability.goingSecond),
      firstBenchPercent: percent(probability.benchEveryOtherBasicFirst),
      secondBenchPercent: percent(probability.benchEveryOtherBasicSecond) };
  });
  return { version: VERSION, rows, competitiveQualifiedGames: 0 };
}

if (require.main === module) process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
module.exports = { VERSION, RANKS, choose, openingCohold, percent,
  sourceCounts, handAfterBoth, run };
