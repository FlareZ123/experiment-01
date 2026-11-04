'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  basicPositionMask,choose,mulliganDisagreement,frozenRankOneNewMoonCase
}=require('../simulation/evaluation/agent3-coupled-opening-input-order.cjs');

const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,`${a} differs from ${b}`);

test('original printed-stage exclusions are independently present in provided card pool',()=>{
  const vm=require('../resources/cards/en/swsh6.json')
    .find(card=>card.id==='swsh6-75');
  const dusclops=require('../resources/cards/en/sv6pt5.json')
    .find(card=>card.id==='sv6pt5-19');
  const v=require('../resources/cards/en/swsh6.json')
    .find(card=>card.id==='swsh6-74');
  assert.equal(vm.name,'Shadow Rider Calyrex VMAX');
  assert.equal(dusclops.name,'Dusclops');
  assert.equal(vm.subtypes.includes('Basic'),false);
  assert.equal(dusclops.subtypes.includes('Stage 1'),true);
  assert.equal(v.subtypes.includes('Basic'),true);
});

test('exact fixed source row order gives 14/17 Basics and 12 shared indices',()=>{
  const caseStudy=frozenRankOneNewMoonCase();
  assert.equal(caseStudy.actual.referenceBasics,14);
  assert.equal(caseStudy.actual.challengerBasics,17);
  assert.equal(caseStudy.actual.sharedBasics,12);
  assert.deepEqual(caseStudy.historicalReferenceBasicPositions,
    [0,1,2,7,8,9,10,11,12,13,14,15,16,17]);
  assert.deepEqual(caseStudy.historicalChallengerBasicPositions,
    [0,1,2,3,4,5,6,7,8,9,10,11,14,15,16,17,18]);
  close(caseStudy.actual.disagreement,0.10560378876691283);
});

test('same printed 60 may have maximum Basic overlap or zero overlap via order',()=>{
  const {actual,reorderingRange:r}=frozenRankOneNewMoonCase();
  assert.equal(r.maximalBasicOverlap.sharedBasics,14);
  assert.equal(r.minimalBasicOverlap.sharedBasics,0);
  assert.equal(r.maximalBasicOverlap.challengerBasics,17);
  assert.equal(r.minimalBasicOverlap.challengerBasics,17);
  close(r.maximalBasicOverlap.disagreement,0.05515324790140996);
  close(r.minimalBasicOverlap.disagreement,0.21394550361759443);
  assert.ok(r.maximalBasicOverlap.disagreement<actual.disagreement);
  assert.ok(actual.disagreement<r.minimalBasicOverlap.disagreement);
  assert.equal(actual.competitiveQualified,false);
  assert.equal(r.maximalBasicOverlap.certifiesActualXorshiftMarginals,false);
});

test('all achievable Basic-position overlaps obey the hypergeometric formula',()=>{
  const first=Array.from({length:60},(_,i)=>i<14);
  let previous=0.22;
  for(let overlap=0;overlap<=14;overlap++){
    const chosen=Array.from({length:60},(_,i)=>
      i<overlap || (i>=14 && i<14+17-overlap));
    const x=mulliganDisagreement(first,chosen);
    assert.equal(x.sharedBasics,overlap);
    assert.equal(x.unionBasics,31-overlap);
    close(x.jointMulligan,choose(60-(31-overlap),7)/choose(60,7));
    assert.ok(x.disagreement<=previous);
    previous=x.disagreement;
    const mirrored=mulliganDisagreement(chosen,first);
    close(mirrored.disagreement,x.disagreement);
  }
});

test('a Basic-mask calculation rejects malformed or incomplete roster',()=>{
  assert.throws(()=>mulliganDisagreement(Array(59).fill(false),
    Array(60).fill(false)),TypeError);
  assert.throws(()=>mulliganDisagreement(Array(60).fill(0),
    Array(60).fill(false)),TypeError);
  assert.throws(()=>mulliganDisagreement(Array(60).fill(true),
    Array(60).fill(false),0),TypeError);
  assert.throws(()=>basicPositionMask([{count:59,category:'Pokémon',name:'A'}],{
    categoryKey:'category',nameKey:'name',evolvedNames:[],expectedBasics:59
  }),assert.AssertionError);
  assert.throws(()=>basicPositionMask([
    {count:60,category:'Trainer',name:'A'}
  ],{categoryKey:'category',nameKey:'name',
    evolvedNames:['Missing'],expectedBasics:0
  }),assert.AssertionError);
});
