'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {choose,prizeSafeWays,evaluate,FIXED_RANK11_COUNTS,
  rank11Categories}=require('../scripts/agent10-rank11-crobat-darkpatch-route.cjs');

test('independent small combinatorics invariants',()=>{
  assert.equal(choose(10,3),120n);
  assert.equal(choose(6,7),0n);
  const remaining=Array(12).fill(0);
  remaining[0]=2;remaining[1]=1;remaining[2]=49;
  assert.equal(prizeSafeWays(remaining,[0,1]),
    choose(52,6)-choose(50,4)-choose(51,5)+choose(49,3));
  assert.ok(prizeSafeWays(remaining,[0,1])>0n);
  // Hand-held copies are not deck-searchable even if the name exists in H8.
  remaining[1]=0;remaining[2]=50;
  assert.equal(prizeSafeWays(remaining,[0,1]),0n);
});

test('independently reproduces two Agent21 source numerators before refinement',()=>{
  const result=evaluate(FIXED_RANK11_COUNTS);
  assert.equal(result.denominator,324031005021884160n);
  assert.equal(result.counts.quickBoost,6841036302154704n);
  assert.equal(result.counts.patchOverlap,887394561799680n);
  assert.equal(result.counts.oneQuickNamedConflict,697245824110176n);
});

test('Crobat partition and initial-versus-eighth availability',()=>{
  const {counts}=evaluate();
  assert.equal(counts.crobatBenchable,27300845233728n);
  assert.equal(counts.crobatInitiallyHeld,21726792172800n);
  assert.equal(counts.crobatDrawnEighth,5574053060928n);
  assert.equal(counts.crobatForcedActive,70383891644352n);
  assert.equal(counts.crobatAbsent,599561087232096n);
  assert.equal(counts.crobatBenchable+
    counts.crobatForcedActive+counts.crobatAbsent,
    counts.oneQuickNamedConflict);
});

test('source printing buckets are exact and reject new unclassified Pokémon',()=>{
  const cards=[
    ['Trubbish',2],['Garbodor',2],['Boost Shake',2],
    ['Float Stone',3],['Forest Seal Stone',2],['Muscle Band',1],
    ['Quick Ball',4],['Battle VIP Pass',4],['Dark Patch',3],
    ['Darkness Energy',8],['Mega Absol ex',3],['Crobat V',1],
    ['Oranguru V',2],['Latias ex',1],['Tapu Lele-GX',1],
    ['Squawkabilly ex',1],['other Trainer',20]
  ].map(([name,count])=>({name,count,
    category:['Trubbish','Garbodor','Mega Absol ex','Crobat V',
      'Oranguru V','Latias ex','Tapu Lele-GX','Squawkabilly ex'].includes(name)?
      'Pokémon':'Trainer'}));
  assert.deepEqual(rank11Categories({rank:11,cards}),FIXED_RANK11_COUNTS);
  const broken=cards.map(item=>({...item}));
  broken[broken.length-1].category='Pokémon';
  assert.throws(()=>rank11Categories({rank:11,cards:broken}),
    /Unexpected original Basic or Evolution/);
});
