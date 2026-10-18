'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {EXPECTED,classify,prepared,exact}=
  require('../scripts/aichi-vileplume-gh-discard-frontier.cjs');
const {cardGroups,exactOpportunity}=
  require('../scripts/aichi-vileplume-tm-opening.cjs');
const source=require('../results/aichi-2026/full-decklists.json');
const approx=(a,b)=>assert.ok(Math.abs(a-b)<1e-10);

test('rank2 source inventory counts, singletons and ordinary opening',()=>{
  const rank2=source.decks.find(x=>x.rank===2);
  assert.equal(rank2.player,'Takahiro Ando');
  assert.equal(rank2.cards.reduce((s,c)=>s+c.count,0),60);
  assert.deepEqual(classify(rank2.cards),EXPECTED);
  assert.deepEqual(cardGroups(rank2.cards),
    {b:2,e:6,o:6,h:4,t:4,m:2,j:2,s:3,g:1,x:30});
});
test('two-card discard selection distinguishes spare copies from singles',()=>{
  const zero=Object.fromEntries(Object.keys(EXPECTED).map(k=>[k,0]));
  const first={...zero,b:1,e:1,h:1,u:4};
  const observed={...first,j:1};
  const left={...EXPECTED};
  for(const k of Object.keys(left))left[k]-=observed[k];
  const a=prepared(first,observed,left,6);
  assert.equal(a.available,4);
  assert.equal(a.spares,4);
  assert.equal(a.repeatSpares,0);
  const protectedFirst={...first,u:0,p:4};
  const protectedObserved={...protectedFirst,j:1};
  for(const k of Object.keys(left))left[k]=EXPECTED[k]-protectedObserved[k];
  const b=prepared(protectedFirst,protectedObserved,left,6);
  assert.equal(b.available,4);
  assert.equal(b.spares,0);
});
test('exact six Prize average and protected-hand sensitivity',()=>{
  const r=exact(EXPECTED);
  const p=r.conditionalOnLegalSeven;
  approx(r.legalSevenProbability,0.8614093191287199);
  approx(p.ghNeeded,0.09243804789279057);
  approx(p.ghAndTwoMechanicallyAvailable,p.ghNeeded);
  approx(p.ghAndTwoNonSingletonOrRepeat,0.07795492678899214);
  approx(p.ghAndTwoRepeatConnectors,0.0063388939831787484);
  approx(r.conditionalOnGhNeeded.ghAndTwoNonSingletonOrRepeat,
    0.8433207814968582);
  approx(r.conditionalOnGhNeeded.ghAndTwoRepeatConnectors,
    0.06857451155319272);
  const old=exactOpportunity(cardGroups(source.decks.find(x=>x.rank===2).cards));
  assert.ok(p.ghNeeded<old.benchTargetConditional);
});
