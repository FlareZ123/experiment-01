'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  choose, allOutside, rank31Counts, openingOpportunity
} = require('./aichi-dusknoir-grand-tree-opening.cjs');

const ZONES = Object.freeze({
  hand: 7, prizes: 6, firstDraw: 1, secondDraw: 1, deck: 45
});
const EARLY = Object.freeze(['hand', 'firstDraw', 'secondDraw']);

/**
 * Conditional access after both distinguished singletons (Grand Tree and
 * Stadium Nav) occupy known zones. The other 58 cards remain exchangeable.
 * @param {number[]} groups Remaining [Duskull, other Basics, PRE Dusclops,
 *   PRE Dusknoir, other cards] (Grand Tree and Stadium Nav removed).
 * @param {number} handCount Number of undistinguished initial-hand cards.
 * @param {number} firstDrawCount Number of undistinguished first-draw cards.
 * @param {number} deckCount Number of undistinguished cards in final deck.
 * @returns {number}
 */
function conditionalStages(groups, handCount, firstDrawCount, deckCount) {
  const total = groups.reduce((sum, x) => sum + x, 0);
  const handWays = choose(total, handCount);
  let result = 0;
  for (let d = 0; d <= Math.min(groups[0], handCount); d += 1) {
    for (let b = 0; b <= Math.min(groups[1], handCount - d); b += 1) {
      if (d + b === 0) continue;
      for (let s1 = 0; s1 <= Math.min(groups[2], handCount - d - b); s1 += 1) {
        for (let s2 = 0; s2 <= Math.min(groups[3], handCount - d - b - s1); s2 += 1) {
          const rest = handCount - d - b - s1 - s2;
          if (rest < 0 || rest > groups[4]) continue;
          const hand = [d, b, s1, s2, rest];
          const handWeight = hand.reduce((weight, count, index) =>
            weight * choose(groups[index], count), 1) / handWays;
          const pending = groups.map((count, index) => count - hand[index]);
          const options = firstDrawCount === 0 ? [null] : [0, 1, 2, 3, 4];
          for (const draw of options) {
            if (draw !== null && pending[draw] === 0) continue;
            if (d + Number(draw === 0) === 0) continue;
            const remaining = [...pending];
            const drawWeight = draw === null ? 1 : remaining[draw] /
              remaining.reduce((sum, x) => sum + x, 0);
            if (draw !== null) remaining[draw] -= 1;
            const unseen = remaining.reduce((sum, x) => sum + x, 0);
            const outside = unseen - deckCount;
            const s = remaining[2];
            const n = remaining[3];
            const survived = 1 -
              allOutside(s, outside, unseen) -
              allOutside(n, outside, unseen) +
              allOutside(s + n, outside, unseen);
            result += handWeight * drawWeight * survived;
          }
        }
      }
    }
  }
  return result;
}

/**
 * Extend direct Grand Tree opportunity by the actual rank-31 Stadium Nav:
 * two independent fair coins, at least one heads searches Grand Tree if in
 * the remaining deck. No Item lock, search sequencing or discard constraints.
 * @param {ReturnType<typeof rank31Counts>} counts
 * @param {number} stadiumNavCopies Rank-31 exact printing count, required 1.
 * @returns {object}
 */
function stadiumNavOpportunity(counts, stadiumNavCopies = 1) {
  if (stadiumNavCopies !== 1 || counts.grandTree !== 1 || counts.total !== 60 ||
      counts.other < 1) {
    throw new Error('Expected one source-verified Stadium Nav and one Grand Tree.');
  }
  const groups = [counts.duskull, counts.otherBasics, counts.dusclops,
    counts.cursedDusknoir, counts.other - 1];
  const memo = new Map();
  let directJoint = 0, navBeforeCoins = 0;
  for (const [grandZone, grandCapacity] of Object.entries(ZONES)) {
    for (const [navZone, navCapacity] of Object.entries(ZONES)) {
      const afterGrand = navCapacity - Number(grandZone === navZone);
      if (afterGrand === 0) continue;
      const placement = grandCapacity / 60 * afterGrand / 59;
      const h = ZONES.hand - Number(grandZone === 'hand') -
        Number(navZone === 'hand');
      const firstDraw = 1 - Number(grandZone === 'firstDraw') -
        Number(navZone === 'firstDraw');
      const deck = ZONES.deck - Number(grandZone === 'deck') -
        Number(navZone === 'deck');
      const key = [h, firstDraw, deck].join(':');
      if (!memo.has(key)) {
        memo.set(key, conditionalStages(groups, h, firstDraw, deck));
      }
      const opportunity = placement * memo.get(key);
      if (EARLY.includes(grandZone)) directJoint += opportunity;
      else if (grandZone === 'deck' && EARLY.includes(navZone)) {
        navBeforeCoins += opportunity;
      }
    }
  }
  const independentDirect = openingOpportunity(counts);
  if (Math.abs(independentDirect.directJoint - directJoint) > 1e-12) {
    throw new Error('Two-singleton enumeration disagrees with direct-draw model.');
  }
  const navSearchJoint = navBeforeCoins * 0.75;
  const combinedJoint = directJoint + navSearchJoint;
  const validOpening = independentDirect.validOpening;
  return {
    directJoint, navBeforeCoins, navSearchJoint, combinedJoint,
    validOpening, conditionalValidDirect: directJoint / validOpening,
    conditionalValidNavOnly: navSearchJoint / validOpening,
    conditionalValidCombined: combinedJoint / validOpening,
    searchHeadsProbability: 0.75,
    claim: 'Direct Grand Tree plus one printed Stadium Nav with at least one heads; conditional resource opportunity, not an executed evolution.'
  };
}

if (require.main === module) {
  const source = JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'), 'utf8'));
  const count = source.decks.find(d => d.rank === 31).cards
    .filter(c => c.name === 'Stadium Nav' && c.printing.set === 'UNM' &&
      String(c.printing.number) === '208')
    .reduce((sum, c) => sum + c.count, 0);
  const outcome = stadiumNavOpportunity(rank31Counts(source), count);
  process.stdout.write(JSON.stringify(outcome, null, 2) + '\n');
}

module.exports = {ZONES, EARLY, conditionalStages, stadiumNavOpportunity};
