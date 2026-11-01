'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {directMegaJetOpportunity}=
  require('../scripts/agent36-rank15-mega-powerful-jet-direct.cjs');
const source=require('../results/aichi-2026/full-decklists.json');

test('exact rank15 Jet Powerful opportunity agrees with independent enumeration',()=>{
  const r=directMegaJetOpportunity();
  assert.equal(r.denominator,'916872253440');
  assert.equal(r.allRequired,'917906032');
  assert.ok(Math.abs(r.completeResourceProbability-0.0010011275055561136)<1e-14);
  assert.ok(Math.abs(r.openingReadinessProbability-0.025119084908056)<1e-14);
});
test('frozen source has exactly two Buneary Mega Jet and one Powerful',()=>{
  const rank15=source.decks.find(d=>d.rank===15);
  assert.ok(rank15);
  const count=name=>rank15.cards.filter(c=>c.name===name)
    .reduce((n,c)=>n+c.count,0);
  assert.equal(rank15.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(count('Buneary'),2);
  assert.equal(count('Mega Lopunny ex'),2);
  assert.equal(count('Jet Energy'),2);
  assert.equal(count('Powerful Colorless Energy'),1);
  assert.equal(rank15.cards.filter(c=>c.category==='Pokémon'
    && ['Buneary','Oddish','Pidgey','Bunnelby','Fan Rotom','Budew','Eldegoss V','Tatsugiri'].includes(c.name))
    .reduce((n,c)=>n+c.count,0),14);
});
