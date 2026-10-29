'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {rank11Counts,combination,exactRank11VipWindow}=
  require('../scripts/agent3-rank11-vip-k1-combinatorics.cjs');
const categories={vip:4,trubbish:2,garbodor:2,otherBasic:9,other:43};

test('combination calculation uses exact integer arithmetic',()=>{
  assert.equal(combination(60,7),386206920n);
  assert.equal(combination(3,1),3n);
  assert.equal(combination(3,4),0n);
  assert.equal(combination(3,-1),0n);
});

test('rank11 source 60 separates Basic and Evolution counts',()=>{
  const entries=[
    ['Battle VIP Pass',4],['Trubbish',2],['Garbodor',2],
    ['Mega Absol ex',3],['Oranguru V',2],['Latias ex',1],
    ['Tapu Lele-GX',1],['Crobat V',1],['Squawkabilly ex',1],
    ['Everything else',43]
  ].map(([name,count])=>({name,count}));
  assert.deepEqual(rank11Counts({decks:[{rank:11,cards:entries}]}),categories);
});

test('exact setup DP matches independently computed 7-6-1 multivariate sum',()=>{
  const v=exactRank11VipWindow(categories);
  assert.equal(v.denominatorUnconditional,416717869162795200n);
  assert.equal(v.denominatorValidOpening,324031005021884160n);
  assert.equal(v.numeratorVipSeen,137946981902489760n);
  assert.equal(v.numeratorVipWithTrubbishDeck,130010305295826480n);
  assert.equal(v.numeratorVipTrubbishAndGarbodorAccessible,128839931052296972n);
  assert.ok(Math.abs(v.probabilityAllGivenValid-0.39761605851142384)<1e-12);
});
