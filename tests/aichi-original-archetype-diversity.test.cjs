'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {deckDistance,printingKey,analyzeFile,analyzeRoster}=
  require('../scripts/aichi-original-archetype-diversity.cjs');

const card=(name,count,set='A',number='1')=>({
  category:'Pokémon',name,count,
  printing:{set,number,language:'en'}
});
const deck=(rank,archetype,cards)=>({rank,archetype,cards});

test('a substitution is counted once; shared copies use the minimum',()=>{
  const a=deck(1,'example',[card('A',3),card('B',1)]);
  const b=deck(2,'example',[card('A',1),card('B',2),card('C',1)]);
  assert.deepEqual(deckDistance(a,b,c=>c.name),
    {shared:2,replacements:2});
  assert.deepEqual(deckDistance(b,a,c=>c.name),
    {shared:2,replacements:2});
});

test('same-name different printed attacks are not identical sources',()=>{
  const a=deck(1,'example',[card('A',2,'AAA','4')]);
  const b=deck(2,'example',[card('A',2,'BBB','7')]);
  assert.deepEqual(deckDistance(a,b,c=>c.name),
    {shared:2,replacements:0});
  assert.deepEqual(deckDistance(a,b,printingKey),
    {shared:0,replacements:2});
});

test('an incomplete original roster card count is rejected',()=>{
  const a=deck(1,'example',[card('A',59)]);
  assert.throws(()=>analyzeRoster([a]),/complete 60/);
});

test('authenticated Aichi source multiset divergence is reproducible',()=>{
  const result=analyzeFile();
  assert.equal(result.knownLists,29);
  assert.equal(result.archetypes,14);
  assert.equal(result.pairCount,47);
  const get=name=>result.groups.find(g=>g.archetype===name);
  const raichu=get('Raichu Electrode Combo');
  assert.deepEqual(raichu.ranks,[4,17]);
  assert.equal(raichu.mostDifferent.nameReplacements,20);
  assert.equal(raichu.mostDifferent.printingReplacements,21);
  const snorlax=get('Snorlax Stall');
  assert.deepEqual(snorlax.ranks,[3,7]);
  assert.equal(snorlax.mostDifferent.nameReplacements,34);
  const absol=get('Absol Garbodor');
  assert.equal(absol.mostDifferent.nameReplacements,26);
  assert.equal(absol.mostDifferent.printingReplacements,27);
  assert.deepEqual(absol.mostDifferent.ranks,[11,22]);
  const drago=get('Regidrago');
  assert.equal(drago.pairCount,36);
  assert.equal(drago.mostDifferent.nameReplacements,21);
  assert.deepEqual(drago.mostDifferent.ranks,[18,32]);
  assert.equal(drago.leastDifferent.nameReplacements,6);
  assert.deepEqual(drago.leastDifferent.ranks,[12,27]);
});
