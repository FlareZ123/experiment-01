'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {loadTrainerTypes,countPrintedLockExposure}=
  require('../scripts/agent3-jellicent-field-exposure.cjs');
const cards=loadTrainerTypes(path.join(__dirname,'..','resources','cards','en'));

test('event print old Tools classified as Tools, Japanese promo classifications explicit',()=>{
  for(const name of ['Choice Belt','Forest Seal Stone','Technical Machine: Evolution','Palace Belt'])
    assert.equal(cards.get(name),'Pokémon Tool',name);
  for(const name of ['Palace Book','Battle Compressor','Dowsing Machine','Rare Candy'])
    assert.equal(cards.get(name),'Item',name);
  assert.equal(cards.get("Player's Ceremony"),'Stadium');
});
test('pure rank census respects printed quantities and fails unknown Trainer',()=>{
  const manifest={decks:[{rank:11,archetype:'Sample',cards:[
    {category:'Trainer',name:'Battle Compressor',count:2},
    {category:'Trainer',name:'Forest Seal Stone',count:1},
    {category:'Trainer',name:'Guzma',count:4},
    {category:'Pokémon',name:'Jellicent ex',count:2}]}]};
  assert.deepEqual(countPrintedLockExposure(manifest,cards),[{
    rank:11,archetype:'Sample',items:2,tools:1,blocked:3,trainers:7
  }]);
  manifest.decks[0].cards.push({category:'Trainer',name:'Undocumented Trainer',count:1});
  assert.throws(()=>countPrintedLockExposure(manifest,cards),/unclassified/);
});
test('full original Aichi 29-source printed census is 657, with all names classified',()=>{
  const fs=require('node:fs');
  const filename=path.join(__dirname,'..','results','aichi-2026','full-decklists.json');
  const manifest=JSON.parse(fs.readFileSync(filename,'utf8'));
  const rows=countPrintedLockExposure(manifest,cards);
  assert.equal(rows.length,29);
  assert.equal(rows.reduce((n,row)=>n+row.items,0),566);
  assert.equal(rows.reduce((n,row)=>n+row.tools,0),91);
  assert.equal(rows.reduce((n,row)=>n+row.blocked,0),657);
});
