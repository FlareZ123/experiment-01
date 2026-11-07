'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const original=require('../results/aichi-2026/full-decklists.json');

function sourceRanksWithAll(names){
  assert.ok(Array.isArray(names)&&names.length>0);
  return original.decks
    .filter(deck=>names.every(name=>deck.cards.some(
      card=>card.name===name&&card.count>=1)))
    .map(deck=>deck.rank).sort((a,b)=>a-b);
}

test('29 original printed 60s have no complete staged Box to Unown recovery route',()=>{
  assert.equal(original.decks.length,29);
  assert.deepEqual(sourceRanksWithAll(['Secret Box']),
    [4,5,8,9,11,16,17,19,22,30]);
  assert.deepEqual(sourceRanksWithAll(['Unown']),[9,17,26,30,31]);
  assert.deepEqual(sourceRanksWithAll(['Night Stretcher']),[1,3,8,19,22]);
  assert.deepEqual(sourceRanksWithAll(['Secret Box','Night Stretcher']),
    [8,19,22]);
  assert.deepEqual(sourceRanksWithAll(
    ['Secret Box','Night Stretcher','Unown']),[]);
  assert.deepEqual(sourceRanksWithAll(
    ['Secret Box','Energy Retrieval','Unown']),[]);
  assert.deepEqual(sourceRanksWithAll(
    ['Secret Box','Fog Crystal','Unown']),[]);
});

test('source deck-specific alternative channels remain distinct',()=>{
  assert.deepEqual(sourceRanksWithAll(
    ['Secret Box','Unown','Rescue Carrier']),[9,17,30]);
  assert.deepEqual(sourceRanksWithAll(['Fog Crystal','Unown']),[31]);
  assert.deepEqual(sourceRanksWithAll(['Secret Box','Night Stretcher',
    'Battle VIP Pass']),[8,19,22]);
  for(const rank of [8,19,22]){
    const deck=original.decks.find(x=>x.rank===rank);
    assert.equal(deck.cards.filter(x=>x.name==='Rescue Carrier')
      .reduce((s,x)=>s+x.count,0),0);
  }
  const unknown=[23,25,28];
  assert.deepEqual(unknown.filter(rank=>
    original.decks.some(x=>x.rank===rank)),[]);
});
