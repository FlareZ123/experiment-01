'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {selectBoundedDoubleHandPrizeExchanges}=
  require('../simulation/twinleaf/agent23-bounded-double-prize-exchanges.cjs');

const energy=(id,name)=>({id,fullName:name,energyType:'BASIC'});
const trainer=(id,name)=>({id,fullName:name,trainerType:'ITEM'});

test('two face-down Prize slots are required; invalid slots remain untouched',()=>{
  const hand=[energy(1,'E1'),energy(2,'E2')];
  const prizes=[
    {cards:[]},{cards:[trainer(3,'T1')]},
    {cards:[trainer(4,'T2')]},
    {cards:[trainer(5,'Merged1'),trainer(6,'Merged2')]}
  ];
  const before=structuredClone({hand,prizes});
  const result=selectBoundedDoubleHandPrizeExchanges(hand,prizes,16);
  assert.equal(result.available,2);
  assert.equal(result.exchanges.length,2);
  assert.equal(result.eligibleDistinctHandCompositions,1);
  assert.equal(result.testedDistinctHandCompositions,1);
  assert.equal(result.exhaustive,true);
  for(const path of result.exchanges){
    assert.equal(path.swaps.length,2);
    assert.deepEqual(new Set(path.swaps.map(s=>s.prizeIndex)),
      new Set([1,2]));
    assert.equal(new Set(path.swaps.map(s=>s.handIndex)).size,2);
    assert.ok(path.swaps.every(s=>s.deckIndex===undefined));
  }
  assert.deepEqual({hand,prizes},before);
});

test('net-hand key handles two-card cancellation and omitted empty Prizes',()=>{
  const hand=[energy(1,'A'),energy(2,'B'),energy(3,'C')];
  const prizes=[
    {cards:[trainer(4,'B')]},
    {cards:[trainer(5,'C')]},
    {cards:[]},
    {cards:[trainer(6,'D')]}
  ];
  const result=selectBoundedDoubleHandPrizeExchanges(hand,prizes,64);
  assert.equal(result.available,11);
  assert.equal(result.eligibleDistinctHandCompositions,8);
  assert.equal(result.testedDistinctHandCompositions,8);
  assert.equal(result.exchanges.length,11);
  assert.equal(result.exhaustive,true);
  assert.equal(result.completeRevealedHistoryVerified,false);
  assert.equal(result.sourceZone,'opponent-face-down-prizes');
});

test('invalid budget and too few eligible Prize cards remain fail-closed',()=>{
  const hand=[energy(1,'A'),energy(2,'B')];
  const prizes=[{cards:[trainer(3,'C')]}];
  const out=selectBoundedDoubleHandPrizeExchanges(hand,prizes);
  assert.equal(out.available,0);
  assert.equal(out.exchanges.length,0);
  assert.equal(out.eligibleDistinctHandCompositions,0);
  assert.equal(out.exhaustive,true);
  assert.throws(()=>selectBoundedDoubleHandPrizeExchanges(hand,prizes,0));
  assert.throws(()=>selectBoundedDoubleHandPrizeExchanges(hand,prizes,65));
});
