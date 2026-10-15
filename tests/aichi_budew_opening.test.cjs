'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const {choose, openingProbabilities, auditPublishedBudew} = require('../scripts/aichi_budew_opening.cjs');

test('binomial and invalid disjoint categories', () => {
  assert.equal(choose(60,7),386206920);
  assert.throws(()=>openingProbabilities({deckSize:60,handSize:7,basics:2,budew:2,regidragoV:4}),/Invalid/);
});

test('published Budew field coverage and anchor', () => {
  const rows=auditPublishedBudew();
  assert.equal(rows.length,14);
  assert.equal(rows.filter(x=>x.archetype==='Regidrago').length,9);
  const rank10=rows.find(x=>x.rank===10);
  assert.equal(rank10.budewCopies,2);
  assert.ok(Math.abs(rank10.budew-0.25095651668748364)<1e-12);
});

test('small-deck probabilities match exhaustive enumeration', () => {
  const N=10,h=3,b=4,u=1,r=2;
  const cards=['U','R','R','B','O','O','O','O','O','O'];
  let valid=0,bud=0,forced=0,both=0;
  for(let i=0;i<N;i++) for(let j=i+1;j<N;j++) for(let k=j+1;k<N;k++) {
    const selected=[cards[i],cards[j],cards[k]];
    if(selected.every(x=>x==='O')) continue;
    valid++;
    if(selected.includes('U')) {
      bud++;
      if(selected.every(x=>x==='U'||x==='O')) forced++;
      if(selected.includes('R')) both++;
    }
  }
  const out=openingProbabilities({deckSize:N,handSize:h,basics:b,budew:u,regidragoV:r});
  assert.ok(Math.abs(out.budew-bud/valid)<1e-12);
  assert.ok(Math.abs(out.forcedBudew-forced/valid)<1e-12);
  assert.ok(Math.abs(out.budewAndRegidragoV-both/valid)<1e-12);
});
