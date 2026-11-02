'use strict';

/**
 * Agent30: source-printed counter-exposure census for original authenticated
 * Aichi 2026 Top32 lists. Card presence is NOT card reachability or a win.
 * No archetype substitutions are ever assigned to missing ranks 23/25/28.
 */
const assert=require('node:assert/strict');
const original=require('../results/aichi-2026/full-decklists.json');

const exposureNames=[
  'Pokémon Ranger','Temple of Sinnoh','Enhanced Hammer','Plumeria',
  'Team Flare Grunt','Faba'
];
/** @param {object} deck @param {string} name @returns {number} */
function copies(deck,name){
  return deck.cards.filter(c=>c.name===name).reduce((s,c)=>s+c.count,0);
}
/** @returns {Array<object>} */
function census() {
  assert.equal(original.decks.length,29);
  const ranks=new Set(original.decks.map(d=>d.rank));
  assert.equal(ranks.size,29);
  for(const rank of [23,25,28])assert.ok(!ranks.has(rank));
  const rows=original.decks.map(deck=>{
    assert.equal(deck.cards.reduce((s,c)=>s+c.count,0),60);
    const exposure=Object.fromEntries(exposureNames.map(n=>[n,copies(deck,n)]));
    const rangerPrinting=deck.cards.filter(c=>c.name==='Pokémon Ranger')
      .map(c=>({count:c.count,printing:c.printing}));
    return {rank:deck.rank,player:deck.player,archetype:deck.archetype,
      exposure,rangerPrinting,
      vsSeeker:copies(deck,'VS Seeker'),
      tapuLele:copies(deck,'Tapu Lele-GX')};
  });
  return rows.sort((a,b)=>a.rank-b.rank);
}

const rows=census();
const ranksWith=name=>rows.filter(r=>r.exposure[name]>0)
  .map(r=>r.rank);
const expected={
  'Pokémon Ranger':[4,5,7,18,32],
  'Temple of Sinnoh':[3,8,11,16,22],
  'Enhanced Hammer':[3,5,6,7,22,24,29],
  'Plumeria':[2,3,6,7,9,16,24,29],
  'Team Flare Grunt':[3,6,7,24,29],
  'Faba':[2,3,6,7,10,24,29]
};
for(const [name,ranks] of Object.entries(expected)){
  assert.deepEqual(ranksWith(name),ranks,name+' original positions');
  console.log(name,ranks.join(','));
}
const rangerRows=rows.filter(r=>r.exposure['Pokémon Ranger']>0);
for(const row of rangerRows) {
  assert.equal(row.exposure['Pokémon Ranger'],1);
  assert.deepEqual(row.rangerPrinting,
    [{count:1,printing:{set:'STS',number:'104',language:'en'}}]);
  console.log('RANGER',row.rank,row.archetype,
    'VS Seeker:',row.vsSeeker,
    'Tapu Lele-GX:',row.tapuLele);
}
const any=rows.filter(row=>exposureNames
  .some(name=>row.exposure[name]>0)).map(row=>row.rank);
assert.deepEqual(any,[2,3,4,5,6,7,8,9,10,11,16,18,22,24,29,32]);
console.log('Union of named Ranger/Energy-denial source texts:',any.length,
  'of 29 verified original sixties.');
console.log('PASS: 5 singleton Pokemon Ranger counters, paper card exact',
  'printing STS104, 3 missing original source lists left unassigned.');
module.exports={census,copies};
