'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {choose,exactAscensionResourceScreen,candidateSpec} =
  require('../scripts/aichi-crustle-ascension-opener.cjs');

/** @param {number[]} elements @param {number} wanted @returns {number[][]} */
function subsets(elements,wanted) {
  if(wanted===0)return [[]];
  if(elements.length<wanted)return [];
  return [
    ...subsets(elements.slice(1),wanted-1).map(rest=>[elements[0],...rest]),
    ...subsets(elements.slice(1),wanted)
  ];
}

/** @param {string[]} deck @param {number} handSize @param {number} prizeCount */
function enumeratePhysicalDeals(deck,handSize,prizeCount) {
  let successful=0, total=0, valid=0;
  const indices=deck.map((_,i)=>i);
  for(const hand of subsets(indices,handSize)){
    const first=hand.map(i=>deck[i]);
    const kept=indices.filter(i=>!hand.includes(i));
    for(const draw of kept){
      const rest=kept.filter(i=>i!==draw);
      for(const prizes of subsets(rest,prizeCount)){
        total++;
        const legal=first.includes('D')||first.includes('M');
        if(legal)valid++;
        if(first.includes('D')&&[...first,deck[draw]].includes('G')&&
          rest.some(i=>!prizes.includes(i)&&deck[i]==='C'))successful++;
      }
    }
  }
  return {successful,total,valid};
}

test('binomial and fail-closed exact count',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(5,7),0n);
  assert.equal(choose(52,6),20358520n);
});

test('independent physical-deal enumeration validates stage1 resource accounting',()=>{
  const deck=['D','D','M','G','G','C','O','O','O'];
  const physical=enumeratePhysicalDeals(deck,3,2);
  const math=exactAscensionResourceScreen({
    size:9,handSize:3,prizes:2,dwebble:2,otherBasics:1,grass:2,crustle:1
  });
  assert.equal(physical.total,Number(choose(9,3)*6n*choose(5,2)));
  assert.equal(physical.successful/physical.total,
    math.directAscensionResourcesUnconditional.decimal);
  assert.equal(physical.successful/physical.valid,
    math.directAscensionResourcesGivenValidHand.decimal);
});

test('published v0 candidate resource-only screen',()=>{
  const result=exactAscensionResourceScreen(candidateSpec);
  assert.equal(result.initialLegalHandProbability.numerator,'5801596');
  assert.equal(result.initialLegalHandProbability.denominator,'9655173');
  assert.equal(result.directAscensionResourcesGivenValidHand.numerator,'53994312538437');
  assert.equal(result.directAscensionResourcesGivenValidHand.denominator,'166487530172600');
  assert.ok(result.unmodeled.includes('subsequent Double Colorless Energy access and Temple conflict'));
});
