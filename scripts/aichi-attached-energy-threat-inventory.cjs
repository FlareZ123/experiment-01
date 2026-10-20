'use strict';
const fs=require('node:fs');
const path=require('node:path');

/**
 * Printed Trainer inventory only. A copy is a possible opportunity, never a
 * guaranteed successful Energy loss; costs, turn quota, target type and chance
 * must be paid/checked during a real match. Deliberately exclude attacks and
 * Abilities, and do not add potential VS Seeker/Lusamine reuse to raw copies.
 * @type {Readonly<Record<string,{channel:string,gate:string}>>}
 */
const THREATS=Object.freeze({
  'Plumeria':{channel:'any-attached',gate:'Supporter; discard two own hand cards'},
  'Team Flare Grunt':{channel:'active-attached',gate:'Supporter; opposing Active has Energy'},
  'Crushing Hammer':{channel:'any-attached-coin',gate:'Item; heads; eligible Energy'},
  'Enhanced Hammer':{channel:'special-attached',gate:'Item; opposing Special Energy'},
  'Faba':{channel:'special-attached-or-other',gate:'Supporter; choose Special Energy, Tool or Stadium'}
});
const REUSERS=Object.freeze({
  'VS Seeker':'Item; put a Supporter from discard into hand',
  'Lusamine':'Supporter; return Supporter/Stadium cards from discard'
});

/** @param {{cards:Array<{category:string,name:string,count:number}>,rank:number,archetype:string}} deck */
function sourceThreatInventory(deck){
  if(deck.cards.reduce((n,c)=>n+c.count,0)!==60)
    throw new Error('Source rank '+deck.rank+' is not a complete 60');
  const copies=name=>deck.cards
    .filter(c=>c.category==='Trainer'&&c.name===name)
    .reduce((n,c)=>n+c.count,0);
  const trainerCopies={};
  for(const name of Object.keys(THREATS))trainerCopies[name]=copies(name);
  const recursion={};
  for(const name of Object.keys(REUSERS))recursion[name]=copies(name);
  const directSupporterAttached=trainerCopies.Plumeria+
    trainerCopies['Team Flare Grunt'];
  const specialEnergyRemoval=trainerCopies['Enhanced Hammer']+trainerCopies.Faba;
  const probabilisticAttached=trainerCopies['Crushing Hammer'];
  return {
    rank:deck.rank,archetype:deck.archetype,
    directSupporterAttached,specialEnergyRemoval,probabilisticAttached,
    recursion,trainerCopies,
    boundedScope:'Listed printed Trainer copies, no success rate or attacks/Abilities'
  };
}

/**
 * @param {{decks:Array}} roster Exact published source field.
 * @returns {object} Unconditional inventory, keeping unreported ranks missing.
 */
function auditField(roster){
  if(!Array.isArray(roster?.decks))throw new TypeError('Expected published decks');
  const rows=roster.decks.map(sourceThreatInventory).sort((a,b)=>a.rank-b.rank);
  const highDenial=rows.filter(row=>row.directSupporterAttached>=6)
    .map(row=>row.rank);
  return {
    schema:'aichi-published-trainer-energy-threat-inventory-v1',
    publishedOpponents:rows.length,
    missingOpponents:[23,25,28].filter(rank=>!rows.some(r=>r.rank===rank)),
    highDirectSupporterCopiesRanks:highDenial,
    highDirectSupporterCopiesCount:highDenial.length,
    totalDirectSupporterCopies:rows.reduce((n,r)=>n+r.directSupporterAttached,0),
    totalCoinItemCopies:rows.reduce((n,r)=>n+r.probabilisticAttached,0),
    totalSpecialRemovalCopies:rows.reduce((n,r)=>n+r.specialEnergyRemoval,0),
    rows,
    excluded:'All source attack/Ability disruption; feasibility, Prize placement, actual hand access, Supporter-turn contention, target timing and bot competence',
    performanceQualified:false
  };
}

/** @param {{entries:Array<{name_en:string,type:string,count:number}>}} candidate */
function candidateEnergyBudget(candidate){
  const energy=candidate.entries.filter(e=>e.type==='Energy');
  const basic=energy.filter(e=>e.name_en==='Basic Psychic Energy')
    .reduce((n,e)=>n+e.count,0);
  const special=energy.filter(e=>e.name_en==='Telepathic Psychic Energy')
    .reduce((n,e)=>n+e.count,0);
  const other=energy.reduce((n,e)=>n+e.count,0)-basic-special;
  return {basicPsychic:basic,telepathicPsychic:special,other,
    total:basic+special+other,
    powerglassCopies:candidate.entries.filter(e=>
      e.name_en==='Powerglass').reduce((n,e)=>n+e.count,0),
    reminder:'Powerglass attaches only Basic Energy from discard at end of an eligible Active turn; this recycles an Energy card and cannot ensure survival through the opponent next turn'};
}

function run(){
  const root=path.resolve(__dirname,'..');
  const roster=JSON.parse(fs.readFileSync(
    path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
  const candidate=JSON.parse(fs.readFileSync(
    path.join(root,'results/als/new-moon-lockbreak-english-proxy-60.json'),'utf8'));
  const report=auditField(roster);
  if(report.publishedOpponents!==29)throw new Error('Expected 29 published 60s');
  report.candidate=candidateEnergyBudget(candidate);
  return report;
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={THREATS,REUSERS,sourceThreatInventory,
  auditField,candidateEnergyBudget,run};
