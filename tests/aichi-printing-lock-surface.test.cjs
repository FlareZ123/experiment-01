'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const source=require('../results/aichi-2026/full-decklists.json');
const {RESPONSES,GROUPS,countPrintings,analyse}=
 require('../scripts/aichi-printing-lock-surface.cjs');

test('exact 29-source response counts and coverage',()=>{
 const data=analyse(source);
 assert.equal(data.published,29);
 assert.deepEqual(data.missing,[23,25,28]);
 assert.equal(data.knownLockDecks,24);
 const expected={
  fieldBlower:[9,11],lostVacuum:[1,1],pokemonRanger:[5,5],
  stealthyHood:[4,7],cancelingCologne:[2,2],escapeRope:[7,11]
 };
 for(const [name,[decks,copies]] of Object.entries(expected)){
  assert.equal(data.responses[name].decks,decks,name);
  assert.equal(data.responses[name].copies,copies,name);
 }
 assert.deepEqual(data.groups.itemToolRemoval.ranks,
  [1,5,7,8,19,22,29,30,31]);
 assert.equal(data.groups.anySelectedResponse.decks,19);
 assert.equal(data.groups.attackEffectReset.decks,5);
 assert.equal(data.groups.shieldTool.decks,4);
 assert.equal(data.groups.activeNullifier.decks,2);
 assert.equal(data.groups.bilateralActiveSwitch.decks,7);
 assert.equal(data.rows.length,29);
});

test('single canonical lock audit is reused without name-only conflation',()=>{
 const data=analyse(source);
 const rank=new Map(data.rows.map(row=>[row.rank,row]));
 const v15=rank.get(15).locks.filter(row=>row.name==='Vileplume');
 assert.deepEqual(v15.map(row=>[row.print,row.copies]),
  [['AOR/3',2],['BUS/6',1]]);
 const g16=rank.get(16).locks.filter(row=>row.name==='Garbodor');
 assert.deepEqual(g16.map(row=>[row.print,row.copies]),
  [['LTR/68',2],['BKP/57',1]]);
 assert.deepEqual(rank.get(5).counts,
  {fieldBlower:1,lostVacuum:1,pokemonRanger:1,
   stealthyHood:0,cancelingCologne:0,escapeRope:1});
 assert.equal(rank.get(22).counts.lostVacuum,0);
});

test('response count is exact-print and rejects unrelated same-name copy',()=>{
 const toy={cards:[
  {name:'Field Blower',count:1,printing:{set:'GRI',number:'125'}},
  {name:'Field Blower',count:2,printing:{set:'GRI',number:'163'}},
  {name:'Lost Vacuum',count:1,printing:{set:'LOR',number:'162'}},
  {name:'Lost Vacuum',count:1,printing:{set:'LOR',number:'217'}}
 ]};
 assert.equal(countPrintings(toy,RESPONSES.fieldBlower),1);
 assert.equal(countPrintings(toy,RESPONSES.lostVacuum),1);
 assert.equal(Object.keys(GROUPS).length,6);
});
