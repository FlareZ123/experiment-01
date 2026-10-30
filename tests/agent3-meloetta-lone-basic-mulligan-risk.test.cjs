'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {exactLoneBasicRisk}=
  require('../scripts/agent3-meloetta-lone-basic-mulligan-risk.cjs');
const original=require('../results/aichi-2026/full-decklists.json');

test('rank26 source has exactly 12 Basic Pokemon, one Meloetta and two TM',()=>{
  const d=original.decks.find(x=>x.rank===26);
  assert.equal(d.archetype,'Meloetta Donk');
  const count=name=>d.cards.filter(x=>x.name===name)
    .reduce((a,c)=>a+c.count,0);
  assert.equal(d.cards.filter(x=>x.category==='Pokémon')
    .reduce((a,c)=>a+c.count,0),12);
  assert.equal(count('Meloetta ex'),1);
  assert.equal(count('Risky Ruins'),4);
  assert.equal(count('Technical Machine: Crisis Punch'),2);
  assert.equal(count('Exeggcute'),2);
  assert.equal(count('Damage Pump'),4);
});

test('candidate 12-Basic default remains solitaire after low source mulligans',()=>{
  const x=exactLoneBasicRisk();
  const e={
    sourceValidSeven:0.8093533072892635,
    expectedSourceMulligans:0.23555435060772448,
    candidateValidSeven:0.8093533072892635,
    soleBasicGivenValidSeven:0.4711087012154489,
    soleFrillishGivenValidSeven:0.15703623373848297,
    frillishGivenValidSeven:0.4936035006549792,
    postBonusSoleBasic:0.4490783684715948,
    postBonusSoleFrillish:0.1496927894905316
  };
  for(const [key,value] of Object.entries(e))
    assert.ok(Math.abs(x[key]-value)<1e-11,`${key}: ${x[key]}`);
  assert.ok(x.omittedSourceMulliganTail<3e-35);
});

test('higher candidate Basic count reduces solo risk but dilutes active Frillish',()=>{
  const b8=exactLoneBasicRisk({candidateBasics:8});
  const b12=exactLoneBasicRisk({candidateBasics:12});
  const b20=exactLoneBasicRisk({candidateBasics:20});
  assert.ok(b8.postBonusSoleBasic>b12.postBonusSoleBasic);
  assert.ok(b12.postBonusSoleBasic>b20.postBonusSoleBasic);
  assert.ok(b8.frillishGivenValidSeven>b20.frillishGivenValidSeven);
  assert.ok(Math.abs(b20.postBonusSoleBasic-0.19255190725993218)<1e-11);
});

test('invalid source or candidate Basic count fails',()=>{
  assert.throws(()=>exactLoneBasicRisk({candidateBasics:0}),RangeError);
  assert.throws(()=>exactLoneBasicRisk({sourceBasics:0}),RangeError);
  assert.throws(()=>exactLoneBasicRisk({frillish:5,candidateBasics:4}),RangeError);
});
