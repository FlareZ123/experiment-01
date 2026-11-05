'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  choose,naturalGuzmaConditionalBasic,rank6NaturalGuzmaProxy
}=require('../simulation/evaluation/agent8-rank6-direct-guzma-pivot-proxy.cjs');

test('exact integer binomial coefficients and outside-population case',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(5,2),10n);
  assert.equal(choose(5,0),1n);
  assert.equal(choose(3,4),0n);
});

test('authenticated original rank6 natural first-nine Guzma chance',()=>{
  const x=rank6NaturalGuzmaProxy();
  assert.equal(x.deckSize,60);
  assert.equal(x.basicCount,4);
  assert.equal(x.guzmaCount,3);
  assert.equal(x.seenCards,9);
  assert.equal(x.numerator,'804101');
  assert.equal(x.denominator,'2204136');
  assert.ok(Math.abs(x.decimal-0.36481460309164226)<1e-14);
  assert.equal(x.competitiveGamesQualified,0);
  assert.ok(Object.isFrozen(x));
});

test('no-search first-eight proxy is smaller than next-turn first-nine',()=>{
  const counts={deckSize:60,basicCount:4,guzmaCount:3};
  const firstEight=naturalGuzmaConditionalBasic(counts,8);
  const firstNine=naturalGuzmaConditionalBasic(counts,9);
  assert.equal(firstEight.numerator,'1257173');
  assert.equal(firstEight.denominator,'3857238');
  assert.ok(firstEight.decimal<firstNine.decimal);
});

test('no later draw is distinct from at least one Guzma in original 7',()=>{
  const counts={deckSize:60,basicCount:4,guzmaCount:3};
  const opening=naturalGuzmaConditionalBasic(counts,7);
  const nine=naturalGuzmaConditionalBasic(counts,9);
  assert.ok(opening.decimal>0&&opening.decimal<nine.decimal);
});

test('outside of 6 prize and ill-defined Basic split fails closed',()=>{
  for(const seen of [6,55,Infinity])
    assert.throws(()=>naturalGuzmaConditionalBasic({
      deckSize:60,basicCount:4,guzmaCount:3},seen));
  for(const counts of [
    {deckSize:60,basicCount:0,guzmaCount:3},
    {deckSize:60,basicCount:4,guzmaCount:0},
    {deckSize:60,basicCount:60,guzmaCount:3},
    {deckSize:6,basicCount:4,guzmaCount:2}
  ])assert.throws(()=>naturalGuzmaConditionalBasic(counts));
});
