'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {fixedCandidateFamilywiseThreshold:threshold}=
  require('../simulation/evaluation/agent10-fixed-candidate-familywise-zero-loss.cjs');
test('one fixed deck needs exactly 10 clean wins in each of 64 cells',()=>{
  const r=threshold({candidateCount:1,cellCount:64});
  assert.equal(r.perCell,10);
  assert.equal(r.totalPerCandidate,640);
  assert.ok(r.familywiseNullBound<=0.05);
  assert.ok(Math.pow(0.995,64*9)>0.05);
  assert.equal(r.competitiveGamesQualified,0);
});
test('four preregistered selectable decks need 14 per seat/opponent cell',()=>{
  const r=threshold({candidateCount:4,cellCount:64});
  assert.equal(r.perCell,14);
  assert.equal(r.totalPerCandidate,896);
  assert.equal(r.totalAcrossFamily,3584);
  assert.ok(r.familywiseNullBound<=0.05);
  assert.ok(4*Math.pow(0.995,64*13)>0.05);
});
test('eight selectable decks need 16 per seat/opponent cell',()=>{
  const r=threshold({candidateCount:8,cellCount:64});
  assert.equal(r.perCell,16);
  assert.equal(r.totalPerCandidate,1024);
  assert.ok(r.familywiseNullBound<=0.05);
});
test('sixteen selectable decks need 18 per seat/opponent cell',()=>{
  const r=threshold({candidateCount:16,cellCount:64});
  assert.equal(r.perCell,18);
  assert.equal(r.totalPerCandidate,1152);
  assert.ok(r.familywiseNullBound<=0.05);
});
test('32 ranks without split seat need 19 games per rank if just one fixed 60',()=>{
  const r=threshold({candidateCount:1,cellCount:32});
  assert.equal(r.perCell,19);
  assert.equal(r.totalPerCandidate,608);
});
test('validity holds for an unequal independent candidate family without assuming independence across candidates',()=>{
  const r=threshold({candidateCount:50,cellCount:64});
  assert.equal(r.perCell,22);
  assert.equal(r.totalPerCandidate,1408);
  assert.ok(r.lowerBoundForSelectedAllWin>0.995);
});
test('invalid input sizes and probabilities fail explicitly',()=>{
  assert.throws(()=>threshold({candidateCount:0,cellCount:64}),RangeError);
  assert.throws(()=>threshold({candidateCount:2.5,cellCount:64}),RangeError);
  assert.throws(()=>threshold({candidateCount:2,cellCount:NaN}),RangeError);
  assert.throws(()=>threshold({candidateCount:2,cellCount:64,target:1}),RangeError);
  assert.throws(()=>threshold({candidateCount:2,cellCount:64,alpha:0}),RangeError);
});
