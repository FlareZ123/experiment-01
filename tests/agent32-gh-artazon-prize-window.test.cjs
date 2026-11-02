'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,sourceArtazonCounts,countArtazonSearchWindow,main}=
  require('../simulation/evaluation/agent32-gh-artazon-prize-window.cjs');
const {choose}=require('../simulation/evaluation/agent32-gh-prize-search-window.cjs');

/** @param {number} n @param {number} k @returns {number[][]} */
function subsets(n,k){
  const found=[];
  /** @param {number} first @param {number[]} selection */
  function rec(first,selection){
    if(selection.length===k){found.push([...selection]);return;}
    for(let i=first;i<=n-(k-selection.length);i++){
      selection.push(i);rec(i+1,selection);selection.pop();
    }
  }
  rec(0,[]);
  return found;
}

/**
 * Full 14-17-card physical-index test oracle. Count each actual eight-card
 * subset and subsequent unordered Prize subset directly, with no symbolic
 * inclusion-exclusion, group multinomials or production helper callbacks.
 * @param {number[]} counts
 * @param {number} prizes
 * @returns {bigint[]} Disjoint three-Basic / two-Basic-Artazon successes.
 */
function physicalOracle(counts,prizes){
  const cards=counts.flatMap((count,index)=>Array(count).fill(index));
  const result=[0n,0n];
  for(const selected of subsets(cards.length,8)){
    const seen=new Set(selected);
    const hand=selected.map(index=>cards[index]);
    const left=cards.filter((_,index)=>!seen.has(index));
    if(!hand.includes(5)||
       (!hand.includes(3)&&!hand.includes(4)))continue;
    const n=[0,1,2].filter(kind=>hand.includes(kind)).length;
    if(n<2)continue;
    for(const prize of subsets(left.length,prizes)){
      const removed=new Set(prize);
      const deck=left.filter((_,index)=>!removed.has(index));
      if(![5,6,7,8,9].every(kind=>deck.includes(kind)))continue;
      if(!hand.includes(3)&&!deck.includes(3))continue;
      if(n===2){
        if(!hand.includes(10)&&!deck.includes(10))continue;
        if([0,1,2].some(kind=>!hand.includes(kind)&&
          !deck.includes(kind)))continue;
      }
      result[n===3?0:1]++;
    }
  }
  return result;
}

test('artazon and original rank2-derived 60 split are source-exact',()=>{
  assert.equal(VERSION,'agent32-rank2-exeggutor-gh-artazon-prize-window-v1');
  assert.deepEqual(sourceArtazonCounts(),{
    counts:[2,2,2,4,4,3,2,2,2,2,2,33],totalBasics:14
  });
});

test('two-Basic Artazon route and three-Basic branch exact rational regression',()=>{
  const r=main();
  assert.deepEqual(r.groupedFirstEightStates,[464,2664]);
  assert.equal(r.threeBasicsHeld.conditional.numerator,'666924914493');
  assert.equal(r.twoBasicsArtazon.conditional.numerator,'256647398703');
  assert.equal(r.twoBasicsArtazon.conditional.denominator,'11365395641600');
  assert.deepEqual(r.combined.conditionalBasicValidSeven,{
    numerator:'89772393489231',denominator:'3739215166086400',
    percent:2.4008351887166226
  });
  assert.ok(Math.abs(r.combined.conditionalBasicValidSeven.percent-
    r.twoBasicsArtazon.conditional.percent-
    r.threeBasicsHeld.conditional.percent)<1e-12);
});

test('independent exhaustive physical-index miniature matches both branches',()=>{
  const toy=[1,1,1,1,1,2,1,1,1,1,1,5];
  assert.equal(toy.reduce((a,b)=>a+b,0),17);
  const counted=countArtazonSearchWindow(toy,3,7,2);
  const physically=physicalOracle(toy,2);
  assert.ok(physically[0]>0n&&physically[1]>0n);
  assert.deepEqual(counted.values,physically);
  assert.equal(counted.allDeals,choose(17,8)*choose(9,2));
  assert.deepEqual(counted.values,counted.held.map((v,i)=>v+counted.viaTag[i]));
});

test('Artazon-free source can still execute all-three Basic branch only',()=>{
  const toy=[1,1,1,1,1,2,1,1,1,1,0,6];
  const r=countArtazonSearchWindow(toy,3,7,2);
  assert.equal(r.values[1],0n);
  assert.ok(r.values[0]>0n);
});
