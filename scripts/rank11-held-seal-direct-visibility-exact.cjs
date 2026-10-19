'use strict';

const assert = require('node:assert/strict');
const field = require('../results/aichi-2026/full-decklists.json');

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
  const d = gcd(numerator, denominator);
  return {numerator: String(numerator / d),
    denominator: String(denominator / d),
    percent: 100 * Number(numerator) / Number(denominator)};
}

/**
 * Exclusive card categories in the exact published rank-11 60. The remaining
 * category includes other Trainer, Energy and nonstarter cards only.
 */
function sourceCategories() {
  const source = field.decks.find(deck => deck.rank === 11);
  assert.ok(source, 'Missing exact source rank 11');
  const count = name => source.cards.find(card => card.name === name)?.count ?? 0;
  const categoryCounts = [
    count('Forest Seal Stone'),
    count('Float Stone') + count('Muscle Band'),
    count('Oranguru V') + count('Crobat V'),
    count('Trubbish'),
    count('Battle VIP Pass'),
    count('Boost Shake'),
    count('Garbodor'),
    ['Mega Absol ex', 'Latias ex', 'Tapu Lele-GX', 'Squawkabilly ex']
      .reduce((sum, name) => sum + count(name), 0)
  ];
  const [seal, otherTool, v, trubbish, vip, shake, garbodor, otherBasic] =
    categoryCounts;
  assert.deepEqual(categoryCounts, [2, 4, 3, 2, 4, 2, 2, 6]);
  assert.equal(source.cards.reduce((sum, card) => sum + card.count, 0), 60);
  assert.equal(v + trubbish + otherBasic, 11);
  assert.equal(v + trubbish + otherBasic + garbodor, 13);
  return {counts:categoryCounts, remainder:60-categoryCounts.reduce((a,b)=>a+b,0),
    basics:11};
}

/**
 * Exact distinct-slot deals: seven opening cards, six face-down Prize cards,
 * then first natural draw. The first eight own cards are exchangeable as an
 * unordered size-eight subset, but a unique Basic in that subset must not be
 * the eighth card. This corrects for Basic-valid starting sevens.
 *
 * Stages represent resource inclusion only; they are not actual-action rates.
 * @returns {object}
 */
function analyze() {
  const {counts, remainder, basics} = sourceCategories();
  const firstSevenValid = choose(60, 7)-choose(60-basics, 7);
  const allSevens = choose(60, 7);
  const allEight = choose(60, 8);
  const prizeDraws = choose(52, 6);
  const totals = Array.from({length:4}, () => 0n);
  const selected = Array.from({length:counts.length}, () => 0);

  /** @param {number} category @param {number} used @param {bigint} ways */
  function visit(category, used, ways) {
    if (category < counts.length) {
      for (let k=0; k<=Math.min(counts[category], 8-used); k++) {
        selected[category]=k;
        visit(category+1, used+k, ways*choose(counts[category], k));
      }
      return;
    }
    const [seal,tool,v,trubbish,vip,shake,garbodor,otherBasic] = selected;
    const basicsInEight = v+trubbish+otherBasic;
    if (!basicsInEight || !seal || (!tool && seal<2) || !v ||
        (!trubbish && !vip)) return;
    const validSevenWeight = basicsInEight===1 ? 7n : 8n;
    const physicalWays=ways*choose(remainder,8-used)*validSevenWeight;
    totals[0]+=physicalWays*prizeDraws;
    if (shake) return;
    totals[1]+=physicalWays*prizeDraws;
    if (garbodor===2) return;
    totals[2]+=physicalWays*prizeDraws;
    const accessibleShake = 2-shake;
    const accessibleGarbodor = 2-garbodor;
    const prizeWays = prizeDraws -
      choose(52-accessibleShake, 6-accessibleShake) -
      choose(52-accessibleGarbodor, 6-accessibleGarbodor) +
      choose(52-accessibleShake-accessibleGarbodor,
        6-accessibleShake-accessibleGarbodor);
    totals[3]+=physicalWays*prizeWays;
  }
  visit(0, 0, 1n);
  const denominator=8n*allEight*prizeDraws*firstSevenValid;
  return {
    scope:'Natural first seven plus mandatory first draw; valid Basic start, no mulligan bonuses, no search/draw actions',
    categoryCounts:counts, remainder, basics,
    validSeven:fraction(firstSevenValid, allSevens),
    gates:['held Forest Seal Stone, separate Tool, own V and Trubbish-or-VIP visible',
      'no Boost Shake in first eight',
      'not both Garbodor in first eight',
      'at least one Boost Shake and Garbodor physically unprized and in deck'],
    results:totals.map(n => fraction(n*allSevens, denominator))
  };
}

if (require.main===module) process.stdout.write(JSON.stringify(analyze(),null,2)+'\n');
module.exports={choose,sourceCategories,analyze};
