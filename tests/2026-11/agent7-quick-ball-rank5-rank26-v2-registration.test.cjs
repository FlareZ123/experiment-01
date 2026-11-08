'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const plan=require(
  '../../results/aichi-2026/registrations/agent7-quick-ball-deadvip-rank5-rank26-20261108-v2.json');
const roster=require('../../results/aichi-2026/full-decklists.json');
test('four original 60-card source arms use two fixed prospective seeds and both seats',()=>{
  assert.equal(plan.status,'FROZEN_BEFORE_EXECUTION');
  assert.deepEqual(plan.sourceRanks,[5,26]);
  assert.equal(plan.trials.length,4);
  assert.equal(new Set(plan.trials.map(x=>x.id)).size,4);
  for(const rank of [5,26]){
    const deck=roster.decks.find(x=>x.rank===rank);
    assert.ok(deck);
    assert.equal(deck.cards.reduce((n,x)=>n+x.count,0),60);
    assert.ok(deck.cards.some(x=>x.name==='Quick Ball'));
    assert.ok(deck.cards.some(x=>x.name==='Battle VIP Pass'));
    const arms=plan.trials.filter(x=>x.rank===rank);
    assert.deepEqual(arms.map(x=>x.candidateSlot),['A','B']);
    assert.equal(arms[0].seed,arms[1].seed);
    assert.equal(arms[0].candidateId,'champion-reference');
  }
});
