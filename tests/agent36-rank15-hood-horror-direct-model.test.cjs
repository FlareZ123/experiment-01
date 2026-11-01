'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {directOpeningModel}=require('../scripts/agent36-rank15-hood-horror-direct-model.cjs');
test('exact 2 Hood 2 Arven direct-start event',()=>{
  const r=directOpeningModel({hoodCopies:2,arvenCopies:2});
  assert.equal(r.denominator,'381947999887177360');
  assert.equal(r.favorable,'9921798248729500');
  assert.equal(r.directHood,'5471747408873200');
  assert.equal(r.arvenToHood,'4450050839856300');
  assert.ok(Math.abs(r.jointProbability-0.0259768299654934)<1e-12);
});
test('more Hood and Arven increases this restricted resource event',()=>{
  const a=directOpeningModel({hoodCopies:1,arvenCopies:1});
  const b=directOpeningModel({hoodCopies:2,arvenCopies:2});
  const c=directOpeningModel({hoodCopies:3,arvenCopies:2});
  assert.ok(a.jointProbability<b.jointProbability);
  assert.ok(b.jointProbability<c.jointProbability);
  assert.equal(directOpeningModel({hoodCopies:0,arvenCopies:0}).favorable,'0');
});

test('source proxy has 17 starting Basics and six Psychic providers',()=>{
  const entries=require('../results/als/new-moon-lockbreak-english-proxy-60.json').entries;
  const count=name=>entries.filter(e=>e.name_en===name)
    .reduce((total,e)=>total+e.count,0);
  assert.equal(entries.reduce((total,e)=>total+e.count,0),60);
  assert.equal(count('Gengar & Mimikyu-GX'),1);
  assert.equal(count('Dusclops'),2);
  assert.equal(count('Basic Psychic Energy')+count('Telepathic Psychic Energy'),6);
  assert.equal(count('Stealthy Hood'),0);
  assert.equal(count('Arven'),0);
  assert.equal(entries.filter(e=>e.type==='Pokémon').reduce((t,e)=>t+e.count,0),19);
});
