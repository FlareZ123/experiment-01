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


/**
 * More realistic source-owned going-FIRST first-turn Ranger prefetch:
 * one non-Lele Basic in initial seven is chosen as Active. Source's
 * first eight (opening seven plus T1 draw) then may have (1) Ranger
 * directly, (2) Lele already held + unprized Ranger searchable by
 * benching Lele and Wonder Tag, or (3) one Quick Ball/Mysterious
 * Treasure held with both Lele and Ranger unprized in deck, Item
 * discards a physical spare card, retrieves Lele, then Wonder Tag
 * retrieves Ranger to hand for source's T2 Supporter.
 * Items are source legal on going-first first turn; opponent ADP cannot
 * yet have used GX; no source T1 Supporter play is attempted.
 * This is optional source action ACCESS, not played attack/counter rate.
 *
 * @param {number} basicPokemon
 * @param {number} leleCopies
 * @param {number} tutorCopies
 * @returns {{held:number,lele:number,tutor:number,combined:number}}
 */
function prefetchRanger(basicPokemon,leleCopies,tutorCopies){
  const n=[1,leleCopies,tutorCopies,basicPokemon-leleCopies,
    60-(1+tutorCopies+basicPokemon)];
  const seen=Array(4).fill(0),den=choose(60,8),pDen=choose(52,6);
  const result={held:0,lele:0,tutor:0,combined:0};
  /** @param {number} i @param {number} left @param {number} ways */
  function enumeration(i,left,ways){
    if(i<4){
      for(let x=0;x<=Math.min(left,n[i]);x++){
        seen[i]=x;
        enumeration(i+1,left-x,ways*choose(n[i],x));
      }
      return;
    }
    if(left<0||left>n[4])return;
    const [ranger,lele,tutor,otherBasics]=seen;
    if(!otherBasics)return;
    // Require one non-Lele Basic among *initial seven*, not the draw.
    const mass=ways*choose(n[4],left)/den*
      (otherBasics===1?7/8:1);
    let key,possible;
    if(ranger){
      key='held';possible=1;
    }else if(lele){
      key='lele';possible=46/52; // singleton Ranger unprized
    }else if(tutor){
      key='tutor';
      const l=leleCopies-lele;
      possible=1-
        choose(52-l,6-l)/pDen-choose(51,5)/pDen+
        choose(51-l,5-l)/pDen;
    }else return;
    const p=mass*possible;
    result[key]+=p;
    result.combined+=p;
  }
  enumeration(0,8,1);
  const pLegal=1-choose(60-basicPokemon,7)/choose(60,7);
  return Object.fromEntries(Object.entries(result)
    .map(([k,v])=>[k,v/pLegal]));
}

const originalRangerConnector={
  4:{basics:13,lele:1,tutors:4,combined:0.47141143285293424},
  18:{basics:16,lele:2,tutors:7,combined:0.6668724867228175},
  32:{basics:13,lele:1,tutors:7,combined:0.5915923350975525}
};
for(const [rankKey,ref] of Object.entries(originalRangerConnector)){
  const rank=Number(rankKey),source=original.decks.find(d=>d.rank===rank);
  const lele=copies(source,'Tapu Lele-GX');
  const tutors=copies(source,'Quick Ball')+copies(source,'Mysterious Treasure');
  assert.equal(lele,ref.lele);
  assert.equal(tutors,ref.tutors);
  const value=prefetchRanger(ref.basics,lele,tutors);
  assert.ok(Math.abs(value.combined-ref.combined)<1e-12,'prefetch '+rank);
  console.log('PREFETCH-ANTI-ADP',rank,
    'Ranger held '+(100*value.held).toFixed(8)+'%',
    'Lele held '+(100*value.lele).toFixed(8)+'%',
    'Item->Lele '+(100*value.tutor).toFixed(8)+'%',
    'TOTAL '+(100*value.combined).toFixed(8)+'%');
}

console.log('PASS: 5 singleton Pokemon Ranger counters, paper card exact',
  'printing STS104, 3 missing original source lists left unassigned.');
module.exports={census,copies,prefetchRanger};
