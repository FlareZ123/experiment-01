'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {evaluate,frozenDeckCounts} = require('../scripts/mega-darkrai-opening-direct.cjs');

test('60-card candidate direct access fractions match separate integer enumeration',()=>{
  const result=evaluate(frozenDeckCounts);
  assert.equal(result.darkraiAndStatus.favorable,'5849826336');
  assert.equal(result.darkraiStatusJanine.favorable,'1768132880');
  assert.equal(result.darkraiStatusTwoElixirs.favorable,'330192128');
  assert.equal(result.darkraiStatusTwoElixirsEnergy.favorable,'233378496');
  assert.equal(result.darkraiStatusTwoElixirsEnergyBothBasicKindsInitially.favorable,'80602704');
  assert.equal(result.darkraiStatusTwoElixirsEnergyJanine.favorable,'45136416');
  for(const entry of Object.values(result)){
    assert.equal(entry.legalSevenThenOne,'15916235808');
    assert.ok(entry.conditional>=0&&entry.conditional<=1);
  }
});
test('Removing all special-condition Items makes status conjunction impossible',()=>{
  const p={...frozenDeckCounts,status:0,other:29};
  for(const entry of Object.values(evaluate(p)))assert.equal(entry.favorable,'0');
});
test('One Darkrai, no other Basic: legal opening-seven condition remains enforced',()=>{
  const p={darkrai:1,otherBasic:0,status:8,elixir:4,energy:13,janine:3,other:31};
  const result=evaluate(p);
  assert.ok(result.darkraiAndStatus.conditional>0);
  assert.equal(result.darkraiStatusTwoElixirsEnergyBothBasicKindsInitially.favorable,'0');
});
test('No Max Elixir: two-Elixir opportunity impossible while status remains possible',()=>{
  const p={...frozenDeckCounts,elixir:0,other:25};
  const result=evaluate(p);
  assert.ok(result.darkraiAndStatus.conditional>0);
  assert.equal(result.darkraiStatusTwoElixirs.favorable,'0');
});
