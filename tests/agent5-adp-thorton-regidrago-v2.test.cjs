'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const v1=require('../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v1.json');
const v2=require('../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');

const byId=rows=>new Map(rows.map(c=>[c.id,c.count]));
const getCard=id=>{
  const folder=id.split('-')[0];
  const data=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../resources/cards/en',folder+'.json'),'utf8'));
  const card=data.find(c=>c.id===id);
  assert.ok(card,'Missing exact bundled printing '+id);
  return card;
};

test('v2 remains fixed60 with a correctly UTF-8 hashed 27-identity list',()=>{
  assert.equal(v2.cards.length,27);
  assert.equal(v2.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(new Set(v2.cards.map(c=>c.id)).size,27);
  const canonical=v2.cards.map(c=>({count:c.count,id:c.id,name:c.name}));
  assert.equal(createHash('sha256').update(JSON.stringify(canonical))
    .digest('hex'),v2.canonicalCardsSha256);
  assert.equal(v2.competitiveQualifiedGames,0);
});

test('exact v1 to v2 resource swap only removes Quick Ball and Pokégear',()=>{
  const before=byId(v1.cards),after=byId(v2.cards);
  const changes=new Map();
  for(const id of new Set([...before.keys(),...after.keys()])){
    const delta=(after.get(id)??0)-(before.get(id)??0);
    if(delta!==0)changes.set(id,delta);
  }
  assert.deepEqual([...changes].sort(),[
    ['sm2-125',2],['sv1-186',-1],['swsh1-179',-1]
  ].sort());
  assert.equal(after.get('swsh2-154'),1,'Discrete Boss gust remains');
  assert.equal(after.get('sv5-152'),1,'Unique ACE SPEC preserved');
  assert.equal(after.get('xy6-97'),4,'Double Dragon count preserved');
});

test('Field Blower clears both printed Temple and Tool-dependent Garbotoxin',()=>{
  const f=getCard('sm2-125'),temple=getCard('swsh10-155');
  const garbodor=getCard('xy9-57');
  assert.equal(f.name,'Field Blower');
  assert.equal(f.legalities.expanded,'Legal');
  assert.ok(f.subtypes.includes('Item'));
  assert.match(f.rules.join(' '),/up to 2 in any combination of Pokémon Tool cards and Stadium cards/);
  assert.match(temple.rules.join(' '),/All Special Energy attached to Pokémon/);
  assert.match(temple.rules.join(' '),/Colorless Energy and have no other effect/);
  const toxin=garbodor.abilities.find(a=>a.name==='Garbotoxin');
  assert.match(toxin.text,/has a Pokémon Tool card attached/);
});

test('v2 source admission remains unqualified before real two-seat game tests',()=>{
  assert.match(v2.status,/unqualified/);
  assert.match(v2.eventLegalProof,/independent paper-event verification/);
  assert.match(v2.proposedAdvantage,/Thorton Supporter turn/);
  for(const row of v2.cards){
    const c=getCard(row.id);
    assert.equal(c.name,row.name);
    assert.equal(c.legalities.expanded,'Legal');
  }
});
