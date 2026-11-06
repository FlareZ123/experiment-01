'use strict';

const assert=require('node:assert/strict');
const {COUNTS,DECK,evaluate,makeRandom,sampleDeal,simulate,exactArtazonIncrement}=
  require('../scripts/agent28-sentinel-artazon-direct-opening.cjs');

/** @param {string[]} opening @param {string[]} prizes @param {string} draw */
function fixture(opening,prizes,draw) {
  const remaining=Object.entries(COUNTS).flatMap(([k,n])=>Array(n).fill(k));
  for(const c of [...opening,...prizes,draw]) {
    const i=remaining.indexOf(c);
    assert.notEqual(i,-1);
    remaining.splice(i,1);
  }
  assert.equal(opening.length,7);
  assert.equal(prizes.length,6);
  assert.equal(remaining.length,46);
  return {opening,prizes,draw,remaining};
}
assert.equal(DECK.length,60);
assert.equal(Object.values(COUNTS).reduce((a,b)=>a+b,0),60);

// Fan Rotom is Prized. Artazon may still bench Bunnelby directly.
const directB=fixture(['O','X','G','J','M','Y','Y'],
  ['F','Y','Y','Y','Y','Y'],'Y');
assert.equal(evaluate(directB).oldOpportunity,false);
assert.equal(evaluate(directB).artB,true);
assert.equal(evaluate(directB).improvedAccess,true);

// With Fan in deck the older connector route still exists.
const redundantFan=fixture(['O','X','G','J','M','Y','Y'],
  ['Y','Y','Y','Y','Y','Y'],'Y');
assert.equal(evaluate(redundantFan).artFan,true);
assert.equal(evaluate(redundantFan).artB,true);
assert.equal(evaluate(redundantFan).connectorDominance,true);

// Neither Fan nor Artazon accessible means no Bunnelby acquisition here.
const noArt=fixture(['O','X','G','J','M','Y','Y'],
  ['A','F','Y','Y','Y','Y'],'Y');
assert.equal(evaluate(noArt).newOpportunity,false);

// Opening Bunnelby can fund Evolution with Capture Energy and Bench Oddish.
const capture=fixture(['B','X','G','C','M','Y','Y'],
  ['A','F','Y','Y','Y','Y'],'Y');
assert.equal(evaluate(capture).captureOdd,true);
assert.equal(evaluate(capture).newOpportunity,true);

// First seven without Basic is an invalid opening, even if the draw is Oddish.
const invalid=fixture(['G','J','M','Y','Y','Y','Y'],
  ['F','Y','Y','Y','Y','Y'],'O');
assert.equal(evaluate(invalid).valid,false);
assert.equal(evaluate(invalid).newOpportunity,false);

// Printed TM searches the deck: two Vileplume Prized blocks the Stage 2.
const stageGone=fixture(['O','X','G','J','M','Y','Y'],
  ['V','V','Y','Y','Y','Y'],'Y');
assert.equal(evaluate(stageGone).core,false);
assert.equal(evaluate(stageGone).newOpportunity,false);

const exact=exactArtazonIncrement();
assert.equal(exact.numerator,4501012225570856n);
assert.equal(exact.denominator,416717869162795200n);
assert.equal(exact.validDenominator,358964655944294400n);
assert.ok(Math.abs(exact.conditionalValidPercent-1.2538872981)<1e-9);

const s=simulate(20000,25062026);
assert.equal(JSON.stringify(s),JSON.stringify(simulate(20000,25062026)));
assert.equal(s.counts.newOpportunity-s.counts.oldOpportunity,s.counts.improvedAccess);

const random=makeRandom(1001);
for(let i=0;i<10000;i++) {
  const deal=sampleDeal(DECK,random);
  if(evaluate(deal).improvedAccess)assert.ok(deal.prizes.includes('F'));
}
console.log('PASS Sentinel direct-Artazon exact/matched-deal tests');
