'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {choose, prizeDistribution, nextCardsHit} =
  require('../scripts/aichi-prize-conditionals.cjs');

test('exact small binomial coefficients', () => {
  assert.equal(choose(8, 3), 56n);
  assert.equal(choose(52, 6), 20358520n);
  assert.equal(choose(3, 4), 0n);
});

test('rank-6 K0 two other Guzma among 52 unknown and six Prizes', () => {
  const rows = prizeDistribution(52, 2, 6);
  assert.deepEqual(rows.map(row => row.prized), [0, 1, 2]);
  assert.deepEqual(rows.map(row => row.ways),
    [15890700n, 4237520n, 230300n]);
  assert.equal(rows[0].total, 20358520n);
  assert.equal(rows.reduce((sum,row) => sum + row.ways,0n),
    rows[0].total);
  assert.ok(Math.abs(rows[2].p - 0.011312217194570135) < 1e-14);
  assert.equal(Math.ceil(Math.log(0.05) / Math.log(1 - rows[2].p)),264);
});

test('rank-6 post-search Trainers Mail hits one of three VS Seeker', () => {
  const hit = nextCardsHit(44, 3, 4);
  assert.equal(hit.total, 135751n);
  assert.equal(hit.ways, 34481n);
  assert.ok(Math.abs(hit.p - 0.254001812141347) < 1e-14);
  assert.equal(nextCardsHit(44, 3, 1).ways, 3n);
  assert.equal(nextCardsHit(44, 3, 1).total, 44n);
});

test('small-population exhaustive enumeration agrees with distribution', () => {
  const counts = [0,0,0];
  for (let i=0;i<8;i++) for (let j=i+1;j<8;j++)
    for (let k=j+1;k<8;k++) {
      const selected=[i,j,k];
      counts[selected.filter(n=>n<2).length]++;
    }
  const rows=prizeDistribution(8,2,3);
  assert.deepEqual(rows.map(row=>Number(row.ways)), counts);
  assert.equal(rows[0].total,56n);
});


test('all-DCE Prized conditional on valid seven follows published three-Thorns source counts', () => {
  const manifest=require('../results/aichi-2026/full-decklists.json');
  const valid=choose(60,7)-choose(56,7);
  const denom=valid*choose(53,6);
  /** @param {number} k Distinct non-Basic singleton targets required in Prizes. */
  const allPrized=k=>(choose(60-k,7)-choose(56-k,7))*
    choose(53-k,6-k);
  const expected={
    6:{dce:1,allNum:79029n,allDen:779240n,
      unionNum:415977n,unionDen:2142910n},
    24:{dce:3,allNum:2353n,allDen:3857238n,
      unionNum:417026131n,unionDen:4088672280n},
    29:{dce:1,allNum:79029n,allDen:779240n,
      unionNum:415977n,unionDen:2142910n}
  };
  for(const [rankString,exp] of Object.entries(expected)) {
    const rank=Number(rankString);
    const deck=manifest.decks.find(row=>row.rank===rank);
    assert.ok(deck,'published Aichi rank '+rank);
    assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
    assert.deepEqual(deck.cards.filter(c=>c.category==='Pokémon')
      .map(c=>[c.name,c.count]),[['Iron Thorns ex',4]]);
    const count=name=>deck.cards.filter(c=>c.name===name)
      .reduce((n,c)=>n+c.count,0);
    assert.equal(count('Double Colorless Energy'),exp.dce);
    assert.equal(count('Thunder Mountain ♢'),1);
    assert.equal(allPrized(exp.dce)*exp.allDen,denom*exp.allNum);
    const union=allPrized(1)+allPrized(exp.dce)-allPrized(exp.dce+1);
    assert.equal(union*exp.unionDen,denom*exp.unionNum);
  }
});
