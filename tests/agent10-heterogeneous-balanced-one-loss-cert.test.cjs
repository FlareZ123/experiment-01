'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {atMostOneLossUpperTail,oneLossBalancedCertificate:certificate}=
  require('../simulation/evaluation/agent10-heterogeneous-balanced-one-loss-cert.cjs');

test('exact one-loss binomial probability matches hand formula',()=>{
  const v=atMostOneLossUpperTail(960,0.995);
  assert.ok(Math.abs(v-0.04735740267923392)<1e-12);
});
test('one frozen sixty permits at most one loss in 15 per 64 cells',()=>{
  const x=certificate({cellCount:64});
  assert.equal(x.perCell,15);
  assert.equal(x.totalPerCandidate,960);
  assert.ok(x.familywiseNullUpperBound<=0.05);
  assert.ok(x.precedingBalancedPanelNullBound>0.05);
  assert.equal(x.independentlyQualifiedActualPaperGames,0);
  assert.equal(x.certifiedCompetitiveDeck,false);
});
test('four prospectively fixed selectable candidates need 20 per cell',()=>{
  const x=certificate({cellCount:64,candidateCount:4});
  assert.equal(x.perCell,20);
  assert.equal(x.totalPerCandidate,1280);
  assert.ok(x.familywiseNullUpperBound<=0.05);
  assert.ok(x.precedingBalancedPanelNullBound>0.05);
});
test('one percent familywise alpha requires 21 per cell for one candidate',()=>{
  const x=certificate({cellCount:64,alpha:0.01});
  assert.equal(x.perCell,21);
  assert.equal(x.totalPerCandidate,1344);
  assert.ok(x.familywiseNullUpperBound<=0.01);
});
test('known false small-sample shortcut is rejected by theorem precondition',()=>{
  assert.throws(()=>atMostOneLossUpperTail(2,0.5),
    /One-loss heterogeneous comparison/);
  // Two independent failures with probabilities 0 and 1 have P(L<=1)=1,
  // larger than the homogeneous Bin(2,.5) lower tail .75.
  const heterogeneous=1;
  const homogeneous=0.5**2+2*0.5*0.5;
  assert.ok(heterogeneous>homogeneous);
});
test('strict invalid domains do not produce a certificate',()=>{
  for(const input of [
    {cellCount:0},{cellCount:64,candidateCount:0},
    {cellCount:64,alpha:1},{cellCount:64,target:1},
    {cellCount:64,target:0},{cellCount:-5}
  ])assert.throws(()=>certificate(input),RangeError);
});
