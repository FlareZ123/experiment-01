'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {compareMixedPrintings}=
  require('../scripts/aichi-printing-mechanics.cjs');

const field=JSON.parse(fs.readFileSync(path.resolve(__dirname,
  '../results/aichi-2026/full-decklists.json'),'utf8'));

test('all five mixed-printing groups resolve exact published English IDs',()=>{
  const rows=compareMixedPrintings(field);
  assert.equal(rows.length,5);
  assert.deepEqual(rows.map(row=>[row.rank,row.name]),
    [[15,'Pidgeotto'],[15,'Vileplume'],[16,'Garbodor'],
      [22,'Trubbish'],[31,'Dusknoir']]);
  assert.ok(rows.every(row=>row.printings.length===2));
  assert.ok(rows.every(row=>row.printings.every(p=>
    p.expandedFlag==='Legal')));
});

test('distinct Pokémon Abilities survive same-name printing grouping',()=>{
  const rows=compareMixedPrintings(field);
  const find=(rank,name)=>rows.find(x=>x.rank===rank&&x.name===name);
  assert.deepEqual(find(15,'Vileplume').printings.map(p=>
    p.abilities.map(a=>a.name)),[['Irritating Pollen'],['Disgusting Pollen']]);
  assert.deepEqual(find(15,'Pidgeotto').printings.map(p=>
    p.abilities.map(a=>a.name)),[['Air Mail'],[]]);
  assert.deepEqual(find(31,'Dusknoir').printings.map(p=>
    p.abilities.map(a=>a.name)),[['Cursed Blast'],['Sinister Hand']]);
  assert.equal(find(15,'Vileplume').distinctAbilities,true);
  assert.equal(find(15,'Pidgeotto').distinctAbilities,true);
  assert.equal(find(31,'Dusknoir').distinctAbilities,true);
});

test('Garbodor printings share Garbotoxin despite different attacks',()=>{
  const rows=compareMixedPrintings(field);
  const garb=rows.find(x=>x.rank===16&&x.name==='Garbodor');
  assert.equal(garb.distinctAbilities,false);
  assert.equal(garb.distinctAttacks,true);
  assert.deepEqual(garb.printings.map(p=>p.abilities[0].name),
    ['Garbotoxin','Garbotoxin']);
  assert.deepEqual(garb.printings.map(p=>p.attacks[0].name),
    ['Sludge Toss','Offensive Bomb']);
  const trubbish=rows.find(x=>x.rank===22&&x.name==='Trubbish');
  assert.equal(trubbish.distinctAbilities,false);
  assert.equal(trubbish.distinctAttacks,true);
  assert.deepEqual(trubbish.printings.map(p=>p.hp),[70,60]);
});


test('shared LOR PTCGO code selects main set and Gallery by exact number',()=>{
  const field={
    decks:[{rank:1,cards:[
      {name:'Pikachu',count:1,printing:{
        set:'LOR',number:'52',language:'en'}},
      {name:'Pikachu',count:1,printing:{
        set:'LOR',number:'TG05',language:'en'}},
      {name:'Psychic Energy',count:58,printing:{
        set:'MEE',number:'13',language:'en'}}
    ]}],
    missing_full_lists:[]
  };
  const rows=compareMixedPrintings(field);
  assert.equal(rows.length,1);
  assert.deepEqual(rows[0].printings.map(c=>c.cardId),
    ['swsh11-52','swsh11tg-TG05']);
  // Cosmetic alternate printings can share identical game text.
  assert.equal(rows[0].distinctAbilities,false);
  assert.equal(rows[0].distinctAttacks,false);
});
