'use strict';
const assert = require('node:assert/strict');
const {test} = require('node:test');
const {choose, classify, analyze} = require('../scripts/agent15-rank31-roxie-firstdraw.cjs');
const SOURCE = {koffing:3, eligibleBasic:8, otherBasic:4, eligibleEvolution:7, roxie:4, other:34};
/** @param {{percent:number}} actual @param {number} expected */
function check(actual, expected) {
  assert.ok(Math.abs(actual.percent-expected)<1e-10, 'percent mismatch '+actual.percent+' vs '+expected);
}
test('BigInt combinations',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(7,2),21n);
  assert.equal(choose(3,4),0n);
  assert.equal(choose(0,0),1n);
});
test('printed source partition and Roxie/Koffing source identity',()=>{
  const cards=[
    ['Koffing',3,'CEC','76'],['Roxie',4,'CEC','205'],
    ['Duskull',3],['Unown',3],['Chimecho',1],['Radiant Alakazam',1],
    ['Gengar & Mimikyu-GX',1],['Bloodmoon Ursaluna ex',1],
    ['Latias ex',1],['Tapu Lele-GX',1],['Dusclops',3],['Dusknoir',4],
    ['Other cards',34],
  ].map(([name,count,set,number])=>({name,count,printing:{set,number}}));
  assert.deepEqual(classify({cards}),SOURCE);
  assert.deepEqual(classify({cards},{includeModernEx:true}),
    {...SOURCE,eligibleBasic:10,otherBasic:2});
  cards[0].printing.number='77';
  assert.throws(()=>classify({cards}));
});
test('source direct first-turn exact rates',()=>{
  const r=analyze(SOURCE);
  check(r.validSeven,88.24992053482626);
  check(r.openingRetainedKoffingRoxie,9.711882821593223);
  check(r.afterDrawRoxieHeld,43.1885268027);
  check(r.afterDrawPaymentAtLeastOne,38.2178461222);
  check(r.afterDrawPaymentAtLeastTwo,24.7814714207);
  check(r.afterDrawRetainedKoffingRoxie,12.7071910026);
  check(r.afterDrawKoffingAndSecondPayment,10.2170441447);
  check(r.afterDrawTwoKoffingAndRoxie,1.2505906037);
  check(r.afterDrawOrderedRoxieBeforeKoffingScaled,6.4997166932);
});
test('held-Koffing access is increasing with source copies in isolated perturbation',()=>{
  const one=analyze({...SOURCE,koffing:1,other:36});
  const four=analyze({...SOURCE,koffing:4,other:33});
  assert.ok(one.afterDrawRetainedKoffingRoxie.percent<four.afterDrawRetainedKoffingRoxie.percent);
});

test('newer lowercase Pokemon ex printing sensitivity is bounded separately',()=>{
  const conservative=analyze(SOURCE);
  const includingEx=analyze({...SOURCE,eligibleBasic:10,otherBasic:2});
  check(includingEx.afterDrawPaymentAtLeastOne,38.71326955278834);
  check(includingEx.afterDrawPaymentAtLeastTwo,26.01880863483182);
  check(includingEx.afterDrawKoffingAndSecondPayment,10.432558172312676);
  assert.equal(includingEx.afterDrawRetainedKoffingRoxie.percent,
    conservative.afterDrawRetainedKoffingRoxie.percent);
});
