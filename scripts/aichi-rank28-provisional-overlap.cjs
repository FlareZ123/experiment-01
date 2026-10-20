'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

// Unverified visual transcription from the linked research note. Name-only
// comparisons never establish registered Japanese printings or legal play.
const PHOTO=Object.freeze([
  [4,'Regidrago V'],[3,'Regidrago VSTAR'],[1,'Dialga-GX'],
  [1,'Dragapult ex'],[1,'Koraidon ex'],[1,'Hisuian Goodra VSTAR'],
  [1,'Noivern ex'],[1,'Kyurem'],[1,'Latias ex'],[1,'Dedenne-GX'],
  [1,'Tapu Lele-GX'],[1,'Squawkabilly ex'],[1,'Budew'],
  [1,'Marshadow'],[1,'Wobbuffet'],[1,'Battle Compressor'],
  [3,'VS Seeker'],[3,'Mysterious Treasure'],[1,'Quick Ball'],
  [2,'Ultra Ball'],[1,'Hisuian Heavy Ball'],[3,'Battle VIP Pass'],
  [1,'Super Rod'],[1,'Prime Catcher'],[2,'Muscle Band'],
  [2,'Professor Juniper'],[1,"Lillie's Determination"],[1,'Raihan'],
  [1,'Iono'],[1,'Crispin'],[2,'Guzma'],[1,'Marnie'],[1,'Faba'],
  [1,'Path to the Peak'],[1,'Parallel City'],
  [3,'Double Dragon Energy'],[3,'Basic Fire Energy'],[4,'Basic Grass Energy']
]);
const RANKS=Object.freeze([10,12,13,14,18,20,21,27,32]);

/** @param {string} name @param {boolean} groupProfessor @returns {string} */
function key(name,groupProfessor=false){
  assert.equal(typeof name,'string');
  const n=name.replace(/^Basic (?=(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy$)/,'');
  return groupProfessor&&['Professor Juniper','Professor Sycamore',
    "Professor's Research"].includes(n)?"Professor's Research":n;
}

/** @param {Array<[number,string]>} rows @param {boolean} family */
function bag(rows,family=false){
  const m=new Map();
  for(const [copies,name] of rows){
    assert.ok(Number.isSafeInteger(copies)&&copies>0);
    const k=key(name,family);m.set(k,(m.get(k)??0)+copies);
  }
  assert.equal([...m.values()].reduce((a,b)=>a+b,0),60);
  return m;
}

/** @param {Map<string,number>} a @param {Map<string,number>} b */
function overlap(a,b){
  let shared=0;const differences=[];
  for(const k of [...new Set([...a.keys(),...b.keys()])].sort()){
    const photo=a.get(k)??0,published=b.get(k)??0;
    shared+=Math.min(photo,published);
    if(photo!==published)differences.push({name:k,photo,published});
  }
  return {shared,minimumNameSubstitutions:60-shared,differences};
}

/** @returns {object} Provisional bag distances; never a win-rate estimate. */
function compute(){
  const field=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const ranking=RANKS.map(rank=>{
    const deck=field.decks.find(d=>d.rank===rank);
    assert.equal(deck?.archetype,'Regidrago');
    const source=deck.cards.map(c=>[c.count,c.name]);
    return {rank,player:deck.player,
      strictName:overlap(bag(PHOTO),bag(source)),
      groupedProfessor:overlap(bag(PHOTO,true),bag(source,true))};
  }).sort((a,b)=>b.groupedProfessor.shared-a.groupedProfessor.shared||a.rank-b.rank);
  return {schema:'agent8-rank28-provisional-overlap-v1',
    photoLedger:'results/aichi-2026/rank28-replica-pnote-visual-badge-ledger-20261020.md',
    photoCount:60,sourceRanks:RANKS,ranking,
    photoRegistrationAuthenticated:false,competitiveGamesQualified:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(compute(),null,2)+'\n');
module.exports={PHOTO,RANKS,key,bag,overlap,compute};
