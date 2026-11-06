'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {COUNTS,PROFILES,countWonderTagBonuses:count}=
 require('../simulation/evaluation/agent27-adp-wondertag-bonus.cjs');
const original=require('../simulation/evaluation/agent5-adp-wondertag-paid-opening.cjs');
const {EVENTS}=require('../simulation/evaluation/agent27-adp-conditional-bonus-counts.cjs');
const source=require('../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');
const EXPECTED=[
 {denominator:250397245379590400n,
  mechanical:109541773114908463n,dragons:50778042472737262n,
  dragonsEnergy:69899599913538126n,dragonsEnergyCompressor:80845853351768176n},
 {denominator:11518273287461158400n,
  mechanical:5462172580802571978n,dragons:2799567752348437034n,
  dragonsEnergy:3873292251854427240n,dragonsEnergyCompressor:4410172371756153560n},
 {denominator:518322297935752128000n,
  mechanical:262405039590825224370n,dragons:147892155782215579218n,
  dragonsEnergy:202807611409907191458n,dragonsEnergyCompressor:226639785446465152080n}
];
const TWO_WITHOUT={
 mechanical:237856759815088693650n,dragons:145950467657885626770n,
 dragonsEnergy:193893921157200328770n,
 dragonsEnergyCompressor:213067285862487435600n
};
test('fixed printed 60 identity and identical Agent5 thirteen-category input',()=>{
 assert.equal(source.canonicalCardsSha256,
 'bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b');
 assert.equal(source.cards.reduce((s,c)=>s+c.count,0),60);
 assert.deepEqual(COUNTS,original.COUNTS);
});
test('first-turn no-bonus source exactly reproduces original Agent5 Wonder Tag arithmetic',()=>{
 const x=count(0),base=original.countWonderTagBridge();
 assert.equal(x.denominator,base.denominator);
 assert.deepEqual(x.numerators,base.numerators);
 assert.deepEqual(x.extraBy,base.extraBy);
});
test('zero to two accepted bonus draws preserve old no-WonderTag and new paid Lele counts',()=>{
 for(let b=0;b<=2;b++){
  const x=count(b),v=EXPECTED[b],without=b===2?TWO_WITHOUT:EVENTS[b===0?'noBonus':'oneBonus'];
  assert.equal(x.denominator,v.denominator,'denominator '+b);
  assert.equal(x.denominator,without.denominator??x.denominator);
  for(const p of PROFILES){
   assert.equal(x.numerators[p].without,without[p],'without '+p+' b'+b);
   assert.equal(x.numerators[p].with,v[p],'with '+p+' b'+b);
   assert.ok(x.numerators[p].with>=x.numerators[p].without);
   assert.equal(Object.values(x.extraBy[p]).reduce((s,n)=>s+n,0n),
    x.numerators[p].with-x.numerators[p].without,'route partition '+p+' b'+b);
  }
 }
});
