'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {jointUnprized,rank26PrizeGates}=
  require('../scripts/agent3-rank26-singleton-prize-gates.cjs');
const original=require('../results/aichi-2026/full-decklists.json');

test('rank26 source truly carries singleton DCE and Cologne plus two Lightning',()=>{
  const d=original.decks.find(x=>x.rank===26);
  const n=name=>d.cards.filter(c=>c.name===name)
    .reduce((a,c)=>a+c.count,0);
  assert.equal(n('Double Colorless Energy'),1);
  assert.equal(n('Canceling Cologne'),1);
  assert.equal(n('Lightning Energy'),2);
});

test('distinct physical Prize cards calculated jointly, no independence proxy',()=>{
  const p=rank26PrizeGates();
  for(const [name,expected] of Object.entries({
    doubleColorless:0.9,
    cologneAndDce:0.8084745762711865,
    donorWitnessEnergy:0.7248392752776154,
    donorWitnessEnergyPlusCologne:0.6485404041957612
  })){
    assert.ok(Math.abs(p[name].probabilityAllUnprized-expected)<1e-13);
  }
  assert.ok(p.cologneAndDce.probabilityAllUnprized<0.81);
  assert.ok(p.cologneAndDce.probabilityAllUnprized>0.8);
  assert.ok(Math.abs(p.cologneAndDce.probabilityAtLeastOnePrized-
    0.19152542372881354)<1e-13);
});

test('degenerate no-required and too many required cases',()=>{
  assert.equal(jointUnprized(0).probabilityAllUnprized,1);
  assert.equal(jointUnprized(60).probabilityAllUnprized,0);
  assert.throws(()=>jointUnprized(-1),RangeError);
  assert.throws(()=>jointUnprized(61),RangeError);
  assert.throws(()=>jointUnprized(1.5),RangeError);
});
