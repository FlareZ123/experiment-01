'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {mixedTargetPrizeCollapse}=require(
  '../simulation/evaluation/agent14-mobility-prize-collapse.cjs');

test('mixed Basic-plus-Trainer target changes legal-start condition',()=>{
  const x=mixedTargetPrizeCollapse(15,1,1);
  assert.ok(Math.abs(x.conditionalOnValidSeven-
    0.008379045772359819)<1e-12);
  assert.ok(x.conditionalOnValidSeven<x.unconditionalOnOpening);
  const y=mixedTargetPrizeCollapse(12,0,3);
  assert.ok(Math.abs(y.conditionalOnValidSeven-
    0.00059817753855913126)<1e-12);
  assert.ok(y.conditionalOnValidSeven>y.unconditionalOnOpening);
  assert.equal(x.competitiveGameQualified,false);
});

test('mixed targets with an impossible Prize cardinality give zero',()=>{
  const x=mixedTargetPrizeCollapse(3,1,2,
    {deckSize:10,handSize:3,prizeSize:2});
  assert.equal(x.exactNumerator,'0');
});
