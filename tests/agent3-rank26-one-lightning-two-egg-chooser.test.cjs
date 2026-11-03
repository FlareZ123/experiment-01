'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  chooseSourceCards,
  chooseSourceCardsOneLightningTwoEggs:choose
}=require('../simulation/twinleaf/agent3-rank26-energy-setup.cjs');

/** @param {string[]} names */
function cards(names){
  return names.map((name,index)=>({id:index+1,name}));
}

test('paper one-Lightning policy chooses both actual Exeggcute identities',()=>{
  const deck=cards([
    'Battle Compressor','Lightning Energy','Exeggcute','Risky Ruins',
    'Lightning Energy','Exeggcute','Meloetta ex'
  ]);
  const res=choose(deck,[],3);
  assert.deepEqual(res.cards.map(x=>x.name),
    ['Lightning Energy','Exeggcute','Exeggcute']);
  assert.equal(new Set(res.cards).size,3);
  assert.deepEqual(res.cards.map(x=>x.id),[2,3,6]);
  assert.equal(res.lightning,1);
  assert.equal(res.exeggcute,2);
  assert.equal(res.fallback,false);
});

test('historical two-Lightning chooser stays unchanged',()=>{
  const deck=cards(['Lightning Energy','Exeggcute',
    'Lightning Energy','Exeggcute']);
  assert.deepEqual(chooseSourceCards(deck,[],3).cards.map(x=>x.name),
    ['Lightning Energy','Lightning Energy','Exeggcute']);
  assert.deepEqual(choose(deck,[],3).cards.map(x=>x.name),
    ['Lightning Energy','Exeggcute','Exeggcute']);
});

test('one Lightning already in discard leaves slots for Eggs',()=>{
  const deck=cards(['Lightning Energy','Exeggcute','Exeggcute']);
  const discard=cards(['Lightning Energy']);
  assert.deepEqual(choose(deck,discard,3).cards.map(x=>x.name),
    ['Exeggcute','Exeggcute']);
});

test('already-discarded Egg is not needlessly duplicated',()=>{
  const deck=cards(['Lightning Energy','Exeggcute','Exeggcute']);
  const discard=cards(['Exeggcute']);
  assert.deepEqual(choose(deck,discard,3).cards.map(x=>x.name),
    ['Lightning Energy','Exeggcute']);
});

test('native maximum two selects legal two-card subset',()=>{
  const deck=cards(['Lightning Energy','Exeggcute','Exeggcute']);
  assert.deepEqual(choose(deck,[],2).cards.map(x=>x.name),
    ['Lightning Energy','Exeggcute']);
});

test('no needed resource selects a single cheap fallback, preserving singleton attackers',()=>{
  const deck=cards(['Meloetta ex','Risky Ruins','Battle Compressor']);
  const discard=cards(['Lightning Energy','Exeggcute','Exeggcute']);
  const res=choose(deck,discard,3);
  assert.equal(res.cards.length,1);
  assert.equal(res.cards[0].name,'Risky Ruins');
  assert.equal(res.fallback,true);
});

test('empty source deck cannot produce any targets',()=>{
  assert.deepEqual(choose([],[],3).cards,[]);
});
