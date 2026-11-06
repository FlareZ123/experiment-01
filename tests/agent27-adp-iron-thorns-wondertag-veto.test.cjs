'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const field=require('../results/aichi-2026/full-decklists.json');
const thornCards=require('../resources/cards/en/sv6.json');
const leleCards=require('../resources/cards/en/sm2.json');
const RANKS=[6,24,29];
test('three source-preregistered four-basic Iron Thorns decks start under Initialization',()=>{
 const thorn=thornCards.find(c=>c.id==='sv6-77');
 const lele=leleCards.find(c=>c.id==='sm2-60');
 assert.equal(thorn.name,'Iron Thorns ex');
 assert.ok(thorn.subtypes.includes('Basic')&&thorn.subtypes.includes('Future'));
 assert.equal(thorn.abilities.find(x=>x.name==='Initialization').text,
  "As long as this Pokémon is in the Active Spot, Pokémon with a Rule Box in play (both yours and your opponent's) have no Abilities, except for Future Pokémon. (Pokémon ex, Pokémon V, etc. have Rule Boxes.)");
 assert.equal(lele.name,'Tapu Lele-GX');
 assert.ok(lele.subtypes.includes('GX')&&!lele.subtypes.includes('Future'));
 assert.match(lele.abilities.find(x=>x.name==='Wonder Tag').text,/from your hand onto your Bench/);
 for(const rank of RANKS){
  const d=field.decks.find(x=>x.rank===rank);
  assert.ok(d,'Authenticated source rank '+rank);
  const pokemon=d.cards.filter(x=>x.category==='Pokémon');
  assert.equal(pokemon.length,1,'All printed source Pokemon same identity rank '+rank);
  assert.equal(pokemon[0].name,'Iron Thorns ex');
  assert.deepEqual(pokemon[0].printing,
   {set:'TWM',number:'77',language:'en'});
  assert.equal(pokemon[0].count,4);
  assert.equal(d.cards.reduce((s,c)=>s+c.count,0),60);
 }
});
