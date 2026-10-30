'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const manifest=require('../results/aichi-2026/full-decklists.json');
const {thornsHammerBelief,thornsHammerBeliefAnyFailedWithoutHammer}=
  require('../scripts/agent26-thorns-public-hammer-tech-risk.cjs');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,
  String(a)+' != '+String(b));

test('printed Iron Thorns Hammer counts and uniform source prior',()=>{
  const r=thornsHammerBelief(manifest,{failedHands:0,hammerSeen:false});
  assert.deepEqual(r.models.map(x=>[x.rank,x.hammerCopies]),
    [[6,4],[24,0],[29,4]]);
  near(r.posteriorProbabilityFourHammers,2/3);
  near(r.models.reduce((n,x)=>n+x.posterior,0),1);
});

test('one visible Hammer-free invalid hand reduces four-copy belief',()=>{
  const r=thornsHammerBelief(manifest,{failedHands:1,hammerSeen:false});
  near(r.posteriorProbabilityFourHammers,0.5356883705289985);
  assert.ok(r.posteriorNextValidHandHammerChance>0);
  assert.ok(r.posteriorNextValidHandHammerChance<
    thornsHammerBelief(manifest,{failedHands:0,hammerSeen:false})
      .posteriorNextValidHandHammerChance);
});

test('two restored Hammer-free hands weigh source differently',()=>{
  const a=thornsHammerBelief(manifest,{failedHands:1,hammerSeen:false});
  const b=thornsHammerBelief(manifest,{failedHands:2,hammerSeen:false});
  assert.ok(b.posteriorProbabilityFourHammers<a.posteriorProbabilityFourHammers);
});

test('a publicly disclosed Hammer excludes the source without that tech',()=>{
  const r=thornsHammerBelief(manifest,{failedHands:1,hammerSeen:true});
  near(r.posteriorProbabilityFourHammers,1);
  assert.equal(r.models.find(x=>x.rank===24).posterior,0);
});

test('at least one unspecified number of Hammer-free sevens differs from exactly one',()=>{
  const r=thornsHammerBeliefAnyFailedWithoutHammer(manifest);
  near(r.posteriorProbabilityFourHammers,0.4135579451060244);
  assert.ok(r.posteriorProbabilityFourHammers<
    thornsHammerBelief(manifest,{failedHands:1,hammerSeen:false})
      .posteriorProbabilityFourHammers);
});

test('impossible events and missing real sources fail closed',()=>{
  assert.throws(()=>thornsHammerBelief(manifest,
    {failedHands:0,hammerSeen:true}));
  const partial=structuredClone(manifest);
  partial.decks=partial.decks.filter(x=>x.rank!==24);
  assert.throws(()=>thornsHammerBelief(partial,
    {failedHands:0,hammerSeen:false}),/Missing printed/);
});
