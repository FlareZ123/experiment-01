'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {rank26PrintedExposure}=
  require('../scripts/agent3-rank26-duallock-print-census.cjs');

test('exact original rank26 printed 60 has 11 Basic Ability slots and 39 locked Trainer slots',()=>{
  const root=path.join(__dirname,'..');
  const p=rank26PrintedExposure(root);
  assert.equal(p.rank,26);
  assert.equal(p.items,35);
  assert.equal(p.tools,4);
  assert.equal(p.basicWithAbilities,11);
  assert.equal(p.otherPokemon,1);
  assert.equal(p.stadiums,4);
  assert.equal(p.supporters,2);
  assert.equal(p.energy,3);
  assert.equal(p.totalAffectedCategories,50);
  assert.equal(Object.values(p).filter(x=>Number.isInteger(x))
    .length,9);
});

test('named rank26 Basic Ability effects require actual original print identities',()=>{
  const p=rank26PrintedExposure(path.join(__dirname,'..'));
  const expected=new Map([
    ['Unown','Farewell Letter'],
    ['Exeggcute','Propagation'],
    ['Meloetta ex','Debut Performance'],
    ['Tapu Koko ♢','Dance of the Ancients'],
    ['Squawkabilly ex','Squawk and Seize'],
    ['Crobat V','Dark Asset'],
    ['Dedenne-GX','Dedechange']
  ]);
  assert.equal(p.abilities.length,expected.size);
  for(const c of p.abilities){
    assert.equal(c.abilities.length,1);
    assert.equal(c.abilities[0],expected.get(c.name));
    assert.ok(c.printing);
  }
  assert.equal(p.abilities.reduce((n,c)=>n+c.count,0),11);
});
