'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

test('rank15 exact source name and playable native ID resolution are separately visible',()=>{
  const original=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const deck=original.decks.find(x=>x.rank===15);
  assert.ok(deck);
  assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
  const manager=initializeCards();
  const plan=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const opponent=plan.opponents.find(x=>x.rank===15);
  assert.ok(opponent);
  const exactNames=['Buneary','Mega Lopunny ex'];
  const inventory=exactNames.map(name=>{
    const source=deck.cards.filter(c=>c.name===name);
    const resolved=manager.getAllCards().filter(c=>
      c.name===name && c.set==='PFL').map(c=>({
        fullName:c.fullName,set:c.set,setNumber:c.setNumber
      }));
    const lookup=manager.getCardByName(name+' PFL');
    return {name,source,available:resolved,
      shortIdLookup:lookup?.fullName??null,
      unresolved:(opponent.unresolved??[]).filter(x=>x.name===name),
      substitution:(opponent.substitutions??[]).filter(x=>x.sourceName===name)
    };
  });
  console.log('RANK15_PINNED_PRINTING_PARITY',JSON.stringify({
    rank:15,status:opponent.status,
    resolvedNativeCards:opponent.cards?.length??0,inventory
  }));
  if(opponent.status==='ready'){
    assert.equal(opponent.cards?.length,60);
    for(const row of inventory){
      assert.ok(row.available.length>0,
        'A supposedly ready source must have native card(s) for '+row.name);
      assert.equal(row.unresolved.length,0);
    }
  }else{
    assert.equal(opponent.cards,null);
    assert.ok(opponent.unresolved.length>0);
  }
});
