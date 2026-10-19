'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const basic=new Set(['Grass Energy','Fire Energy','Water Energy',
  'Lightning Energy','Psychic Energy','Fighting Energy',
  'Darkness Energy','Metal Energy','Fairy Energy']);

/**
 * Classify printed Energy counts in one exact 60.
 * @param {{rank:number,archetype:string,cards:object[]}} deck
 * @returns {object}
 */
function classify(deck){
  assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
  const cards=deck.cards.filter(c=>c.category==='Energy');
  const basicCount=cards.filter(c=>basic.has(c.name))
    .reduce((n,c)=>n+c.count,0);
  const special=cards.filter(c=>!basic.has(c.name));
  const specialCount=special.reduce((n,c)=>n+c.count,0);
  return {rank:deck.rank,archetype:deck.archetype,
    basicCount,specialCount,
    onlySpecial:basicCount===0&&specialCount>0,
    specialNames:special.map(c=>c.name)};
}

/** @returns {object} */
function run(){
  const input=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const rows=input.decks.map(classify).sort((a,b)=>a.rank-b.rank);
  const ranks=new Set(rows.map(x=>x.rank));
  return {schema:'aichi-2026-source-energy-matrix-v1',
    rosterCount:rows.length,
    missingRanks:Array.from({length:32},(_,i)=>i+1).filter(x=>!ranks.has(x)),
    allSpecialRanks:rows.filter(x=>x.onlySpecial).map(x=>x.rank),
    rows};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={classify,run};
