'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {exactOpening,GROUPS}=require('./radiant-eternatus-opening.cjs');

const root=path.resolve(__dirname,'..');
const source=JSON.parse(fs.readFileSync(path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
const candidate=JSON.parse(fs.readFileSync(path.join(root,'results/aichi-2026/candidate-temple-shadow-rider.json'),'utf8'));
const openingAudit=JSON.parse(fs.readFileSync(path.join(root,'results/aichi-2026/opening-hand-audit.json'),'utf8'));
const champion=source.decks.find(deck=>deck.rank===1);

/** Group a 60-card deck into the shared restricted Radiant route categories. */
function radiantGroups(deck, basics) {
  const count=name=>deck.cards.filter(c=>c.name===name).reduce((s,c)=>s+c.count,0);
  const radiant=count('Radiant Eternatus');
  const search=count('Mysterious Treasure')+count('Quick Ball');
  const heavy=count('Hisuian Heavy Ball');
  const vmax=count('Shadow Rider Calyrex VMAX');
  const other=basics-radiant;
  const rest=60-radiant-search-heavy-vmax-other;
  return [radiant,search,heavy,vmax,other,rest];
}

function compare() {
  const championBasics=openingAudit.decks.find(deck=>deck.rank===1).basic_count_known;
  const candidateBasics=candidate.cards.filter(c=>c.category==='Pokémon' &&
    c.name!=='Shadow Rider Calyrex VMAX').reduce((s,c)=>s+c.count,0);
  const championGroups=radiantGroups(champion,championBasics);
  const candidateGroups=radiantGroups(candidate,candidateBasics);
  if(JSON.stringify(championGroups)!==JSON.stringify(GROUPS)) {
    throw Error('Champion group definition drift');
  }
  return {
    scope:'Direct, restricted opening item routes only; no abilities or decision policies',
    championGroups,candidateGroups,
    baseline:exactOpening(true,championGroups),
    candidate:exactOpening(true,candidateGroups)
  };
}
if(require.main===module)console.log(JSON.stringify(compare(),null,2));
module.exports={compare,radiantGroups};
