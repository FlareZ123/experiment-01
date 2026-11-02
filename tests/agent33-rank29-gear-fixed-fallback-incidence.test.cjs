'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {evaluate}=
  require('../simulation/evaluation/agent33-rank29-gear-fixed-fallback-incidence.cjs');

const fixture={decks:[{rank:29,cards:[
  {name:'Iron Thorns ex',category:'Pokémon',count:4},
  {name:'Camping Gear',category:'Trainer',count:2},
  {name:'Tropical Beach',category:'Trainer',count:2},
  {name:'Double Colorless Energy',category:'Energy',count:1},
  {name:'Thunder Mountain ♢',category:'Trainer',count:1},
  {name:'Guzma & Hala',category:'Trainer',count:2},
  {name:'Speed Lightning Energy',category:'Energy',count:4},
  {name:'Other',category:'Trainer',count:44}
]}]};

test('finite six-Prize and T1-draw event is rare but fixed fallback almost certain',()=>{
  const row=evaluate(fixture);
  assert.equal(row.eventDrawWays,'18970952');
  assert.equal(row.originalSourceCounts.fallback,6);
  assert.ok(Math.abs(row.eventProbabilityGivenLegalBasic-
    0.0020522549682069407)<1e-14);
  assert.ok(Math.abs(row.conditionalNoFixedFallback-
    0.000007832206263701581)<1e-14);
  assert.ok(Math.abs(row.fixedFallbackAvailableGivenEvent-
    0.9999921677937363)<1e-14);
  assert.ok(Math.abs(row.jointEventAndFixedFallbackGivenLegalBasic-
    0.002052238894522724)<1e-14);
  assert.equal(row.competitiveQualifiedGames,0);
});

test('source-card count drift fails closed instead of silently changing claim',()=>{
  const changed=structuredClone(fixture);
  changed.decks[0].cards.find(c=>c.name==='Speed Lightning Energy').count=3;
  assert.throws(()=>evaluate(changed),/deepStrictEqual|deep-equal|Expected values/);
});
