'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const manifest = require('../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');
const byId = new Map(manifest.cards.map(({ id, count }) => [id, count]));

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let result = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i += 1) {
    result = result * BigInt(n - i + 1) / BigInt(i);
  }
  return result;
}

/** @param {string} id @returns {object} */
function printing(id) {
  const set = id.slice(0, id.lastIndexOf('-'));
  const cards = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'cards', 'en', set + '.json'), 'utf8'));
  const card = cards.find((c) => c.id === id);
  assert.ok(card, 'Missing printed card ' + id);
  return card;
}

/** @param {string} id @returns {number} */
function count(id) { return byId.get(id) || 0; }

// Disjoint printed groups: Active ADP, Double Dragon, Tag Call, Guzma & Hala,
// Thorton, Wild Blaze payload, Regidrago V, VSTAR, Grass/Fire, other Basics, rest.
const categories = [
  count('sm12-156'), count('xy6-97'), count('sm12-206'), count('sm12-193'),
  count('swsh11-167'), count('xy2-69'), count('swsh12-135'), count('swsh12-136'),
  count('swsh12pt5-152') + count('swsh12pt5-153'),
  count('sm2-60') + count('swsh3-104')
];
categories.push(60 - categories.reduce((sum, value) => sum + value, 0));
const BASIC = categories[0] + categories[6] + categories[9];
const PRIZE_OPTIONS = choose(52, 6);

/**
 * Inclusion-exclusion: count six-Prize subsets leaving at least one copy
 * unprized in every required physical category.
 * @param {number[]} remaining
 * @param {number[]} required
 * @returns {bigint}
 */
function favorablePrizes(remaining, required) {
  assert.equal(new Set(required).size, required.length, 'Duplicate Prize requirement');
  if (required.some((index) => remaining[index] === 0)) return 0n;
  let total = 0n;
  for (let mask = 0; mask < (1 << required.length); mask += 1) {
    let unionSize = 0;
    let parity = 0;
    for (let j = 0; j < required.length; j += 1) {
      if (mask & (1 << j)) {
        unionSize += remaining[required[j]];
        parity += 1;
      }
    }
    const ways = choose(52 - unionSize, 6 - unionSize);
    total += parity % 2 === 0 ? ways : -ways;
  }
  return total;
}

/**
 * Enumerate opening seven, ordinary next personal draw, six Prizes.
 * Selecting the draw before Prizes is a counting-equivalent uniform
 * partition of the 53 cards remaining after the opening seven.
 * @param {number[]} deckGroups
 * @returns {{phase1:bigint[],phase1PrizeFiltered:bigint[],total:bigint,valid:bigint,handStates:number}}
 */
function enumerate(deckGroups) {
  assert.equal(deckGroups.reduce((a, b) => a + b, 0), 60);
  const phase1 = [0n, 0n, 0n];
  const phase1PrizeFiltered = [0n, 0n, 0n];
  let handStates = 0;

  /** @param {number} index @param {number[]} hand @param {number} open @param {bigint} ways */
  function visit(index, hand, open, ways) {
    if (index === deckGroups.length - 1) {
      if (open > deckGroups[index] || hand[0] === 0) return;
      const seven = hand.concat(open);
      const handWays = ways * choose(deckGroups[index], open);
      handStates += 1;
      for (let drawn = 0; drawn < deckGroups.length; drawn += 1) {
        const eligible = deckGroups[drawn] - seven[drawn];
        if (eligible === 0) continue;
        const eight = seven.slice();
        eight[drawn] += 1;
        const remaining = deckGroups.map((n, i) => n - eight[i]);
        let route;
        let needed;
        if (eight[1] > 0) { route = 0; needed = []; }
        else if (eight[3] > 0) { route = 1; needed = [1]; }
        else if (eight[2] > 0) { route = 2; needed = [1, 3]; }
        else continue;
        const weight = handWays * BigInt(eligible);
        phase1[route] += weight * favorablePrizes(remaining, needed);
        // Thorton, Charizard, Regidrago V, VSTAR, Basic Energy: unprized only.
        const t2Requirements = [4, 5, 6, 7, 8].filter((i) => eight[i] === 0);
        phase1PrizeFiltered[route] += weight * favorablePrizes(remaining, needed.concat(t2Requirements));
      }
      return;
    }
    for (let used = 0; used <= Math.min(open, deckGroups[index]); used += 1) {
      visit(index + 1, hand.concat(used), open - used, ways * choose(deckGroups[index], used));
    }
  }
  visit(0, [], 7, 1n);
  const allSeven = choose(60, 7);
  const basicValidSeven = allSeven - choose(60 - (deckGroups[0] + deckGroups[6] + deckGroups[9]), 7);
  return {
    phase1, phase1PrizeFiltered,
    total: allSeven * 53n * PRIZE_OPTIONS,
    valid: basicValidSeven * 53n * PRIZE_OPTIONS,
    handStates
  };
}

/** @param {bigint[]} values @returns {bigint} */
function sum(values) { return values.reduce((a, b) => a + b, 0n); }
/** @param {bigint} numerator @param {bigint} denominator @returns {number} */
function percentage(numerator, denominator) { return 100 * Number(numerator) / Number(denominator); }

assert.equal(manifest.cards.reduce((a, c) => a + c.count, 0), 60);
assert.deepEqual(categories, [2, 4, 4, 3, 4, 1, 3, 3, 7, 2, 27]);
assert.equal(BASIC, 7);
assert.ok(printing('sm12-156').attacks.find((a) => a.name === 'Altered Creation-GX')
  .text.includes('at least 1 extra Water Energy'));
assert.match(printing('sm12-193').rules[1], /discard 2 other cards/);
assert.match(printing('sm12-206').rules[0], /TAG TEAM cards/);
assert.match(printing('xy6-97').rules[0], /provides only 2 Energy/);
assert.match(printing('swsh11-167').rules[0], /turns in play/);

const result = enumerate(categories);
assert.equal(result.total, 416717869162795200n);
assert.equal(result.valid, 250397245379590400n);
assert.deepEqual(result.phase1, [37606562218854720n, 18751154685007360n, 16241591574433680n]);
assert.deepEqual(result.phase1PrizeFiltered, [33683669933058368n, 16811214945273120n, 14575986320229440n]);
assert.ok(result.phase1.every((v, i) => result.phase1PrizeFiltered[i] <= v));

// Negative controls replace missing physical printings with non-Basic filler.
for (const index of [0, 1]) {
  const changed = categories.slice();
  changed[changed.length - 1] += changed[index];
  changed[index] = 0;
  assert.equal(sum(enumerate(changed).phase1), 0n, 'Required group missing: ' + index);
}
const noTag = categories.slice();
noTag[10] += noTag[2];
noTag[2] = 0;
assert.ok(sum(enumerate(noTag).phase1) < sum(result.phase1));
const noChar = categories.slice();
noChar[10] += noChar[5];
noChar[5] = 0;
const withoutChar = enumerate(noChar);
assert.equal(sum(withoutChar.phase1PrizeFiltered), 0n);
assert.ok(sum(withoutChar.phase1) > 0n);

// Original rank-6 source, first nine owner-visible physical cards: 7 setup + 2 turns.
// Candidate going second makes the source act on its second turn after candidate GX.
const rank6 = require('../results/aichi-2026/full-decklists.json').decks.find((row) => row.rank === 6);
assert.ok(rank6, 'Original Aichi rank 6 missing');
const sourceBasicCards = rank6.cards.filter((row) => row.category === 'Pokémon');
assert.deepEqual(sourceBasicCards.map(({ name, count }) => ({ name, count })),
  [{ name: 'Iron Thorns ex', count: 4 }]);
const removalCounts = { Plumeria: 4, 'Team Flare Grunt': 2, 'Enhanced Hammer': 2 };
for (const [name, copies] of Object.entries(removalCounts)) {
  assert.equal(rank6.cards.find((row) => row.name === name).count, copies, 'Source removal count: ' + name);
}
const sourceBasicValidSeven = choose(60, 7) - choose(56, 7);
const rank6Denominator = sourceBasicValidSeven * choose(53, 2);
// Under a valid seven with a Basic, exclude all eight remover cards from
// initial seven and both ordinary draws. Prizes are marginalized out exactly.
const rank6NoRemover = (choose(52, 7) - choose(48, 7)) * choose(45, 2);
const rank6RemoverFirstNine = rank6Denominator - rank6NoRemover;
assert.equal(rank6Denominator, 212610958560n);
assert.equal(rank6RemoverFirstNine, 153057025440n);
assert.ok(rank6RemoverFirstNine > rank6Denominator / 2n);

console.log(JSON.stringify({
  status: 'PASS',
  deck: 'agent5 ADP-Thorton-Regidrago fixed v2',
  opportunity: 'T1 going second, ADP Active from opening seven; no extra draws or opponent lock',
  printedBasics: BASIC,
  basicValidOpeningPercent: 100 - percentage(choose(53, 7), choose(60, 7)),
  phase1DirectDDEPercentOfBasicValid: percentage(result.phase1[0], result.valid),
  phase1HeldGuzmaHalaPercentOfBasicValid: percentage(result.phase1[1], result.valid),
  phase1TagCallTutorPercentOfBasicValid: percentage(result.phase1[2], result.valid),
  totalT1AlteredCreationOpportunityPercentOfBasicValid: percentage(sum(result.phase1), result.valid),
  t1AndCriticalT2IdentitiesUnprizedPercentOfBasicValid: percentage(sum(result.phase1PrizeFiltered), result.valid),
  rank6RemoverInFirstNinePercentOfBasicValid: percentage(rank6RemoverFirstNine, rank6Denominator),
  actualNativeGames: 0,
  caution: 'Physical access only: no acceptable discard, actual T2 resource acquisition, opponent answer or game win guaranteed'
}, null, 2));
