'use strict';
const assert = require('node:assert/strict');
const { GROUPS, exactAccess } = require('../scripts/radiant-forest-stone-access.cjs');

/** @param {number} seed */
function randomGenerator(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 0x100000000;
  };
}

/**
 * Brute physical-card deal of a small inventory; separate from the category
 * combinatorial algorithm and using the actual setup -> Prizes -> draw order.
 * @param {readonly number[]} groups
 * @param {number} handSize
 * @param {number} prizeSize
 */
function exhaustiveDeal(groups, handSize, prizeSize) {
  const cards = groups.flatMap((n, category) => Array(n).fill(category));
  const totals = {valid:0, baseline:0, baselineTwo:0, stoneUnion:0, stoneUnionTwo:0, stoneOnly:0, stoneOnlyTwo:0};
  /** @param {number[]} candidates @param {number} n @param {(indices:number[])=>void} visit */
  function combinations(candidates, n, visit) {
    const chosen = [];
    function select(next) {
      if (chosen.length === n) { visit(chosen.slice()); return; }
      for (let i = next; i <= candidates.length - (n - chosen.length); i++) {
        chosen.push(candidates[i]); select(i + 1); chosen.pop();
      }
    }
    select(0);
  }
  const indices = cards.map((_, i) => i);
  combinations(indices, handSize, openingIds => {
    const hand = openingIds.map(i => cards[i]);
    const starter = hand.some(x => x === 0 || x === 2 || x === 6);
    const otherStarter = hand.some(x => x === 2 || x === 6);
    const withoutHand = indices.filter(i => !openingIds.includes(i));
    combinations(withoutHand, prizeSize, prizeIds => {
      const prizes = prizeIds.map(i => cards[i]);
      const withoutPrizes = withoutHand.filter(i => !prizeIds.includes(i));
      for (const drawnId of withoutPrizes) {
        if (!starter) continue;
        totals.valid++;
        if (!otherStarter) continue;
        const seen = hand.concat(cards[drawnId]);
        const deck = withoutPrizes.filter(i => i !== drawnId).map(i => cards[i]);
        const baseline = seen.includes(0) || (deck.includes(0) && seen.includes(4)) || (prizes.includes(0) && seen.includes(5));
        const extra = deck.includes(0) && seen.includes(1) && seen.includes(2);
        const hasTwo = deck.filter(i => i === 3).length >= 2;
        if (baseline) {
          totals.baseline++;
          if (hasTwo) totals.baselineTwo++;
        }
        if (baseline || extra) {
          totals.stoneUnion++;
          if (hasTwo) totals.stoneUnionTwo++;
        }
        if (extra && !baseline) {
          totals.stoneOnly++;
          if (hasTwo) totals.stoneOnlyTwo++;
        }
      }
    });
  });
  return Object.fromEntries(Object.entries(totals).filter(([k]) => k !== 'valid').map(([k, v]) => [k, v / totals.valid]));
}

/**
 * Independent complete 60-card shuffle, physically assigning seven opening,
 * six Prize and one first-turn draw before evaluating the search routes.
 * @param {number} count
 */
function sampleDeals(count) {
  const random = randomGenerator(10262026);
  const deck = GROUPS.flatMap((quantity, category) => Array(quantity).fill(category));
  const counts = {valid:0, baselineTwo:0, stoneUnionTwo:0, stoneOnlyTwo:0};
  for (let round = 0; round < count; round++) {
    for (let k = deck.length-1; k > 0; k--) {
      const j = Math.floor(random() * (k+1));
      [deck[k], deck[j]] = [deck[j], deck[k]];
    }
    const opening = deck.slice(0, 7);
    const prizes = deck.slice(7, 13);
    const inHand = opening.concat(deck[13]);
    if (!opening.some(x => x === 0 || x === 2 || x === 6)) continue;
    counts.valid++;
    if (!opening.some(x => x === 2 || x === 6)) continue;
    const liveDeck = deck.slice(14);
    const radiantInDeck = liveDeck.includes(0);
    const baseline = inHand.includes(0) || (radiantInDeck && inHand.includes(4)) || (prizes.includes(0) && inHand.includes(5));
    const additional = radiantInDeck && inHand.includes(1) && inHand.includes(2);
    const twoVmax = liveDeck.filter(x => x === 3).length >= 2;
    if (twoVmax && baseline) counts.baselineTwo++;
    if (twoVmax && (baseline || additional)) counts.stoneUnionTwo++;
    if (twoVmax && additional && !baseline) counts.stoneOnlyTwo++;
  }
  return Object.fromEntries(Object.entries(counts).filter(([k])=>k!=='valid').map(([k,v])=>[k,v/counts.valid]));
}

assert.deepEqual(GROUPS, [1, 1, 3, 4, 5, 1, 10, 35]);
const exact = exactAccess();
assert.ok(Math.abs(exact.validProbability - 0.8614093191287199) < 1e-12);
assert.ok(Math.abs(exact.baseline - 0.5220484476786743) < 1e-12);
assert.ok(Math.abs(exact.baselineTwo - 0.5065943762478146) < 1e-12);
assert.ok(Math.abs(exact.stoneUnionTwo - 0.5271560688827236) < 1e-12);
assert.ok(Math.abs(exact.stoneUnion - exact.baseline - exact.stoneOnly) < 1e-12);
assert.ok(Math.abs(exact.stoneUnionTwo - exact.baselineTwo - exact.stoneOnlyTwo) < 1e-12);

const MINI = [1, 1, 1, 2, 1, 1, 1, 2];
const miniExact = exactAccess(MINI, 3, 2);
const miniBrute = exhaustiveDeal(MINI, 3, 2);
for (const [key, expected] of Object.entries(miniBrute)) {
  assert.ok(Math.abs(miniExact[key] - expected) < 1e-12, 'Miniature mismatch for '+key+': '+miniExact[key]+' vs '+expected);
}
const sample = sampleDeals(180000);
for (const [key, value] of Object.entries(sample)) {
  assert.ok(Math.abs(value - exact[key]) < 0.006, 'Monte Carlo mismatch for '+key+': '+value+' vs '+exact[key]);
}
console.log(JSON.stringify({reference:exact,miniBrute,sample}, null, 2));
console.log('Forest Seal Stone Radiant opening tests passed.');
