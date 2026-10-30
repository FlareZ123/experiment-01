'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');

// Japanese-only event print names absent from the supplied English TCG database.
const JAPANESE_NAME_TYPES=new Map([
  ['Battle Compressor','Item'],
  ['Palace Book','Item'],
  ['Palace Belt','Pokémon Tool'],
  ["Player's Ceremony",'Stadium'],
  ['Thunder Mountain ♢','Stadium'],
  ['Wondrous Labyrinth ♢','Stadium'],
  ['Robo Substitute','Item'],
  ['Target Whistle','Item'],
]);

/** @param {string} cardSetDir @returns {Map<string,string>} */
function loadTrainerTypes(cardSetDir){
  const known=new Map();
  for(const filename of fs.readdirSync(cardSetDir).filter(n=>n.endsWith('.json')).sort()){
    const cards=JSON.parse(fs.readFileSync(path.join(cardSetDir,filename),'utf8'));
    for(const card of cards){
      if(card.supertype!=='Trainer')continue;
      const types=new Set(card.subtypes??[]);
      const type=types.has('Pokémon Tool')?'Pokémon Tool':
        types.has('Item')?'Item':
        types.has('Supporter')?'Supporter':
        types.has('Stadium')?'Stadium':null;
      if(type){
        const prior=known.get(card.name);
        // Older Tools may carry an obsolete Item subtype; modern
        // paper classification is always Tool if any print says Tool.
        if(prior===undefined||type==='Pokémon Tool')known.set(card.name,type);
      }
    }
  }
  for(const [name,type] of JAPANESE_NAME_TYPES)known.set(name,type);
  return known;
}

/** @param {{decks:Array<{rank:number,archetype:string,cards:Array<{category:string,name:string,count:number}>}>}} manifest @param {Map<string,string>} types @returns {{rank:number,archetype:string,items:number,tools:number,blocked:number}[]} */
function countPrintedLockExposure(manifest,types){
  const ranks=new Set();
  const result=manifest.decks.map(deck=>{
    assert.ok(!ranks.has(deck.rank),'duplicate source rank');
    ranks.add(deck.rank);
    let items=0,tools=0,total=0;
    for(const card of deck.cards){
      if(card.category!=='Trainer')continue;
      assert.ok(Number.isInteger(card.count)&&card.count>0);
      const type=types.get(card.name);
      assert.ok(type,`unclassified printed Trainer: ${card.name} rank ${deck.rank}`);
      if(type==='Item')items+=card.count;
      if(type==='Pokémon Tool')tools+=card.count;
      total+=card.count;
    }
    return {rank:deck.rank,archetype:deck.archetype,items,tools,
      blocked:items+tools,trainers:total};
  });
  return result.sort((a,b)=>a.rank-b.rank);
}

if(require.main===module){
  const root=path.resolve(__dirname,'..');
  const cards=loadTrainerTypes(path.join(root,'resources','cards','en'));
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'results','aichi-2026','full-decklists.json'),'utf8'));
  const rows=countPrintedLockExposure(manifest,cards);
  const total=rows.reduce((sum,r)=>sum+r.blocked,0);
  console.log(JSON.stringify({sourceLists:rows.length,blockedSlots:total,
    items:rows.reduce((sum,r)=>sum+r.items,0),
    tools:rows.reduce((sum,r)=>sum+r.tools,0),rows},null,2));
}

module.exports={JAPANESE_NAME_TYPES,loadTrainerTypes,countPrintedLockExposure};

/**
 * Source-print availability of non-Item ways to break or reposition an Active
 * Jellicent lock. These are structural card counts, never live legal decisions.
 *
 * @param {{decks:Array<{rank:number,cards:Array<{name:string,count:number}>}>}} manifest
 * @returns {{rank:number,guzma:number,faba:number,pathToThePeak:number}[]}
 */
function countPotentialUnblockedCounters(manifest){
  return manifest.decks.map(deck=>{
    /** @param {string} name @returns {number} */
    const copies=name=>deck.cards.filter(card=>card.name===name)
      .reduce((sum,card)=>sum+card.count,0);
    return {rank:deck.rank,guzma:copies('Guzma'),faba:copies('Faba'),
      pathToThePeak:copies('Path to the Peak')};
  }).sort((a,b)=>a.rank-b.rank);
}
module.exports.countPotentialUnblockedCounters=countPotentialUnblockedCounters;
