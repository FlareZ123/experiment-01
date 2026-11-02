'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {evaluate}=
  require('../simulation/evaluation/agent33-rank29-guzma-hala-prize-reachability.cjs');

const fixture={decks:[{rank:29,cards:[
  {name:'Iron Thorns ex',category:'Pokémon',count:4},
  {name:'Camping Gear',category:'Trainer',count:2},
  {name:'Tropical Beach',category:'Trainer',count:2},
  {name:'Double Colorless Energy',category:'Energy',count:1},
  {name:'Thunder Mountain ♢',category:'Trainer',count:1},
  {name:'Guzma & Hala',category:'Trainer',count:2},
  {name:'Other',category:'Trainer',count:48}
]}]};

test('exact full original rank29 co-held opener and six-Prize multi-axis sufficiency',()=>{
  const r=evaluate(fixture);
  assert.equal(r.openerWays,'5275304');
  assert.ok(Math.abs(r.allThreeResourceCategoriesReachable-
    0.7914876633273732)<1e-14);
  assert.ok(Math.abs(r.bothAttackResourcesNotPrizedUpperEnvelope-
    0.7995072054199799)<1e-14);
  assert.ok(Math.abs(r.additionalAccessRequiresAlternativeLine-
    0.008019542092606703)<1e-14);
  assert.ok(r.allThreeResourceCategoriesReachable<
    r.bothAttackResourcesNotPrizedUpperEnvelope);
  assert.equal(r.competitiveQualifiedGames,0);
});

test('bridge count or printed exact source60 drift fails closed',()=>{
  const changed=structuredClone(fixture);
  changed.decks[0].cards.find(c=>c.name==='Guzma & Hala').count=1;
  assert.throws(()=>evaluate(changed),/Expected values/);
});
