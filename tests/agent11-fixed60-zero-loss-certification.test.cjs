'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  allWinLowerBound,zeroLossRequirements,conservativeUnbalancedAllWinBound,
  binaryKL,heterogeneousFieldLowerBound,balancedGamesForLossBudget
}=require('../scripts/agent11-fixed60-zero-loss-certification.cjs');

test('one-sided 95 percent zero-loss whole-field average boundary',()=>{
  const target=0.995, alpha=0.05;
  const r=zeroLossRequirements(target,alpha,1);
  assert.equal(r.minimumPooled,598);
  assert.ok(target**597>alpha);
  assert.ok(target**598<=alpha);
  assert.ok(r.lowerBound>=target);
  assert.ok(allWinLowerBound(1,597,alpha)<target);
});

test('32 original sources times both physical seats and both start orders',()=>{
  const r=zeroLossRequirements(0.995,0.05,128);
  assert.equal(r.minimumPooled,598);
  assert.equal(r.balancedPerStratum,5);
  assert.equal(r.balancedTotal,640);
  assert.ok(Math.abs(r.lowerBound-0.9953301063421702)<1e-15);
  assert.ok(allWinLowerBound(128,4)<0.995);
  assert.equal(r.worstPerStratum,1566);
  assert.equal(r.worstTotal,200448);
});

test('rank-only and rank-plus-seat alternative registered designs',()=>{
  const ranks=zeroLossRequirements(0.995,0.05,32);
  const seats=zeroLossRequirements(0.995,0.05,64);
  assert.deepEqual([ranks.balancedPerStratum,ranks.balancedTotal,
    ranks.worstPerStratum,ranks.worstTotal],[19,608,1290,41280]);
  assert.deepEqual([seats.balancedPerStratum,seats.balancedTotal,
    seats.worstPerStratum,seats.worstTotal],[10,640,1428,91392]);
});

test('equal-weight AM-GM all-win probability bound includes heterogeneous matchups',()=>{
  const rates=[0.99,1,0.98,1];
  const mean=rates.reduce((a,b)=>a+b,0)/rates.length;
  const probability=rates.reduce((a,p)=>a*p**5,1);
  assert.ok(probability<=mean**20+1e-14);
});

test('unbalanced registered source cells cannot count easy-only extra games',()=>{
  const design=conservativeUnbalancedAllWinBound([5,5,500,5]);
  assert.deepEqual({
    eligibleMinimum:design.eligibleMinimum,
    retainedGames:design.retainedGames
  },{eligibleMinimum:5,retainedGames:20});
  assert.ok(Math.abs(design.allWinMeanLower-0.05**(1/20))<1e-15);
  assert.throws(()=>conservativeUnbalancedAllWinBound([640,0]),RangeError);
  assert.throws(()=>conservativeUnbalancedAllWinBound([]),RangeError);
  assert.throws(()=>zeroLossRequirements(0.995,0.05,0),RangeError);
});

test('nonidentical-stratum KL bound is exact for all wins and valid with losses',()=>{
  const r0=heterogeneousFieldLowerBound(640,640);
  assert.ok(Math.abs(r0-allWinLowerBound(128,5))<1e-14);
  assert.equal(heterogeneousFieldLowerBound(0,640),0);
  assert.ok(binaryKL(1,0.995)>0);
  assert.ok(binaryKL(0.999,0.995)>0);
  assert.throws(()=>heterogeneousFieldLowerBound(641,640),RangeError);
});

test('precommitted balanced designs tolerate one, two and three observed losses',()=>{
  const expected=[[0,5,640],[1,9,1152],[2,12,1536],[3,15,1920]];
  for(const [losses,n,trials] of expected) {
    const got=balancedGamesForLossBudget(losses);
    assert.equal(got.perStratum,n);
    assert.equal(got.totalTrials,trials);
    assert.ok(got.lowerBound>=0.995);
    const priorTrials=(n-1)*128;
    if(priorTrials>losses)
      assert.ok(heterogeneousFieldLowerBound(priorTrials-losses,priorTrials)<0.995);
  }
});

test('stratum-heterogeneous Bernoulli concentration uses real sample counts',()=>{
  const n=1152, wins=1151, q=wins/n, threshold=Math.log(20)/n;
  const l=heterogeneousFieldLowerBound(wins,n);
  assert.ok(l>0.995);
  assert.ok(Math.abs(binaryKL(q,l)-threshold)<1e-11);
  assert.throws(()=>balancedGamesForLossBudget(-1),RangeError);
});
