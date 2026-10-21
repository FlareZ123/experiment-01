'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const decks=require('../results/aichi-2026/full-decklists.json').decks;
const {choose}=require('../scripts/agent43-choose-exact.cjs');
const {naturalWindow}=require('../scripts/agent43-rank22-natural-wally-window.cjs');
const rank22=decks.find(row=>row.rank===22);
const quantity=name=>rank22.cards.filter(row=>row.name===name)
  .reduce((n,row)=>n+row.count,0);
const basicNames=['Mega Absol ex','Vikavolt V','Trubbish','Crobat V',
  'Squawkabilly ex','Tapu Lele-GX','Dedenne-GX','Tapu Koko ♢','Budew'];
const toolNames=['Float Stone','Forest Seal Stone','Muscle Band'];
const input={
  wally:quantity('Wally'),
  trubbish:quantity('Trubbish'),
  tools:toolNames.reduce((n,s)=>n+quantity(s),0),
  garbodor:quantity('Garbodor'),
  otherBasics:basicNames.reduce((n,s)=>n+quantity(s),0)-quantity('Trubbish'),
  otherCards:0
};
input.otherCards=60-input.wally-input.trubbish-input.tools-input.garbodor-input.otherBasics;

test('published exact rank22 60 has source-inferred Wally opportunity counts',()=>{
  assert.equal(rank22.cards.reduce((n,row)=>n+row.count,0),60);
  assert.equal(quantity('Hisuian Heavy Ball'),0);
  assert.deepEqual(input,{wally:1,trubbish:2,tools:6,garbodor:2,
    otherBasics:10,otherCards:39});
});

test('natural Basic-valid first-eight + unprized Garbodor window',()=>{
  assert.equal(choose(60,7),386206920n);
  const x=naturalWindow(input);
  assert.ok(Math.abs(x.conditional-1185038867/69079704408)<1e-15);
  assert.ok(x.conditional>0&&x.conditional<0.02);
});

test('counterfactual intended Heavy Ball has no Wally route',()=>{
  const x=naturalWindow({...input,wally:0,otherCards:40});
  assert.equal(x.conditional,0);
});
