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

/**
 * Exact direct, no-search, source-going-FIRST Ranger opening hand access
 * by their turn two after a candidate ADP T1 going-second GX. Each source
 * has ONE Ranger (non-Basic). Source saw its initial seven + two natural
 * turn draws (nine total); condition its initial seven to contain a Basic.
 * Basic counts are independently resolved from original printed card
 * subtypes in the supplied cards/en/ full set JSON (including ASC/MEG).
 *
 * @param {number} n @param {number} k @returns {number}
 */
function choose(n,k){
  if(k<0||k>n)return 0;
  let ans=1;
  for(let i=1;i<=Math.min(k,n-k);i++)ans=ans*(n-i+1)/i;
  return Math.round(ans);
}
const nonBasicByRank={
  4:['Electrode-GX','Alolan Raichu'],
  5:['Mew VMAX'],
  7:[],
  18:['Regidrago VSTAR','Dragapult ex','Hisuian Goodra VSTAR'],
  32:['Regidrago VSTAR','Noivern ex','Dragapult ex',
    'Hisuian Goodra VSTAR','Mega Dragonite ex']
};
const directReference={
  4:{basics:13,conditional:0.1439597888982752},
  5:{basics:11,conditional:0.14279109466684775},
  7:{basics:12,conditional:0.1433889227070002},
  18:{basics:16,conditional:0.1455032064555186},
  32:{basics:13,conditional:0.1439597888982752}
};
for(const row of rangerRows){
  const source=original.decks.find(d=>d.rank===row.rank);
  const allPokemon=source.cards.filter(c=>c.category==='Pokémon')
    .reduce((s,c)=>s+c.count,0);
  const nonBasic=source.cards.filter(c=>nonBasicByRank[row.rank]
    .includes(c.name)).reduce((s,c)=>s+c.count,0);
  const B=allPokemon-nonBasic;
  const ref=directReference[row.rank];
  assert.equal(B,ref.basics,'source exact printed Basic count '+row.rank);
  const pLegal=1-choose(60-B,7)/choose(60,7);
  // Ranger in the first-seven opener, plus at least one source Basic
  // in the other six; or Ranger in natural draw 8 or 9, with a Basic
  // already in the actual opening seven.
  const pOpener=7/60*(1-choose(59-B,6)/choose(59,6));
  const pNextTwo=2/60*(1-choose(59-B,7)/choose(59,7));
  const conditional=(pOpener+pNextTwo)/pLegal;
  assert.ok(Math.abs(conditional-ref.conditional)<1e-12);
  console.log('RANGER-OPENER',row.rank,'basic='+B,
    'source T2 natural-nine access, Basic-valid:',
    (100*conditional).toFixed(9)+'%');
}

console.log('PASS: 5 singleton Pokemon Ranger counters, paper card exact',
  'printing STS104, 3 missing original source lists left unassigned.');
module.exports={census,copies};
