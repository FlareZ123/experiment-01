'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const VERSION = 'agent41-rank5-quickball-seven-opening-duplicate-v2';
const BASIC_NAMES = new Set([
  'Mew V', 'Genesect V', 'Dedenne-GX', 'Crobat V', "Lillie's Clefairy ex"
]);

/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0)
    throw new RangeError('Invalid binomial arguments');
  if (k > n) return 0;
  let x = 1;
  for (let i = 1; i <= Math.min(k, n - k); i++)
    x = x * (n - i + 1) / i;
  assert.ok(Number.isSafeInteger(x));
  return x;
}

/**
 * Exact multivariate hypergeometric count of physically distinct opening
 * hands. Cards that have the same exact printing are treated as one group.
 * The duplicated "other" printing excludes Quick Ball and DCE; DCE is an
 * independent flag to isolate hands in which it is the only other duplicate.
 *
 * @param {{name:string,count:number,printing?:object}[]} cards
 * @param {number} handSize
 * @returns {object}
 */
function openingCounts(cards, handSize = 7) {
  assert.ok(Array.isArray(cards) && Number.isInteger(handSize) &&
    handSize >= 1 && handSize <= 7);
  const group = new Map();
  for (const row of cards) {
    assert.equal(typeof row.name, 'string');
    assert.ok(Number.isInteger(row.count) && row.count > 0);
    const key = [row.name, row.printing?.set ?? '',
      row.printing?.number ?? ''].join('|');
    const prev = group.get(key);
    if (prev) prev.count += row.count;
    else group.set(key, {name:row.name,count:row.count});
  }
  const totalCards = [...group.values()].reduce((sum, row) => sum+row.count, 0);
  assert.ok(totalCards >= handSize);
  // Each key is [physical hand size, contains QB, contains Basic,
  // contains duplicated other non-QB non-DCE printing, DCE cards held].
  let states = new Map([[JSON.stringify([0,0,0,0,0]), 1]]);
  for (const row of group.values()) {
    const next = new Map();
    for (const [key, ways] of states) {
      const [size,q,b,other,dceHeld] = JSON.parse(key);
      for (let k = 0; k <= Math.min(row.count, handSize-size); k++) {
        const flags = [
          size+k,
          Number(Boolean(q || (row.name === 'Quick Ball' && k > 0))),
          Number(Boolean(b || (BASIC_NAMES.has(row.name) && k > 0))),
          Number(Boolean(other || (row.name !== 'Quick Ball' &&
            row.name !== 'Double Colorless Energy' && k >= 2))),
          dceHeld+(row.name === 'Double Colorless Energy' ? k : 0)
        ];
        const newKey = JSON.stringify(flags);
        next.set(newKey,(next.get(newKey) ?? 0)+ways*choose(row.count,k));
      }
    }
    states = next;
  }
  const result = {
    version:VERSION, handSize, totalCards, exactPrintings:group.size,
    totalOpeningSets:0, basicValidSets:0, quickBallValidSets:0,
    quickBallDuplicateValidSets:0,
    quickBallOnlyDceDuplicateValidSets:0,
    onlyDceDuplicateByHeldCount:{2:0,3:0,4:0}
  };
  for (const [key,ways] of states) {
    const [size,q,b,other,dceHeld] = JSON.parse(key);
    if (size !== handSize) continue;
    result.totalOpeningSets += ways;
    if (!b) continue;
    result.basicValidSets += ways;
    if (!q) continue;
    result.quickBallValidSets += ways;
    if (other || dceHeld >= 2) result.quickBallDuplicateValidSets += ways;
    if (dceHeld >= 2 && !other) {
      result.quickBallOnlyDceDuplicateValidSets += ways;
      result.onlyDceDuplicateByHeldCount[dceHeld] =
        (result.onlyDceDuplicateByHeldCount[dceHeld] ?? 0)+ways;
    }
  }
  assert.equal(result.totalOpeningSets, choose(totalCards,handSize));
  assert.ok(result.quickBallOnlyDceDuplicateValidSets <=
    result.quickBallDuplicateValidSets);
  return result;
}

/** @returns {object} Source-locked original rank5 tournament 60. */
function sourceRank5() {
  const root=path.resolve(__dirname,'..');
  const rows=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8')).decks;
  const rank5=rows.find(row=>row.rank===5);
  const admitted=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/original-printed60-admission-v1.json'),'utf8'))
    .rows.find(row=>row.rank===5);
  assert.equal(admitted.printed60Sha256,
    'a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05');
  assert.equal(rank5.player,'Yamato Nakano');
  assert.equal(rank5.archetype,'Mew Genesect');
  assert.equal(rank5.cards.reduce((n,row)=>n+row.count,0),60);
  const count=name=>rank5.cards.filter(row=>row.name===name)
    .reduce((n,row)=>n+row.count,0);
  assert.equal(count('Quick Ball'),4);
  assert.equal(count('Double Colorless Energy'),4);
  assert.equal([...BASIC_NAMES].reduce((n,name)=>n+count(name),0),11);
  return rank5;
}


/**
 * Condition on a Basic-valid QB opener whose only non-QB duplicate is DCE.
 * After setting this 7-card hand aside, 6 Prize cards are drawn uniformly
 * from the remaining 53. Counts multiply exactly within JS safe integers.
 *
 * @param {object} openings Exact seven-card openingCounts() result.
 * @param {number} sourceDceCopies Registered original deck DCE count.
 * @returns {object}
 */
function conditionalDcePrizeExposure(openings, sourceDceCopies=4) {
  assert.equal(openings.totalCards,60);
  assert.equal(openings.handSize,7);
  assert.equal(sourceDceCopies,4);
  const remaining=53, prizes=6, denominator=choose(remaining,prizes);
  let atLeastOne=0, atLeastTwo=0;
  for (const [heldText,numberOfOpeners] of
    Object.entries(openings.onlyDceDuplicateByHeldCount)) {
    const held=Number(heldText), remainingDce=sourceDceCopies-held;
    const noDcePrizes=choose(remaining-remainingDce,prizes);
    atLeastOne+=numberOfOpeners*(denominator-noDcePrizes);
    atLeastTwo+=numberOfOpeners*
      Array.from({length:Math.max(remainingDce-1,0)},(_,i)=>{
        const k=i+2;
        return choose(remainingDce,k)*choose(remaining-remainingDce,prizes-k);
      }).reduce((sum,n)=>sum+n,0);
  }
  const all=openings.quickBallOnlyDceDuplicateValidSets*denominator;
  assert.ok(Number.isSafeInteger(all)&&Number.isSafeInteger(atLeastOne)&&
    Number.isSafeInteger(atLeastTwo));
  return {
    version:VERSION,
    heldDceDistribution:{...openings.onlyDceDuplicateByHeldCount},
    sevenHandAndSixPrizePairs:all,
    atLeastOneDcePrizedPairs:atLeastOne,
    atLeastTwoDcePrizedPairs:atLeastTwo,
    probabilityAtLeastOneDcePrized:atLeastOne/all,
    probabilityAtLeastTwoDcePrized:atLeastTwo/all
  };
}

module.exports={VERSION,BASIC_NAMES,choose,openingCounts,sourceRank5,
  conditionalDcePrizeExposure};
