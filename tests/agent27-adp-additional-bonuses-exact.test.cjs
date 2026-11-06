'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {countMulliganBonuses}=
 require('../simulation/evaluation/agent27-adp-additional-bonuses-exact.cjs');
const {FULL60,PROFILES}=
 require('../simulation/evaluation/agent27-adp-original29-four-bonus-bounds.cjs');
test('printed sixty exact zero through four accepted bonus counts',()=>{
 for(let n=0;n<=4;n++){
  const x=countMulliganBonuses(n),expected=FULL60[n];
  assert.equal(x.denominator,expected.denominator,'denominator n='+n);
  assert.equal(x.mechanical,expected.mechanical,'mechanical n='+n);
  for(const p of PROFILES.slice(1))
   assert.equal(x.histograms[p][0],expected[p],'zero protected '+p+' n='+n);
 }
});
