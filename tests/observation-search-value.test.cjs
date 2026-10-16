'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {expectedTopWindowValue} =
  require('../simulation/twinleaf/observation-search-value.cjs');

function brute(input) {
  const {knownTop=[], unseenPool,deckCount,window,rewardByName,missValue} = input;
  let sum=0, permutations=0;
  function enumerate(rest,ordered) {
    if (!rest.length) {
      const top=[...knownTop,...ordered.slice(0,deckCount-knownTop.length)].slice(0,window);
      sum += top.reduce((best,name)=>Math.max(best,
        Object.hasOwn(rewardByName,name)?rewardByName[name]:missValue),missValue);
      permutations++;
      return;
    }
    for(let i=0;i<rest.length;i++)enumerate(
      [...rest.slice(0,i),...rest.slice(i+1)], [...ordered,rest[i]]);
  }
  enumerate(unseenPool,[]);
  return sum/permutations;
}

test('K0, K1, Prized and known-top posteriors',()=>{
  const b={window:7,rewardByName:{Arven:4},missValue:-2,uniformUnknownOrder:true};
  const p=(knownTop,unseenPool,deckCount,unrevealedPrizes)=>
    expectedTopWindowValue({...b,knownTop,unseenPool,deckCount,unrevealedPrizes});
  assert.ok(Math.abs(p([],['Arven',...Array(17).fill('E')],12,6).expectedValue-1/3)<1e-12);
  assert.ok(Math.abs(p([],['Arven',...Array(11).fill('E')],12,0).expectedValue-1.5)<1e-12);
  assert.equal(p([],Array(12).fill('E'),12,0).expectedValue,-2);
  assert.equal(p(['Arven'],Array(17).fill('E'),12,6).expectedValue,4);
  assert.ok(Math.abs(p(['E'],['Arven',...Array(16).fill('E')],12,6)
    .thresholds[0].probability-6/17)<1e-12);
});

test('exact multi-tier value matches independent exhaustive physical deals',()=>{
  for(const c of [
    {knownTop:[],unseenPool:['A','B','C','D','D'],deckCount:3,unrevealedPrizes:2,window:2},
    {knownTop:['D'],unseenPool:['A','B','C','D'],deckCount:3,unrevealedPrizes:2,window:3},
    {knownTop:['A','D'],unseenPool:['B','C','D'],deckCount:3,unrevealedPrizes:2,window:1}
  ]){
    const x={...c,rewardByName:{A:5,B:2,C:0},missValue:-1,uniformUnknownOrder:true};
    assert.ok(Math.abs(expectedTopWindowValue(x).expectedValue-brute(x))<1e-12);
  }
});

test('hidden permutations are invariant and invalid priors rejected',()=>{
  const x={knownTop:['D'],unseenPool:['C','A','B','C','A','D'],
    deckCount:5,unrevealedPrizes:2,window:4,missValue:-2,
    rewardByName:{A:7,B:3,C:0},uniformUnknownOrder:true};
  assert.deepEqual(expectedTopWindowValue(x),
    expectedTopWindowValue({...x,unseenPool:[...x.unseenPool].reverse()}));
  assert.throws(()=>expectedTopWindowValue({...x,uniformUnknownOrder:false}),/Uniform/);
  assert.throws(()=>expectedTopWindowValue({...x,unrevealedPrizes:3}),/reconcile/);
});
