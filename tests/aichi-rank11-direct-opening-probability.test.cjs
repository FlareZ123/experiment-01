'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {directOpeningCategories,choose,exactDirectOpeningEvent}=
  require('../scripts/aichi-rank11-direct-opening-probability.cjs');
const rank11=require('../results/aichi-2026/full-decklists.json')
  .decks.find(deck=>deck.rank===11);

test('published exact rank11 Basic and opener partition is unchanged',()=>{
  assert.deepEqual(directOpeningCategories(rank11),
    [2,9,4,6,2,2,35]);
  assert.equal(choose(60,7),386206920);
  assert.equal(choose(60,61),0);
});

test('exact first-eight root-only opportunity with first-seven valid Basic',()=>{
  const categories=directOpeningCategories(rank11);
  const result=exactDirectOpeningEvent(categories);
  assert.deepEqual(result.reducedFraction,[48344345,723465264]);
  assert.ok(Math.abs(result.probability-0.06682331192061212)<1e-13);
  assert.equal(result.firstSevenBasicConditioned,true);
  assert.equal(result.qualifiedForCompetitiveInference,false);
});

test('K0 both-Garbodor-held guard matters and does not alter the setup denominator',()=>{
  const categories=directOpeningCategories(rank11);
  const guarded=exactDirectOpeningEvent(categories);
  const raw=exactDirectOpeningEvent(categories,{
    k0AvoidAllGarbodorHeld:false
  });
  assert.deepEqual(raw.reducedFraction,[267579755,3979058952]);
  assert.equal(guarded.denominator,raw.denominator);
  assert.ok(raw.numerator>guarded.numerator);
});

test('source first seven only and optimistic free Quick Ball are distinct scenarios',()=>{
  const categories=directOpeningCategories(rank11);
  const seven=exactDirectOpeningEvent(categories,{ordinaryDraws:0});
  const eight=exactDirectOpeningEvent(categories);
  const optimistic=exactDirectOpeningEvent(categories,{
    optimisticQuickBallAccess:true
  });
  assert.deepEqual(seven.reducedFraction,[573263,12512764]);
  assert.deepEqual(optimistic.reducedFraction,[353456375,3979058952]);
  assert.ok(seven.probability<eight.probability);
  assert.ok(eight.probability<optimistic.probability);
});

test('pool drift and malformed category counts fail closed',()=>{
  const changed=structuredClone(rank11);
  changed.cards.find(card=>card.name==='Boost Shake').count=3;
  assert.throws(()=>directOpeningCategories(changed));
  assert.throws(()=>exactDirectOpeningEvent([2,9,4,6,2,2,34]));
  assert.throws(()=>exactDirectOpeningEvent([2,9,4,6,2,2,35],{
    ordinaryDraws:2
  }));
});
