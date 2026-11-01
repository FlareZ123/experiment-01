'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerPeoniaSlots,recordAcceptedPeoniaPositions}=
  require('../simulation/twinleaf/agent39-peonia-owner-visited-slots.cjs');

test('two accepted three-slot visits cover all six unchanged Prizes',()=>{
  let visited=[];
  const first=chooseOwnerPeoniaSlots({occupiedIndices:[0,1,2,3,4,5],
    visitedIndices:visited,safeReplacementCount:4});
  assert.deepEqual(first,{indices:[0,1,2],unvisitedSelected:3});
  visited=recordAcceptedPeoniaPositions(visited,first.indices);
  const second=chooseOwnerPeoniaSlots({occupiedIndices:[0,1,2,3,4,5],
    visitedIndices:visited,safeReplacementCount:4});
  assert.deepEqual(second,{indices:[3,4,5],unvisitedSelected:3});
  visited=recordAcceptedPeoniaPositions(visited,second.indices);
  assert.deepEqual(visited,[0,1,2,3,4,5]);
  const third=chooseOwnerPeoniaSlots({occupiedIndices:[0,1,2,3,4,5],
    visitedIndices:visited,safeReplacementCount:4});
  assert.deepEqual(third,{indices:[0,1,2],unvisitedSelected:0});
});

test('owner-hand replacement capacity enforces printed up-to-three',()=>{
  const base={occupiedIndices:[0,1,2,3,4,5],
    visitedIndices:[0,1,2]};
  assert.equal(chooseOwnerPeoniaSlots({...base,safeReplacementCount:0}),null);
  assert.deepEqual(chooseOwnerPeoniaSlots({...base,safeReplacementCount:1}),
    {indices:[3],unvisitedSelected:1});
  assert.deepEqual(chooseOwnerPeoniaSlots({...base,safeReplacementCount:2}),
    {indices:[3,4],unvisitedSelected:2});
  assert.deepEqual(chooseOwnerPeoniaSlots({...base,safeReplacementCount:9}),
    {indices:[3,4,5],unvisitedSelected:3});
});

test('past prizes taken leave gaps without leaking card identity',()=>{
  const plan=chooseOwnerPeoniaSlots({
    occupiedIndices:[0,2,4],visitedIndices:[0,4],
    safeReplacementCount:4});
  assert.deepEqual(plan,{indices:[2,0,4],unvisitedSelected:1});
  assert.deepEqual(recordAcceptedPeoniaPositions([0,4],plan.indices),
    [0,2,4]);
});

test('owner ledger proposals do not mutate accepted history',()=>{
  const visited=[0,1,2],occupied=[0,1,2,3,4,5];
  const frame={occupiedIndices:occupied,visitedIndices:visited,
    safeReplacementCount:3};
  const a=chooseOwnerPeoniaSlots(frame),b=chooseOwnerPeoniaSlots(frame);
  assert.deepEqual(a,b);
  assert.deepEqual(visited,[0,1,2]);
  assert.deepEqual(occupied,[0,1,2,3,4,5]);
});

test('reject duplicate and impossible indices before using stale history',()=>{
  const base={occupiedIndices:[0,1,2],
    visitedIndices:[],safeReplacementCount:3};
  assert.throws(()=>chooseOwnerPeoniaSlots({
    ...base,occupiedIndices:[0,0,2]}),/unique indices/);
  assert.throws(()=>chooseOwnerPeoniaSlots({
    ...base,visitedIndices:[6]}),/unique indices/);
  assert.throws(()=>chooseOwnerPeoniaSlots({
    ...base,safeReplacementCount:-1}),/safe owner hand/);
});
