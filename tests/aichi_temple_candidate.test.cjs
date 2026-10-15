'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const field=require('../results/aichi-2026/full-decklists.json');
const candidate=require('../results/aichi-2026/candidate-temple-shadow-rider.json');
const {auditCandidate}=require('../scripts/candidate-mirror-gate.cjs');

test('fixed candidate is source-distinct and 60 cards',()=>{
  assert.equal(candidate.cards.reduce((s,c)=>s+c.count,0),60);
  assert.deepEqual(candidate.category_counts,{'Pokémon':18,Trainer:31,Energy:11});
  const report=auditCandidate(candidate,field);
  assert.deepEqual(report.exactSourceMirrorRanks,[]);
  assert.deepEqual(report.unpublishedRanks,[23,25,28]);
  const count=name=>candidate.cards.filter(c=>c.name===name).reduce((s,c)=>s+c.count,0);
  assert.equal(count('Shadow Rider Calyrex V'),4);
  assert.equal(count('Shadow Rider Calyrex VMAX'),3);
  assert.equal(count('Temple of Sinnoh'),2);
  assert.equal(count('Wobbuffet'),1);
  assert.equal(count('Pokémon Ranger'),1);
});

test('all exact candidate printings appear in the event source',()=>{
  const ids=new Set(field.decks.flatMap(d=>d.cards.map(c=>
    [c.name,c.printing.set,String(c.printing.number)].join('|'))));
  for(const c of candidate.cards) {
    assert.ok(ids.has([c.name,c.printing.set,String(c.printing.number)].join('|')),c.name);
    assert.ok(c.count>=1 && (c.count<=4 || c.name==='Psychic Energy'));
  }
});
