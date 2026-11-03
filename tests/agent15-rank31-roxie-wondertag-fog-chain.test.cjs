'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {test}=require('node:test');
const {inventory,successfulPrizeSets,countWonderTagChain}=
  require('../scripts/agent15-rank31-roxie-wondertag-fog-chain.cjs');
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'..','results','aichi-2026','full-decklists.json'),'utf8'));
const source=manifest.decks.find(d=>d.rank===31);
test('original source printing matches both tutor stages and abilities',()=>{
  assert.deepEqual(inventory(source),[3,1,1,4,4,10,37]);
  for(const [set,n,name,ability] of [
    ['sm2','60','Tapu Lele-GX','Wonder Tag'],
    ['swsh12','59','Radiant Alakazam','Painful Spoons'],
    ['sm12','76','Koffing','Blow-Away Bomb']
  ]){
    const cards=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','cards','en',set+'.json'),'utf8'));
    const card=cards.find(c=>c.id===set+'-'+n);
    assert.equal(card.name,name);
    assert(card.subtypes.includes('Basic')&&card.types.includes('Psychic'));
    assert(card.abilities.some(a=>a.name===ability));
  }
  const fog=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','cards','en','swsh6.json'),'utf8')).find(c=>c.id==='swsh6-140');
  assert(fog.rules.some(r=>r.includes('Basic Psychic Pokémon')));
});
test('six-Prize inclusion-exclusion gives simple exact cases',()=>{
  const choose=require('../scripts/agent15-rank31-roxie-firstdraw.cjs').choose;
  assert.equal(successfulPrizeSets([]),choose(52,6));
  assert.equal(successfulPrizeSets([1]),choose(51,6));
  assert.equal(successfulPrizeSets([1,1]),choose(50,6));
  assert.equal(successfulPrizeSets([2]),choose(52,6)-choose(50,4));
  assert.equal(successfulPrizeSets([2,1]),choose(52,6)-choose(50,4)-choose(51,5)+choose(49,3));
});
test('source starter anchors, independent Item and Wonder Tag phases',()=>{
  const r=countWonderTagChain(inventory(source));
  assert.equal(r.validSeven,'340827300');
  assert.equal(r.denominator,'367753188390588000');
  const e=r.events;
  assert.equal(e.cleanAnchorOpening.numerator,'308942445743131200');
  assert.equal(e.heldRoxieWithAnchor.numerator,'130983669602385600');
  assert.equal(e.heldRoxieWithFogTargets.numerator,'23738931435320752');
  assert.equal(e.heldLeleWonderTag.numerator,'4727992384628584');
  assert.equal(e.fogToLeleWonderTag.numerator,'6438910289726856');
  assert.equal(e.completeSourceAccess.numerator,'34905834109676192');
  assert(Math.abs(e.completeSourceAccess.percent-9.4916469011282)<1e-10);
  assert.equal(['heldRoxieWithFogTargets','heldLeleWonderTag','fogToLeleWonderTag'].reduce(
    (s,k)=>s+BigInt(e[k].numerator),0n).toString(),
    e.completeSourceAccess.numerator);
});
