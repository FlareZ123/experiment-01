'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {firstTurnGuzma}=
  require('../scripts/agent3-jellicent-guzma-setup-counter.cjs');
const field=require('../results/aichi-2026/full-decklists.json');

test('authenticated original fields have broad potential non-Item Guzma counter',()=>{
  const source=field.decks;
  const withGuzma=source.filter(d=>d.cards.some(c=>c.name==='Guzma'));
  assert.equal(source.length,29);
  assert.equal(withGuzma.length,25);
  assert.equal(source.reduce((s,d)=>s+d.cards
    .filter(c=>c.name==='Guzma')
    .reduce((a,c)=>a+c.count,0),0),48);
  for(const [rank,g] of [[2,2],[6,3],[11,2],[15,2],[26,0]]){
    const d=source.find(x=>x.rank===rank);
    assert.ok(d);
    assert.equal(d.cards.filter(c=>c.name==='Guzma')
      .reduce((a,c)=>a+c.count,0),g);
  }
});

test('first eight card source-Guzma access, conditioned on valid Basic seven',()=>{
  for(const [basics,guzmaCopies,prob] of [
    [14,2,0.241157606820817],
    [4,3,0.3259257012401101],
    [11,2,0.23807914224890825],
    [12,0,0]
  ]){
    const r=firstTurnGuzma({sourceBasics:basics,guzmaCopies});
    assert.ok(Math.abs(r.firstTurnGuzmaProbability-prob)<1e-11);
    assert.ok(r.numerator>=0n&&r.denominator>0n);
  }
});

test('no Basic and impossible composition are rejected',()=>{
  assert.throws(()=>firstTurnGuzma({
    sourceBasics:0,guzmaCopies:2
  }),RangeError);
  assert.throws(()=>firstTurnGuzma({
    sourceBasics:58,guzmaCopies:4
  }),RangeError);
});
