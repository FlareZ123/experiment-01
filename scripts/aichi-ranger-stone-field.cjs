'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {rangerStoneAccess} = require('./aichi-ranger-stone-access.cjs');

const fieldBasics = {
  4: new Set(['Voltorb', 'Pikachu', 'Dedenne-GX', 'Crobat V',
    'Squawkabilly ex', 'Tapu Lele-GX', 'Eldegoss V',
    'Gengar & Mimikyu-GX', 'Klefki', 'Ditto ♢']),
  5: new Set(['Mew V', 'Genesect V', 'Dedenne-GX',
    'Crobat V', "Lillie's Clefairy ex"])
};
const fieldV = {
  4: new Set(['Crobat V','Eldegoss V']),
  5: new Set(['Mew V','Genesect V','Crobat V'])
};

/** @param {{rank:number,cards:Array<{name:string,count:number,category:string}>}} deck */
function fieldSourceProfile(deck) {
  const basicNames=fieldBasics[deck.rank], eligible=fieldV[deck.rank];
  assert.ok(basicNames&&eligible, 'Only verified published ranks 4 and 5');
  const count=(name)=>deck.cards.filter(c=>c.name===name)
    .reduce((s,c)=>s+c.count,0);
  const sum=(filter)=>deck.cards.filter(filter).reduce((s,c)=>s+c.count,0);
  const size=sum(()=>true);
  const basics=sum(c=>c.category==='Pokémon'&&basicNames.has(c.name));
  const eligibleV=sum(c=>c.category==='Pokémon'&&eligible.has(c.name));
  const evolutions=sum(c=>c.category==='Pokémon'&&!basicNames.has(c.name));
  const evolvedNames=new Set(deck.rank===4?['Electrode-GX','Alolan Raichu']:['Mew VMAX']);
  assert.ok(deck.cards.filter(c=>c.category==='Pokémon'&&!basicNames.has(c.name))
    .every(c=>evolvedNames.has(c.name)), 'Unknown Pokémon evolution identity');
  assert.equal(size,60,'Source deck must have exactly 60 cards');
  assert.equal(evolutions,deck.rank===4?5:3,'Expected evolution count');
  assert.equal(basics,deck.rank===4?13:11,'Expected Basic count');
  assert.equal(eligibleV,deck.rank===4?3:9,'Expected eligible Basic V count');
  assert.equal(count('Pokémon Ranger'),1);
  assert.equal(count('Forest Seal Stone'),1);
  return {size,basics,lele:count('Tapu Lele-GX'),shadowV:eligibleV,
    ranger:1,stone:1};
}

/** @returns {object[]} */
function fieldReport() {
  const file=path.resolve(__dirname,'../results/aichi-2026/full-decklists.json');
  const full=JSON.parse(fs.readFileSync(file,'utf8'));
  return [4,5].map(rank=>{
    const deck=full.decks.find(d=>d.rank===rank);
    assert.ok(deck,'Missing published opponent '+rank);
    const profile=fieldSourceProfile(deck);
    return {rank,archetype:deck.archetype,profile,
      windows:[0,1,2].map(draws=>({draws,
        ...rangerStoneAccess(profile,{draws})}))};
  });
}
if(require.main===module)console.log(JSON.stringify(fieldReport(),null,2));
module.exports={fieldSourceProfile,fieldReport};
