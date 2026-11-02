'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const CARD_DIRECTORY=path.join(ROOT,'resources/cards/en');
const SOURCE_FILE=path.join(ROOT,'results/aichi-2026/full-decklists.json');

/** @returns {Map<string,Set<string>>} Printed Trainer type(s), by exact name. */
function loadTypes(){
  const result=new Map();
  for(const entry of fs.readdirSync(CARD_DIRECTORY).filter(s=>s.endsWith('.json'))){
    const cards=JSON.parse(fs.readFileSync(path.join(CARD_DIRECTORY,entry),'utf8'));
    assert.ok(Array.isArray(cards),'Card archive set is not an array: '+entry);
    for(const card of cards){
      if(card.supertype!=='Trainer')continue;
      const tags=card.subtypes??[];
      const subtype=tags.includes('Supporter')?'Supporter':
        tags.includes('Pokémon Tool')?'Pokémon Tool':
          tags.includes('Stadium')?'Stadium':
            tags.includes('Item')?'Item':null;
      if(!subtype)continue;
      const found=result.get(card.name)??new Set();
      found.add(subtype);
      result.set(card.name,found);
    }
  }
  // The bundled EN card archive omits seven actual original-printing names.
  // Keep the scope explicit. Their printed types are established by the
  // source deck's authenticated set+number plus external printed-card
  // catalogues; they are all non-Supporters. Do not silently make a
  // missing card look as if it came from the bundled card archive.
  // PHF 92/102/106: Battle Compressor, Robo Substitute, Target Whistle
  // BWP 153: Palace Belt (Tool). SMP NAN25: Palace Book (Item).
  // LOT 191 and TEU 158: Prism Star Stadiums.
  const verifiedOutsideBundledArchive={
    'Battle Compressor':'Item',
    'Palace Belt':'Pokémon Tool',
    'Palace Book':'Item',
    'Robo Substitute':'Item',
    'Target Whistle':'Item',
    'Thunder Mountain ♢':'Stadium',
    'Wondrous Labyrinth ♢':'Stadium'
  };
  for(const [name,type] of Object.entries(verifiedOutsideBundledArchive)){
    assert.equal(result.has(name),false,
      'Remove extra-archive override after bundled archive includes '+name);
    result.set(name,new Set([type]));
  }
  return result;
}

/** @returns {{schema:string,sample:number,missingRanks:number[],supporterSummary:object,rows:object[],qualifiedMatches:number}} */
function census(){
  const source=JSON.parse(fs.readFileSync(SOURCE_FILE,'utf8'));
  assert.equal(source.published_deck_count,29);
  assert.equal(source.total_placements,32);
  assert.equal(source.decks.length,29);
  const types=loadTypes();
  const rows=source.decks.map(deck=>{
    const unknown=[];
    let supporters=0,trainers=0,oldEX=0,wally=0;
    for(const row of deck.cards){
      assert.ok(Number.isSafeInteger(row.count)&&row.count>0);
      if(row.category==='Pokémon'&&row.name.endsWith('-EX'))oldEX+=row.count;
      if(row.category!=='Trainer')continue;
      trainers+=row.count;
      const tags=types.get(row.name);
      if(!tags||tags.size!==1){unknown.push({name:row.name,types:tags?[...tags]:null});continue;}
      if(tags.has('Supporter'))supporters+=row.count;
      if(row.name==='Wally')wally+=row.count;
    }
    assert.deepEqual(unknown,[],'Source Trainer name taxonomy must be unambiguous: '+deck.rank);
    assert.ok(supporters<=trainers);
    return {rank:deck.rank,player:deck.player,archetype:deck.archetype,
      supporterCopies:supporters,allTrainerCopies:trainers,
      wallyCopies:wally,oldUppercasePokemonExCopies:oldEX,
      wallyAndOldEXCoheld:wally>0&&oldEX>0};
  }).sort((a,b)=>a.rank-b.rank);
  const present=new Set(rows.map(row=>row.rank));
  const missingRanks=Array.from({length:32},(_,i)=>i+1).filter(r=>!present.has(r));
  const sorted=rows.map(row=>row.supporterCopies).sort((a,b)=>a-b);
  return {
    schema:'agent18-source29-supporter-wally-oldex-typed-card-archive-v1',
    sample:rows.length,missingRanks,
    trainerClassificationEvidence:{
      bundledEnglishCardArchive:'176 original JSON sets, exact name/subtypes',
      explicitExternalPrintingTypeOverrides:[
        'Battle Compressor','Palace Belt','Palace Book','Robo Substitute',
        'Target Whistle','Thunder Mountain ♢','Wondrous Labyrinth ♢'
      ],
      note:'Seven published source Trainer names absent from supplied archive; override only their verified non-Supporter printed type.'
    },
    supporterSummary:{
      min:sorted[0],median:sorted[Math.floor(sorted.length/2)],
      max:sorted.at(-1),
      atMostTwo:rows.filter(row=>row.supporterCopies<=2).map(row=>row.rank),
      atLeastTwenty:rows.filter(row=>row.supporterCopies>=20).map(row=>row.rank)
    },
    wallyOriginalRanks:rows.filter(row=>row.wallyCopies>0).map(row=>row.rank),
    oldUppercasePokemonExOriginalRanks:rows.filter(row=>row.oldUppercasePokemonExCopies>0).map(row=>row.rank),
    wallyAndOldEXOriginalRanks:rows.filter(row=>row.wallyAndOldEXCoheld).map(row=>row.rank),
    rows,qualifiedMatches:0,
    scope:'Exact registered printed 29 source-60 card inventory, full card-archive Trainer subtypes. Counts do not predict played Supporters or actual lock payoff.'
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(census(),null,2)+'\n');
module.exports={census,loadTypes};
