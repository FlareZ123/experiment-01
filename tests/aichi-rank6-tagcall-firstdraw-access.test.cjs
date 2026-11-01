'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {exactFirstDrawDeals,originalRank6Counts,rate}=require(
  '../scripts/aichi-rank6-tagcall-firstdraw-access.cjs');

/** @param {number[]} input @param {number} n @returns {number[][]} */
function subsets(input,n){
  if(n===0)return [[]];
  if(input.length<n)return [];
  return [
    ...subsets(input.slice(1),n-1).map(t=>[input[0],...t]),
    ...subsets(input.slice(1),n)
  ];
}

/**
 * Independent physical-label enumeration. Does not use the analytical
 * calculator's combination allocations or its category coefficients.
 * @param {number[]} counts @param {number} openingHand @param {number} prizes
 * @returns {Record<string,bigint>}
 */
function brute(counts,openingHand,prizes){
  const cards=counts.flatMap((count,category)=>Array(count).fill(category));
  const indices=cards.map((_,i)=>i);
  const out={valid:0n,tagHeld:0n,tagHeldNoHala:0n,
    tagNoHalaTargetMountain:0n,tagNoHalaMountainPrized:0n,
    tagNoHalaBothHalaPrized:0n,tagNoHalaBothFailure:0n};
  for(const hand of subsets(indices,openingHand)){
    if(!hand.some(i=>cards[i]===0))continue;
    const afterHand=indices.filter(i=>!hand.includes(i));
    for(const prizesIndices of subsets(afterHand,prizes)){
      const deck=afterHand.filter(i=>!prizesIndices.includes(i));
      for(const drawn of deck){
        out.valid++;
        const seen=[...hand,drawn].map(i=>cards[i]);
        if(!seen.includes(1))continue;
        out.tagHeld++;
        if(seen.includes(2))continue;
        out.tagHeldNoHala++;
        const lost=prizesIndices.map(i=>cards[i]);
        const mountainPrized=lost.includes(3);
        const bothHalaPrized=lost.filter(c=>c===2).length===counts[2];
        if(mountainPrized)out.tagNoHalaMountainPrized++;
        if(bothHalaPrized)out.tagNoHalaBothHalaPrized++;
        if(mountainPrized&&bothHalaPrized)out.tagNoHalaBothFailure++;
        if(!mountainPrized&&!bothHalaPrized)
          out.tagNoHalaTargetMountain++;
      }
    }
  }
  return out;
}

test('rank6 exact printed 60 counts',()=>{
  assert.deepEqual(originalRank6Counts(),[4,2,2,1,51]);
});

test('rank6 physical opening-seven, six prizes, first draw',()=>{
  const x=exactFirstDrawDeals({counts:originalRank6Counts(),
    openingHand:7,prizes:6});
  assert.equal(x.valid,166478632771651200n);
  assert.equal(x.tagHeld,38174151567464640n);
  assert.equal(x.tagHeldNoHala,30410351300143360n);
  assert.equal(x.tagNoHalaTargetMountain,26969366182968160n);
  assert.equal(x.tagNoHalaMountainPrized,3121458646908000n);
  assert.equal(x.tagNoHalaBothHalaPrized,344008498870400n);
  assert.equal(x.tagNoHalaBothFailure,24482028603200n);
  assert.ok(Math.abs(rate(x.tagNoHalaTargetMountain,x.valid)-
    0.16199896488)<1e-11);
});

test('independent physical labels reproduce 2-Basic mini-deck',()=>{
  const inputs={counts:[2,2,2,1,5],openingHand:4,prizes:3};
  assert.deepEqual(exactFirstDrawDeals(inputs),
    brute(inputs.counts,inputs.openingHand,inputs.prizes));
});

test('independent physical labels reproduce 1-Basic mini-deck',()=>{
  const inputs={counts:[1,1,2,1,5],openingHand:3,prizes:2};
  assert.deepEqual(exactFirstDrawDeals(inputs),
    brute(inputs.counts,inputs.openingHand,inputs.prizes));
});

test('zero Tag Call has zero-access numerator',()=>{
  const x=exactFirstDrawDeals({counts:[2,0,2,1,7],
    openingHand:4,prizes:3});
  assert.equal(x.tagHeld,0n);
  assert.equal(x.tagNoHalaTargetMountain,0n);
});
