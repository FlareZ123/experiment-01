'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {allPrizedAfterLegalSeven,main} =
  require('../scripts/new-moon-gengar-cologne-prize-collapse.cjs');

/** @param {number} got @param {number} expected */
function near(got,expected) {
  assert.ok(Math.abs(got-expected)<1e-12,
    'Expected '+expected+'; observed '+got);
}

test('legality conditioning changes Basic and non-Basic Prize probabilities',()=>{
  near(allPrizedAfterLegalSeven(17,1,1),0.09879767746216359);
  near(allPrizedAfterLegalSeven(17,2,0),0.008554699165513536);
  near(allPrizedAfterLegalSeven(18,2,2),0.008293526084675375);
  near(allPrizedAfterLegalSeven(18,1,0),0.10042509844812446);
});

test('exact canonical single-slot swap exchanges Gengar and Cologne Prize bottlenecks',()=>{
  const {original,alternative,deltaAllGengarPrized,deltaAllColognePrized}=main();
  near(original.openingValid,0.9165625670301298);
  near(alternative.openingValid,0.9301454049554576);
  near(original.allGengarPrized,0.09879767746216359);
  near(alternative.allGengarPrized,0.008293526084675375);
  near(original.allColognePrized,0.008554699165513536);
  near(alternative.allColognePrized,0.10042509844812446);
  assert.ok(deltaAllGengarPrized< -0.09);
  assert.ok(deltaAllColognePrized>0.09);
});

test('multi-prized collapse includes actual Basic composition of each target group',()=>{
  const {original,alternative}=main();
  near(original.allGengarAndMewtwoPrized,0.0005599384690313177);
  near(alternative.allGengarAndMewtwoPrized,0.000029223819468503615);
  near(original.allGengarAndColognePrized,0.0005834350986548553);
  near(alternative.allGengarAndColognePrized,0.0005749152432185368);
  assert.equal(allPrizedAfterLegalSeven(18,7,7),0);
});

test('reject structurally impossible designated groups',()=>{
  assert.throws(()=>allPrizedAfterLegalSeven(17,2,3));
  assert.throws(()=>allPrizedAfterLegalSeven(17,44,0));
  assert.throws(()=>allPrizedAfterLegalSeven(0,1,0));
});
