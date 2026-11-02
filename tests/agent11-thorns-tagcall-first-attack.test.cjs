'use strict';
const assert = require('node:assert/strict');
const {
  choose, countSourceAttackLine, countsForOriginal
} = require('../scripts/agent11-thorns-tagcall-first-attack.cjs');

assert.equal(choose(60, 0), 1n);
assert.equal(choose(60, 7), 386206920n);
assert.equal(choose(3, 4), 0n);

/** @param {number[]} counts @param {number} handSize @param {number} prizeSize */
function brute(counts, handSize, prizeSize) {
  const cards = counts.flatMap((count, category) => Array(count).fill(category));
  let favorable = 0, broader = 0, total = 0;
  /** @param {number[]} chosen @param {number[]} remaining @param {number} size @returns {number[][]} */
  function choosePositions(chosen, remaining, size) {
    if (chosen.length === size) return [chosen];
    return remaining.flatMap((n, index) => choosePositions(
      [...chosen, n], remaining.slice(index + 1), size));
  }
  const all = Array.from(cards.keys());
  for (const h of choosePositions([], all, handSize)) {
    if (!h.some(i => cards[i] === 0)) continue;
    const withoutH = all.filter(i => !h.includes(i));
    for (const p of choosePositions([], withoutH, prizeSize)) {
      const withoutP = withoutH.filter(i => !p.includes(i));
      for (const next of withoutP) {
        total++;
        const held = [...h, next].map(i => cards[i]);
        const remaining = withoutP.filter(i => i !== next).map(i => cards[i]);
        const connector = held.includes(1) || (held.includes(2) && remaining.includes(1));
        if (remaining.includes(3) && remaining.includes(4) && connector) favorable++;
        if ((held.includes(3) || (connector && remaining.includes(3))) &&
          (held.includes(4) || (connector && remaining.includes(4)))) broader++;
      }
    }
  }
  return { favorable, broader, total };
}

const toy = [2, 1, 1, 1, 1, 2];
const exactToy = countSourceAttackLine(toy, 2, 1);
const bruteToy = brute(toy, 2, 1);
assert.equal(exactToy.favorable, BigInt(bruteToy.favorable));
assert.equal(exactToy.broader, BigInt(bruteToy.broader));
assert.equal(exactToy.denominator, BigInt(bruteToy.total));

for (const [dce, p, broad] of [
  [1, 0.2537731070353226, 0.3378150571059356],
  [3, 0.3207036626630127, 0.39107850627345275]
]) {
  const exact = countSourceAttackLine([4, 2, 2, 1, dce, 51 - dce]);
  assert.ok(Math.abs(exact.probability - p) < 1e-12);
  assert.ok(Math.abs(exact.broaderProbability - broad) < 1e-12);
  assert.ok(exact.broader >= exact.favorable);
  assert.equal(exact.denominator, 166478632771651200n);
}
const fake = {
  cards: [
    {category:'Pokémon',count:4,name:'Iron Thorns ex',printing:{set:'TWM',number:'77'}},
    {category:'Trainer',count:2,name:'Guzma & Hala',printing:{set:'CEC',number:'193'}},
    {category:'Trainer',count:2,name:'Tag Call',printing:{set:'CEC',number:'206'}},
    {category:'Trainer',count:1,name:'Thunder Mountain ♢',printing:{set:'LOT',number:'191'}},
    {category:'Energy',count:3,name:'Double Colorless Energy',printing:{set:'SUM',number:'136'}},
    {category:'Trainer',count:48,name:'Other',printing:{set:'X',number:'1'}}
  ]
};
assert.deepEqual(countsForOriginal(fake), [4,2,2,1,3,48]);
console.log('Agent11 Thunder Mountain / DCE exact-source line: 8 local checks passed');
