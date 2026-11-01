'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerPeoniaSlots,recordAcceptedPeoniaPositions,
  paperValidPeoniaPrizeSelection}=
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

test('paper-specific Peonia accepts 1/2/3 from physical owner Prize slots',()=>{
  const slots=Array.from({length:6},()=>({cards:[{}]}));
  const sourceCard={fullName:'Peonia CRE'};
  const owner={id:41,supporter:{cards:[sourceCard]},prizes:slots};
  const prompt={playerId:41,result:undefined,options:{count:3}};
  Object.defineProperty(prompt,'constructor',{value:{name:'ChoosePrizePrompt'}});
  for(const n of [1,2,3])
    assert.equal(paperValidPeoniaPrizeSelection({
      owner,prompt,sourceCard,selectedSlots:slots.slice(0,n),
      safeReplacementCount:n}),true);
  assert.equal(paperValidPeoniaPrizeSelection({
    owner,prompt,sourceCard,selectedSlots:[],
    safeReplacementCount:3}),false);
  assert.equal(paperValidPeoniaPrizeSelection({
    owner,prompt,sourceCard,selectedSlots:slots.slice(0,4),
    safeReplacementCount:4}),false);
});

test('Peonia preflight rejects foreign slots, duplicate or expired state',()=>{
  const slots=Array.from({length:6},()=>({cards:[{}]}));
  const sourceCard={fullName:'Peonia CRE'};
  const owner={id:41,supporter:{cards:[sourceCard]},prizes:slots};
  const prompt={playerId:41,result:undefined,options:{count:3}};
  Object.defineProperty(prompt,'constructor',{value:{name:'ChoosePrizePrompt'}});
  const testSelect=selectedSlots=>paperValidPeoniaPrizeSelection({
    owner,prompt,sourceCard,selectedSlots,safeReplacementCount:3});
  assert.equal(testSelect([slots[0],slots[0]]),false);
  assert.equal(testSelect([{cards:[{}]}]),false);
  assert.equal(testSelect([slots[0]]),true);
  owner.supporter.cards=[];
  assert.equal(testSelect([slots[0]]),false);
  owner.supporter.cards=[sourceCard];prompt.result=true;
  assert.equal(testSelect([slots[0]]),false);
  prompt.result=undefined;prompt.playerId=42;
  assert.equal(testSelect([slots[0]]),false);
});

test('Peonia preflight requires safe hand payments and occupied slots',()=>{
  const slot={cards:[{}]};
  const sourceCard={fullName:'Peonia CRE'};
  const owner={id:12,supporter:{cards:[sourceCard]},prizes:[slot]};
  const prompt={playerId:12,result:undefined,options:{count:1}};
  Object.defineProperty(prompt,'constructor',{value:{name:'ChoosePrizePrompt'}});
  const proof={owner,prompt,sourceCard,selectedSlots:[slot],
    safeReplacementCount:0};
  assert.equal(paperValidPeoniaPrizeSelection(proof),false);
  proof.safeReplacementCount=1;
  assert.equal(paperValidPeoniaPrizeSelection(proof),true);
  slot.cards.length=0;
  assert.equal(paperValidPeoniaPrizeSelection(proof),false);
});
