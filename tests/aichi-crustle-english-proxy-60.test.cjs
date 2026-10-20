'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
test('exploratory fixed 60 keeps all quantities and known printing identities',()=>{
 const list=JSON.parse(fs.readFileSync(path.join(root,'results/als/crustle-immunity-walls-english-proxy-60.json'),'utf8'));
 assert.equal(list.cards.reduce((n,c)=>n+c.count,0),60);
 for(const entry of list.cards){
  const set=entry.id.split('-')[0];
  const cards=JSON.parse(fs.readFileSync(path.join(root,'resources/cards/en',set+'.json'),'utf8'));
  const selected=cards.find(c=>c.id===entry.id);
  assert.ok(selected);
  assert.equal(selected.name,entry.name);
  assert.equal(selected.legalities?.expanded,'Legal');
 }
});
