'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const rank11=require('../results/aichi-2026/full-decklists.json')
  .decks.find(deck=>deck.rank===11);
const {chooseCommonVipBasics}=
  require('../simulation/twinleaf/agent7-common-vip-pass-bridge.cjs');

const BASICS=[
  'Mega Absol ex MEG','Trubbish FST','Oranguru V ASR',
  'Crobat V DAA','Latias ex SSP'
];
const card=fullName=>({fullName});
const slot=fullName=>({
  getPokemonCard:()=>fullName?card(fullName):null
});
const sourceCounts=new Map(rank11.cards.map(row=>[row.name,row.count]));

function ownerAndPrompt(){
  const cards=BASICS.map(card);
  const allowed=new Set(cards);
  const own={active:slot('Mega Absol ex MEG'),
    bench:Array.from({length:5},()=>slot(null))};
  const prompt={cards:{cards},validate:selection=>
    selection.length>0&&selection.length<=2&&
    selection.every(item=>allowed.has(item))&&
    new Set(selection).size===selection.length};
  return {own,prompt,cards};
}

test('every witness Basic is printed in the original rank11 60',()=>{
  assert.equal(rank11.cards.reduce((n,c)=>n+c.count,0),60);
  for(const fullName of BASICS){
    const [name]=[
      'Mega Absol ex','Trubbish','Oranguru V','Crobat V','Latias ex'
    ].filter(name=>fullName.startsWith(name+' '));
    assert.ok(name,fullName);
    assert.ok(sourceCounts.get(name)>0,'Original source lacks '+fullName);
  }
});

test('current generic VIP chooser selects two legal unrelated Basics ahead of Trubbish',()=>{
  const {own,prompt,cards}=ownerAndPrompt();
  const selected=chooseCommonVipBasics(own,prompt,{});
  assert.deepEqual(selected.map(c=>c.fullName),
    ['Crobat V DAA','Latias ex SSP']);
  assert.equal(selected.some(c=>c.fullName==='Trubbish FST'),false);
  const intended=[cards.find(c=>c.fullName==='Trubbish FST'),
    cards.find(c=>c.fullName==='Oranguru V ASR')];
  assert.equal(prompt.validate(intended),true,
    'A source-setup-relevant alternative is also legal in this model');
});

test('result can change with source board occupancy; choice is state-dependent',()=>{
  const {own,prompt}=ownerAndPrompt();
  own.bench[0]=slot('Crobat V DAA');
  own.bench[1]=slot('Latias ex SSP');
  const selected=chooseCommonVipBasics(own,prompt,{});
  assert.ok(selected.some(card=>card.fullName==='Trubbish FST'));
  assert.ok(selected.every(card=>prompt.validate([card])));
});
