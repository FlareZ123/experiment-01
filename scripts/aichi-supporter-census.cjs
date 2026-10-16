'use strict';
const fs = require('node:fs');
const path = require('node:path');

/** @param {Array<{name:string,trainerType:number}>} trainers */
function indexTypes(trainers) {
  const index = new Map();
  for (const card of trainers) {
    if (!index.has(card.name)) index.set(card.name, new Set());
    index.get(card.name).add(card.trainerType);
  }
  return index;
}

/**
 * @param {object} manifest Published Aichi decks.
 * @param {Map<string,Set<number>>} index Types from concrete engine cards.
 * @param {number} supporterType Pinned TrainerType.SUPPORTER.
 */
function census(manifest, index, supporterType) {
  const rows = manifest.decks.map(deck => {
    const out = {rank:deck.rank,archetype:deck.archetype,
      supporterCopies:0,supporters:[],unclassifiedTrainers:[]};
    for(const c of deck.cards.filter(c=>c.category==='Trainer')) {
      const types = index.get(c.name);
      if (!types || types.size!==1) {
        out.unclassifiedTrainers.push({name:c.name,count:c.count});
      } else if (types.has(supporterType)) {
        out.supporterCopies+=c.count;
        out.supporters.push({name:c.name,count:c.count});
      }
    }
    return out;
  });
  return {publishedDecks:rows.length,
    supporterCopyTotal:rows.reduce((s,r)=>s+r.supporterCopies,0),
    decksWithSupporters:rows.filter(r=>r.supporterCopies>0).length,
    unclassifiedTrainerCopyTotal:rows.reduce((s,r)=>
      s+r.unclassifiedTrainers.reduce((t,c)=>t+c.count,0),0),
    rows};
}

/** Run classification against the pinned compiled Twinleaf and source manifest. */
function fromPinnedEngine() {
  const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
  const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
  const {TrainerCard}=require(path.join(root,'game/store/card/trainer-card'));
  const {TrainerType}=require(path.join(root,'game/store/card/card-types'));
  const known=initializeCards().getAllCards().filter(c=>c instanceof TrainerCard);
  const manifest=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  return {...census(manifest,indexTypes(known),TrainerType.SUPPORTER),
    evidence:'name-level pinned-engine classification of published lists, no play or win probabilities',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05'};
}

if (require.main===module) console.log(JSON.stringify(fromPinnedEngine(),null,2));
module.exports={indexTypes,census,fromPinnedEngine};
