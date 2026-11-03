'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  allWinLowerBound,zeroLossRequirements,conservativeUnbalancedAllWinBound
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
