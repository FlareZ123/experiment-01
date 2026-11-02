'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseSourceCards}=require('../simulation/twinleaf/agent3-rank26-energy-setup.cjs');

/** @param {string} name */
const card=name=>({name,fullName:name+' Test'});

test('owner prompt chooses two Lightning and one Exeggcute',()=>{
  const ownDeck=[card('Bicycle'),card('Exeggcute'),card('Lightning Energy'),
    card('Dowsing Machine'),card('Lightning Energy')];
  const selected=chooseSourceCards(ownDeck,[],3);
  assert.deepEqual(selected.cards.map(c=>c.name),
    ['Lightning Energy','Lightning Energy','Exeggcute']);
  assert.equal(selected.fallback,false);
  assert.equal(selected.lightning,2);
  assert.equal(selected.exeggcute,1);
  assert.equal(selected.cards.every(c=>ownDeck.includes(c)),true);
});
test('owner discard reduces required Energy and Exeggcute quantities',()=>{
  const ownDeck=[card('Lightning Energy'),card('Exeggcute'),
    card('Risky Ruins')];
  const selected=chooseSourceCards(ownDeck,
    [card('Lightning Energy'),card('Exeggcute')],3);
  assert.deepEqual(selected.cards.map(c=>c.name),['Lightning Energy']);
  assert.equal(selected.fallback,false);
});
test('if prized/setup already elsewhere, select legal one-card fallback',()=>{
  const ownDeck=[card('Meloetta ex'),card('Risky Ruins'),card('Bicycle')];
  const selected=chooseSourceCards(ownDeck,
    [card('Lightning Energy'),card('Lightning Energy'),card('Exeggcute')],3);
  assert.deepEqual(selected.cards.map(c=>c.name),['Risky Ruins']);
  assert.equal(selected.fallback,true);
});
test('no deck cards returns empty selection rather than inventing a card',()=>{
  const out=chooseSourceCards([],[],3);
  assert.deepEqual(out.cards,[]);
  assert.equal(out.fallback,true);
});
