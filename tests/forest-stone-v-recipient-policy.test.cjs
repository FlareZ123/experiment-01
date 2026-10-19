'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {selectStoneRecipient,FSS} =
  require('../simulation/twinleaf/forest-stone-v-recipient-policy.cjs');
const enums={toolType:42,vTags:[3,4,5,6],ownerPlayerType:10};
const stone={fullName:FSS,trainerType:42};
const basicTool={fullName:'Powerglass SFA',trainerType:42};
const p=(name,tags=[],toolCount=0)=>({fullName:name,tags,slot:{tools:Array(toolCount).fill(basicTool)}});
const make=(cards,mons,usedVSTAR=false)=>({
  hand:{cards},usedVSTAR,
  forEachPokemon(playerType,callback) {
    assert.equal(playerType,10);
    mons.forEach((m,index)=>callback(m.slot,m,{player:10,slot:index?2:1,index:index-1}));
  }
});

test('Stone is preserved when only Pokémon ex is on board',()=>{
  const d=selectStoneRecipient(make([stone],[p('Latias ex SSP', [7])]),enums);
  assert.deepEqual(d,{kind:'hold',reason:'no-free-v-recipient'});
});

test('eligible untooled Pokémon V is chosen over an ex',()=>{
  const d=selectStoneRecipient(make([stone],[p('Latias ex SSP',[7]),p('Galarian Articuno V CRE',[3])]),enums);
  assert.equal(d.kind,'attach');
  assert.equal(d.recipient,'Galarian Articuno V CRE');
  assert.equal(d.handIndex,0);
  assert.equal(d.target.index,0);
});

test('already-spent VSTAR or Tool-occupied V preserves singleton Stone',()=>{
  assert.equal(selectStoneRecipient(make([stone],[p('Galarian Articuno V CRE',[3])],true),enums).reason,'vstar-already-spent');
  assert.equal(selectStoneRecipient(make([stone],[p('Galarian Articuno V CRE',[3],1)]),enums).reason,'no-free-v-recipient');
});

test('other Tool priorities and an empty Tool hand remain delegated',()=>{
  assert.equal(selectStoneRecipient(make([basicTool,stone],[p('Latias ex SSP',[7])]),enums).kind,'delegate');
  assert.equal(selectStoneRecipient(make([],[p('Galarian Articuno V CRE',[3])]),enums).kind,'delegate');
});

test("owner's VMAX and VSTAR tags qualify, ex does not",()=>{
  const d=selectStoneRecipient(make([stone],[p('Latias ex SSP',[7]),p('Shadow Rider Calyrex VMAX CRE',[5])]),enums);
  assert.equal(d.recipient,'Shadow Rider Calyrex VMAX CRE');
});
