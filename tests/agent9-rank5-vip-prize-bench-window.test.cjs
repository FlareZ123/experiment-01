'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  GROUPS, SOURCE_COUNTS, choose, retainedPrizeChoices,
  calculateWindow, sourceRank5Counts
} = require('../scripts/agent9-rank5-vip-prize-bench-window.cjs');

/** Exact independent ordered-card enumeration for a small physical deck. */
function bruteToy(counts, opener, prizes, basicLimit) {
  const deck = counts.flatMap((n, i) => Array(n).fill(i));
  let favorable = 0;
  let denominator = 0;
  // The toy opener is 2, draw is third. Prize cards follow, uniformly.
  for (let i = 0; i < deck.length; i++) {
    for (let j = 0; j < deck.length; j++) {
      if (j === i) continue;
      for (let k = 0; k < deck.length; k++) {
        if (k === i || k === j) continue;
        const sampled = [deck[i],deck[j],deck[k]];
        const tail = deck.filter((_, z) => z!==i&&z!==j&&z!==k);
        for(let p=0;p<tail.length;p++){
          for(let q=p+1;q<tail.length;q++){
            denominator++;
            const remaining = tail.filter((_, z)=>z!==p&&z!==q);
            const first = sampled.slice(0,opener);
            if (!first.includes(0) || !sampled.includes(5) ||
                sampled.includes(1) || sampled.includes(2) ||
                sampled.filter(x=>[0,3,4].includes(x)).length>basicLimit ||
                ![0,1,2,6].every(group=>remaining.includes(group))) continue;
            favorable++;
          }
        }
      }
    }
  }
  return {favorable,denominator};
}

test('source five physical group counts and exact 60-only rational probability',()=>{
  assert.deepEqual(GROUPS.slice(0,3),['Mew V','Genesect V','Crobat V']);
  assert.deepEqual(SOURCE_COUNTS,[4,4,1,1,1,3,3,43]);
  const actual = calculateWindow();
  assert.equal(actual.total,416717869162795200n);
  assert.equal(actual.favorable,26220915081395880n);
  assert.equal(actual.states,96);
  assert.ok(Math.abs(actual.percentage-6.292246390603521)<1e-11);
});

test('inclusion-exclusion handles simultaneous prized collapse and impossible targets',()=>{
  assert.equal(retainedPrizeChoices([1,1],4,2),1n);
  assert.equal(retainedPrizeChoices([2,0],4,2),0n);
  assert.equal(retainedPrizeChoices([1,1],3,2),0n);
  assert.equal(choose(60,6),50063860n);
});

test('small ten-physical-card brute-force opener/draw/prize parity',()=>{
  const counts=[2,1,1,0,0,1,1,4];
  const exact=calculateWindow(counts,2,2,2);
  const independent=bruteToy(counts,2,2,2);
  assert.equal(exact.favorable*BigInt(independent.denominator),
    exact.total*BigInt(independent.favorable));
  assert.ok(independent.favorable>0);
  assert.equal(independent.denominator,10*9*8*21);
});

// This production assertion only resolves in the actual shared repository.
test('real authenticated original rank5 60 agrees with role categories',()=>{
  const source=require('../results/aichi-2026/full-decklists.json');
  assert.deepEqual(sourceRank5Counts(source),SOURCE_COUNTS);
});
