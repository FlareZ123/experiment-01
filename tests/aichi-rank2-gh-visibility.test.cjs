'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {exactVisibility,rank2Visibility}=
  require('../scripts/aichi-rank2-gh-visibility.cjs');

/**
 * Independent physical-card eight-visible enumeration.
 * Each omitted card and choice of last (turn-drawn) card is one equiprobable
 * observation, with the other seven forming the actual initial hand.
 * @param {readonly string[]} deck
 * @returns {{numerator:bigint,denominator:bigint}}
 */
function toyOracle(deck) {
  let numerator=0n,denominator=0n;
  for(let omitted=0;omitted<deck.length;omitted++){
    const viewed=deck.filter((_,i)=>i!==omitted);
    for(let drawn=0;drawn<viewed.length;drawn++){
      const opening=viewed.filter((_,i)=>i!==drawn);
      denominator++;
      if(opening.includes('b') && viewed.includes('e') &&
         viewed.includes('h')) numerator++;
    }
  }
  return {numerator,denominator};
}

test('exact first-seven sampling agrees with independent 9-card physical oracle',()=>{
  for(const [counts,deck] of [
    [{b:1,e:1,h:1,other:6},['b','e','h',...'oooooo']],
    [{b:2,e:1,h:1,other:5},['b','b','e','h',...'ooooo']]
  ]){
    assert.deepEqual(exactVisibility(counts),toyOracle(deck));
  }
});

test('published rank2 Vileplume source yields correct visibility fraction',()=>{
  const result=rank2Visibility();
  assert.equal(result.numerator,'1564841264');
  assert.equal(result.denominator,'20468966760');
  assert.ok(Math.abs(result.unconditionalProbability-0.07644945064144508)<1e-12);
  assert.ok(Math.abs(result.conditionalOnLegalOpening-0.08874927278331579)<1e-12);
  assert.match(result.scope,/Visibility only/);
});

test('event cannot be satisfied without one of its source components',()=>{
  for(const missing of ['b','e','h']){
    const counts={b:1,e:1,h:1,other:6};
    counts[missing]=0;
    counts.other++;
    const value=exactVisibility(counts);
    assert.equal(value.numerator,0n);
    assert.equal(value.denominator,72n);
  }
});
