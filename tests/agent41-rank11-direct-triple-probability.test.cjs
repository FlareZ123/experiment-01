'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {rank11Inventory,directPredicateGroups,choose,
  directTripleProbability,report}=require(
  '../simulation/evaluation/agent41-rank11-direct-triple-probability.cjs');

test('exact source rank11 roster has the disjoint printed direct-line groups',()=>{
  const inv=rank11Inventory();
  assert.equal([...inv.values()].reduce((n,k)=>n+k,0),60);
  assert.deepEqual(directPredicateGroups(inv),
    {boost:2,tool:6,bench:6,protected:2,other:44});
  assert.equal(inv.get('Float Stone'),3);
  assert.equal(inv.get('Forest Seal Stone'),2);
  assert.equal(inv.get('Muscle Band'),1);
  assert.equal(inv.get('Battle VIP Pass'),4);
  assert.equal(inv.get('Trubbish'),2);
  assert.equal(inv.get('Boost Shake'),2);
});

test('binomial integer arithmetic and disjoint-group enumeration',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(60,8),2558620845n);
  assert.equal(choose(5,0),1n);
  assert.equal(choose(5,5),1n);
  assert.equal(choose(4,6),0n);
  assert.equal(choose(4,-1),0n);
  const seven=directTripleProbability(7);
  const eight=directTripleProbability(8);
  assert.equal(seven.favorableSubsets,'18918578');
  assert.equal(seven.totalSubsets,'386206920');
  assert.ok(Math.abs(seven.probability-0.04898560077587424)<1e-14);
  assert.equal(eight.favorableSubsets,'181005384');
  assert.equal(eight.totalSubsets,'2558620845');
  assert.ok(Math.abs(eight.probability-0.07074333985581205)<1e-14);
  assert.equal(directTripleProbability(1).probability,0);
});

test('independent inclusion-exclusion validates the three-card-group requirement',()=>{
  // Count first 8 containing >=1 Boost, >=1 Tool, >=1 Bench enabler,
  // then subtract 8-cards additionally containing BOTH Garbodor cards.
  const combo=(n,k)=>choose(n,k);
  const unrestricted=(n,base)=>{
    let count=0n;
    for(let mask=0;mask<8;mask++){
      const removed=(mask&1?2:0)+(mask&2?6:0)+(mask&4?6:0);
      let bits=0;
      for(let j=0;j<3;j++)bits+=!!(mask&(1<<j));
      count+=(bits%2?-1n:1n)*combo(base-removed,n);
    }
    return count;
  };
  const n=8;
  const total=unrestricted(n,60);
  const havingBothGarbodor=unrestricted(n-2,58);
  const direct=directTripleProbability(n);
  assert.equal(BigInt(direct.favorableSubsets),
    total-havingBothGarbodor);
  assert.ok(BigInt(direct.favorableSubsets)<=combo(60,8));
});

test('fails closed when printing or disjoint card counts change',()=>{
  const inv=rank11Inventory();
  inv.set('Boost Shake',3);
  assert.throws(()=>directPredicateGroups(inv),/The frozen original rank11 inventory changed/);
  assert.equal(report().schema,'agent41-rank11-first-hand-direct-boostshake-combinatoric-v1');
});
