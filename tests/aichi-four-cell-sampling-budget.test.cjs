'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {balancedChance,smallestFixedQueue}=
  require('../scripts/aichi-four-cell-sampling-budget.cjs');

const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-11,
  `Expected ${a} within 1e-11 of ${b}`);

test('exact two-category fair-start checks agree with combinatorial enumeration',()=>{
  close(balancedChance(0,1,1),0);
  close(balancedChance(1,1,1),0);
  close(balancedChance(2,1,1),0.5);
  close(balancedChance(3,1,1),0.75);
  close(balancedChance(4,2,1),6/16);
});

test('unaligned source deals and unequal start allocation preserve total probability',()=>{
  close(balancedChance(2,1,.8),.32);
  close(balancedChance(2,1,1,.1),.18);
  close(balancedChance(3,1,.8,.1),
    1-(1-.8*.1)**3-(1-.8*.9)**3+(1-.8)**3);
  assert.ok(balancedChance(200,1,.8,.1)>0.999999);
});

test('published planning sensitivity rows match independent factorial enumeration',()=>{
  const rows=[
    {groups:4,k:1,q:1,p:.5,expected:8},
    {groups:4,k:1,q:.8,p:.5,expected:10},
    {groups:4,k:2,q:1,p:.5,expected:11},
    {groups:4,k:2,q:.8,p:.5,expected:15},
    {groups:64,k:1,q:1,p:.5,expected:12},
    {groups:64,k:1,q:.8,p:.5,expected:16},
    {groups:64,k:2,q:1,p:.5,expected:16},
    {groups:64,k:2,q:.8,p:.5,expected:21},
    {groups:4,k:1,q:1,p:.1,expected:42},
    {groups:64,k:1,q:1,p:.1,expected:68}
  ];
  for(const row of rows){
    const {expected,...inputs}=row;
    const result=smallestFixedQueue({...inputs,confidence:.95});
    assert.equal(result.pairsPerGroup,expected);
    assert.ok(result.modelProbability>=.95);
    assert.ok(balancedChance(expected-1,row.k,row.q,row.p)**row.groups<.95);
    assert.equal(result.setupArms,2*result.totalPairs);
    assert.equal(result.conditionalIndependenceOnly,true);
  }
});

test('impossible or invalid probability assumptions fail closed',()=>{
  assert.equal(balancedChance(20,1,1,0),0);
  assert.throws(()=>smallestFixedQueue({groups:4,k:1,q:1,p:0,confidence:.95}),
    /impossible/);
  assert.throws(()=>smallestFixedQueue({groups:4,k:1,q:1,p:1,confidence:.95}),
    /impossible/);
  assert.throws(()=>balancedChance(4,1,0),/AssertionError/);
  assert.throws(()=>balancedChance(4,1,1,2),/AssertionError/);
  assert.throws(()=>smallestFixedQueue({groups:0,k:1,q:1,confidence:.95}));
});

test('chance is monotone in fixed queue length for nondegenerate models',()=>{
  const seq=Array.from({length:50},(_,i)=>balancedChance(i,2,.65,.28));
  for(let i=1;i<seq.length;i++)assert.ok(seq[i]>=seq[i-1]-1e-12);
  assert.ok(seq.at(-1)<1);
});
