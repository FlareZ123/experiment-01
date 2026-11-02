'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,CATEGORIES,sourceCounts,choose,prizeSurvivalCount,
  countSearchWindow,main}=require('../simulation/evaluation/agent32-gh-prize-search-window.cjs');

/**
 * Enumerate literal physical indices independently of the category-product
 * counting and inclusion-exclusion in the production evaluator.
 * @param {number} n
 * @param {number} k
 * @returns {number[][]}
 */
function subsets(n,k) {
  const result=[];
  /** @param {number} start @param {number[]} picked */
  function walk(start,picked){
    if(picked.length===k){result.push([...picked]);return;}
    for(let j=start;j<=n-(k-picked.length);j++){
      picked.push(j);walk(j+1,picked);picked.pop();
    }
  }
  walk(0,[]);
  return result;
}

/** @param {number[]} groups */
function independentPhysicalNumerator(groups,prizeCount) {
  const identities=groups.flatMap((n,i)=>Array(n).fill(i));
  const total=identities.length,found=[];
  for(const handPositions of subsets(total,8)){
    const handSet=new Set(handPositions);
    const h=handPositions.map(i=>identities[i]);
    const available=identities.filter((_,i)=>!handSet.has(i));
    if(![0,1,2,5].every(id=>h.includes(id)))continue;
    if(!h.includes(3)&&!h.includes(4))continue;
    for(const prizes of subsets(total-8,prizeCount)){
      const prizeSet=new Set(prizes);
      const deck=available.filter((_,j)=>!prizeSet.has(j));
      if(![5,6,7,8,9].every(id=>deck.includes(id)))continue;
      if(!h.includes(3)&&!deck.includes(3))continue;
      found.push([handPositions,prizes]);
    }
  }
  return BigInt(found.length);
}

test('exact original exploratory 60 and literal target copy groups',()=>{
  assert.equal(VERSION,'agent32-rank2-exeggutor-firstturn-gh-prize-access-v1');
  assert.equal(CATEGORIES.length,11);
  assert.deepEqual(sourceCounts(),{
    counts:[2,2,2,4,4,3,2,2,2,2,35],totalBasics:14
  });
});

test('reproducible 60-card six-Prize G&H/Tag window and disjoint channels',()=>{
  const result=main();
  assert.equal(result.eligibleFirstEightGroupedStates,338);
  assert.deepEqual(result.unconditional,{
    numerator:'296411073108',denominator:'241156174284025',
    percent:0.12291249601550644
  });
  assert.equal(result.conditionalBasicValidSeven.numerator,'666924914493');
  assert.equal(result.conditionalBasicValidSeven.denominator,'467401895760800');
  assert.ok(Math.abs(result.conditionalBasicValidSeven.percent-
    (result.partitions.heldGuzmaHala.percent+
     result.partitions.tagOnlyNeedsGuzmaHalaInDeck.percent))<1e-12);
});

test('independent physical-index exhaustive toy exactly matches compressed count',()=>{
  const toy=[1,1,1,1,1,2,1,1,1,1,5];
  assert.equal(toy.reduce((a,b)=>a+b,0),16);
  const result=countSearchWindow(toy,3,7,2);
  const independent=independentPhysicalNumerator(toy,2);
  assert.equal(result.totalFavorable,independent);
  assert.equal(result.allDeals,choose(16,8)*choose(8,2));
  assert.equal(result.heldGuzma+result.tagOnly,result.totalFavorable);
  assert.ok(independent>0n);
});

test('joint Prize avoidance inclusion-exclusion matches simple named constraints',()=>{
  // Six unknown Prizes out of 52 must avoid exhausting each singleton.
  assert.equal(prizeSurvivalCount(52,6,[1,1]),choose(50,6));
  assert.equal(prizeSurvivalCount(52,6,[2]),
    choose(52,6)-choose(50,4));
});

test('without a first-eight Supporter connector the route is impossible',()=>{
  const noConnector=[1,1,1,0,0,2,1,1,1,1,5];
  assert.equal(countSearchWindow(noConnector,3,7,2).totalFavorable,0n);
});
