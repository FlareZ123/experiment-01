'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * Index printed Trainer subtypes in the repository's complete named card pool.
 * Using card text and set data is more reliable than guessing subtype from
 * a Supporter-looking name. Conflicting subtype labels are reported.
 * @param {string} cardsDirectory
 * @returns {{trainers:Map<string,Set<string>>, conflicting:string[]}}
 */
function trainerSubtypes(cardsDirectory) {
  const trainers = new Map();
  for(const name of fs.readdirSync(cardsDirectory).filter(n=>n.endsWith('.json')).sort()) {
    const cards=JSON.parse(fs.readFileSync(path.join(cardsDirectory,name),'utf8'));
    for(const card of cards) {
      if(card.supertype!=='Trainer') continue;
      const subs=card.subtypes || [];
      if(!trainers.has(card.name)) trainers.set(card.name,new Set());
      for(const type of subs) trainers.get(card.name).add(type);
    }
  }
  const conflicting=[...trainers].filter(([,types])=>
    types.has('Supporter') && types.size!==1).map(([name])=>name).sort();
  return {trainers,conflicting};
}

/**
 * Count real registered Supporter copies among known exact printed source 60s.
 * This is a deck-composition census, never an estimate of Supporter availability
 * or the fraction of legal Supporter plays during games.
 * @param {object} manifest Aichi full-decklists.json object.
 * @param {Map<string,Set<string>>} knownTrainerSubtypes
 * @returns {object}
 */
function supporterCensus(manifest,knownTrainerSubtypes) {
  const unknown=new Set();
  const rows=manifest.decks.map(deck=>{
    let supporterCopies=0;
    let distinctSupporterNames=0;
    let vsSeekerCopies=0;
    let trainerCopies=0;
    let cards=0;
    for(const item of deck.cards) {
      cards+=item.count;
      if(item.name==='VS Seeker') vsSeekerCopies+=item.count;
      if(item.category!=='Trainer') continue;
      trainerCopies+=item.count;
      const types=knownTrainerSubtypes.get(item.name);
      if(!types) {
        unknown.add(item.name);
        continue;
      }
      if(types.has('Supporter')) {
        supporterCopies+=item.count;
        distinctSupporterNames++;
      }
    }
    return {
      rank:deck.rank,archetype:deck.archetype,
      printedCards:cards,supporterCopies,distinctSupporterNames,
      trainerCopies,vsSeekerCopies
    };
  }).sort((a,b)=>a.rank-b.rank);
  const totalSupporterCopies=rows.reduce((sum,row)=>sum+row.supporterCopies,0);
  const totalPrintedCards=rows.reduce((sum,row)=>sum+row.printedCards,0);
  const sorted=rows.map(row=>row.supporterCopies).sort((a,b)=>a-b);
  return {
    schema:'aichi-published-source-supporter-copy-census-v1',
    source:'results/aichi-2026/full-decklists.json + resources/cards/en/',
    scope:'Printed source 60s only; three unpublished ranks remain excluded',
    sourceDeckCount:rows.length, missingFullLists:manifest.missing_full_lists,
    classificationComplete:unknown.size===0,
    unknownTrainerNames:[...unknown].sort(),
    totalPrintedCards,totalSupporterCopies,
    supporterPercentOfRegisteredCards:100*totalSupporterCopies/totalPrintedCards,
    meanSupporterCopies:totalSupporterCopies/rows.length,
    medianSupporterCopies:sorted[Math.floor(sorted.length/2)],
    deckCountWithSupporter:rows.filter(row=>row.supporterCopies>0).length,
    deckCountWithAtLeastFour:rows.filter(row=>row.supporterCopies>=4).length,
    deckCountWithAtLeastEight:rows.filter(row=>row.supporterCopies>=8).length,
    totalVSSeekerCopies:rows.reduce((sum,row)=>sum+row.vsSeekerCopies,0),
    competitivelyQualifiedGames:0,
    rows
  };
}

/** @returns {object} */
function run() {
  const manifest=require('../results/aichi-2026/full-decklists.json');
  const types=trainerSubtypes(path.resolve(__dirname,'../resources/cards/en'));
  const report=supporterCensus(manifest,types.trainers);
  report.conflictingTrainerSubtypeNames=types.conflicting;
  return report;
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={trainerSubtypes,supporterCensus,run};
