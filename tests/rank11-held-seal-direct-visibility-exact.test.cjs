'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {choose, sourceCategories, analyze} =
  require('../scripts/rank11-held-seal-direct-visibility-exact.cjs');

test('source categories are disjoint and physically total 60', () => {
  const source = sourceCategories();
  assert.deepEqual(source.counts, [2,4,3,2,4,2,2,6]);
  assert.equal(source.remainder,35);
  assert.equal(source.basics,11);
  assert.equal(choose(60,8), 2558620845n);
  assert.equal(choose(52,6), 20358520n);
});

test('exact fractions match independent rational enumeration and form nested gates', () => {
  const answer = analyze();
  assert.deepEqual(answer.validSeven,
    {numerator:'1137524',denominator:'1462905',percent:77.75788585041407});
  assert.deepEqual(answer.results.map(x => [x.numerator,x.denominator]),[
    ['98970715','5305411936'],
    ['83917095','5305411936'],
    ['83489089','5305411936'],
    ['869347470093','57452305854944']
  ]);
  for (let i=1; i<answer.results.length; i++) {
    assert.ok(answer.results[i].percent <= answer.results[i-1].percent);
  }
});

test('seeded physical seven/prize/draw Monte Carlo corroborates four exact stages', () => {
  const {counts,remainder} = sourceCategories();
  const original=[];
  for (let category=0; category<counts.length;category++) {
    for (let j=0;j<counts[category];j++) original.push(category);
  }
  for(let i=0;i<remainder;i++) original.push(8);
  assert.equal(original.length,60);
  let seed=0x7f3ac91;
  /** @returns {number} */
  function next() {
    seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
    return (seed>>>0)/4294967296;
  }
  const hits=[0,0,0,0];
  let valid=0;
  for (let trial=0;trial<150000;trial++) {
    const deck=original.slice();
    for (let i=0;i<14;i++) {
      const j=i+Math.floor(next()*(60-i));
      [deck[i],deck[j]]=[deck[j],deck[i]];
    }
    const h=Array(9).fill(0);
    let basics=0;
    for (let i=0;i<7;i++) {
      h[deck[i]]++;
      if ([2,3,7].includes(deck[i])) basics++;
    }
    if (!basics) continue;
    valid++;
    h[deck[13]]++;
    const [seal,tool,v,trubbish,vip,shake,garbodor] = h;
    if (!(seal>0 && (tool>0 || seal===2) && v>0 &&
          (trubbish>0 || vip>0))) continue;
    hits[0]++;
    if (shake>0) continue;
    hits[1]++;
    if (garbodor===2) continue;
    hits[2]++;
    let prizedShake=0,prizedGarbodor=0;
    for(let i=7;i<13;i++) {
      if (deck[i]===5) prizedShake++;
      if (deck[i]===6) prizedGarbodor++;
    }
    if (prizedShake >= 2 || prizedGarbodor >= 2-garbodor) continue;
    hits[3]++;
  }
  const exact=analyze().results.map(row=>row.percent);
  for(let i=0;i<4;i++) {
    const simulated=100*hits[i]/valid;
    assert.ok(Math.abs(simulated-exact[i])<0.14,
      'stage '+i+': physical '+simulated+'% versus exact '+exact[i]+'%');
  }
});
