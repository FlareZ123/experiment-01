'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const source=path.join(root,
  'results/als/agent2-archie-baxcalibur-umi2026-english-proxy-60.json');

/** @typedef {{count:number,name:string,id:string,category:string}} ProxyCard */
/**
 * Load an actual English card printing from the supplied bundled database.
 * @param {ProxyCard} entry
 * @returns {object}
 */
function printedCard(entry){
  const set=entry.id.split('-')[0];
  const cards=JSON.parse(fs.readFileSync(path.join(root,
    'resources/cards/en',set+'.json'),'utf8'));
  return cards.find(card=>card.id===entry.id);
}

test('January Umi predecessor is a fixed 60 with real Expanded-flagged English prints',()=>{
  const m=JSON.parse(fs.readFileSync(source,'utf8'));
  assert.equal(m.cards.length,33);
  assert.equal(m.cards.reduce((sum,c)=>sum+c.count,0),60);
  for(const category of ['Pokémon','Trainer','Energy']){
    const expected={'Pokémon':16,'Trainer':35,'Energy':9}[category];
    assert.equal(m.cards.filter(c=>c.category===category)
      .reduce((sum,c)=>sum+c.count,0),expected);
  }
  for(const entry of m.cards){
    assert.ok(Number.isSafeInteger(entry.count)&&entry.count>0);
    assert.ok(entry.count<=4||entry.name==='Water Energy');
    const selected=printedCard(entry);
    assert.ok(selected,'Missing print '+entry.id);
    assert.equal(selected.name,entry.name,'Name mismatch '+entry.id);
    assert.equal(selected.legalities?.expanded,'Legal',entry.id);
  }
  assert.equal(m.cards.filter(c=>c.name==='Computer Search').length,1);
  assert.equal(m.cards.filter(c=>c.name==='Radiant Greninja').length,1);
});

test('Pidgeot-V/Kyogre printed ALS has authenticated source mechanics',()=>{
  const m=JSON.parse(fs.readFileSync(source,'utf8'));
  const find=name=>printedCard(m.cards.find(c=>c.name===name));
  const kyogre=find('Kyogre');
  const pidgeot=find('Pidgeot V');
  assert.equal(kyogre.attacks.find(x=>x.name==='Aqua Storm')?.text,
    'Discard the top 5 cards of your deck, and then choose 2 of your opponent\'s Benched Pokémon. This attack does 50 damage for each Energy card you discarded in this way to each of those Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.)');
  assert.equal(pidgeot.abilities.find(x=>x.name==='Vanishing Wings')?.text,
    'Once during your turn, if this Pokémon is on your Bench, you may shuffle it and all attached cards into your deck.');
  const fiveDiscardDamage=5*50;
  assert.equal(fiveDiscardDamage,250);
  assert.equal(fiveDiscardDamage+30,280);
  assert.equal(4*50+30,230);
});
