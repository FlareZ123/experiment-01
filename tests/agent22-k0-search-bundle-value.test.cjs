'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {expectedK0UnrestrictedSearchValue}=
  require('../simulation/twinleaf/agent22-k0-search-bundle-value.cjs');

function k0(pool,prizes,weights,{hand=[],known=[],max=1,cost=0}={}){
  return expectedK0UnrestrictedSearchValue({
    inventory:{pool,observedDeckPrintings:known,
      deckCount:pool.length-prizes,prizeCount:prizes},
    ownHand:hand,weights,perCardCost:cost,maxCards:max,
    uniformUnknownAllocation:true
  });
}
function close(actual,expected){
  assert.ok(Math.abs(actual-expected)<1e-10,
    'Expected '+expected+'; got '+actual);
}

test('exact three-way Prize allocation of one top-valued resource',()=>{
  const r=k0(['A','B','C'],1,{A:10,B:6});
  close(r.expectedValue,26/3);
  close(r.probabilityPositiveValue,1);
  close(r.expectedCardsChosen,1);
  assert.equal(r.exactDenominator,'3');
  assert.equal(r.exactPrizeAllocationsEnumerated,3);
});

test('three-way prize assignments with a 2-card unrestricted search',()=>{
  const r=k0(['A','B','C'],1,{A:10,B:6},{max:2});
  close(r.expectedValue,32/3);
  close(r.expectedCardsChosen,4/3);
});

test('pre-held valuable copies reduce K0 search expectation',()=>{
  const first=k0(['A','B','C'],1,{A:10,B:6});
  const held=k0(['A','B','C'],1,{A:10,B:6},{hand:['A']});
  close(first.expectedValue,26/3);
  close(held.expectedValue,17/3);
  assert.ok(held.expectedValue<first.expectedValue);
});

test('multiple target copies protect best-card access across Prize states',()=>{
  const r=k0(['A','A','B'],1,{A:10,B:6});
  close(r.expectedValue,10);
  assert.equal(r.exactPrizeAllocationsEnumerated,2);
});

test('a known owner-deck printing is deterministic regardless of unknown Prizes',()=>{
  const r=k0(['B','C'],1,{A:10,B:6},
    {known:['A']});
  close(r.expectedValue,10);
  assert.equal(r.exactDenominator,'2');
});

test('positive search costs can make optional empty search optimal',()=>{
  const r=k0(['A','B','C'],1,{A:2,B:1},
    {cost:3,max:2});
  close(r.expectedValue,0);
  close(r.expectedCardsChosen,0);
  close(r.probabilityPositiveValue,0);
});

test('unknown physical pool order cannot change K0 expectation',()=>{
  const opts={hand:['A','A'],known:['B'],max:3,cost:0.5};
  const a=k0(['C','A','B','D','A'],2,
    {A:10,B:8,C:7},opts);
  const b=k0(['A','D','B','A','C'],2,
    {A:10,B:8,C:7},opts);
  close(a.expectedValue,b.expectedValue);
  close(a.expectedCardsChosen,b.expectedCardsChosen);
  close(a.probabilityPositiveValue,b.probabilityPositiveValue);
  assert.equal(a.exactDenominator,'10');
});

test('belief premise, state counts and weighting contracts are required',()=>{
  const bad={inventory:{pool:['A','B'],observedDeckPrintings:[],
    deckCount:1,prizeCount:1},
    ownHand:[],weights:{A:10},perCardCost:0,maxCards:1};
  assert.throws(()=>expectedK0UnrestrictedSearchValue(bad));
  assert.throws(()=>expectedK0UnrestrictedSearchValue({
    ...bad,uniformUnknownAllocation:true,
    inventory:{...bad.inventory,deckCount:2}
  }));
  assert.throws(()=>expectedK0UnrestrictedSearchValue({
    ...bad,uniformUnknownAllocation:true,weights:{A:Infinity}
  }));
  assert.throws(()=>expectedK0UnrestrictedSearchValue({
    ...bad,uniformUnknownAllocation:true,maxCards:4
  }));
});
