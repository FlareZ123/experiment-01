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
      const subtype=(card.subtypes??[]).find(s=>
        ['Supporter','Item','Pokémon Tool','Stadium'].includes(s));
      if(!subtype)continue;
      const found=result.get(card.name)??new Set();
      found.add(subtype);
      result.set(card.name,found);
    }
  }
  return result;
}

/** @returns {{schema:string,sample:number,missingRanks:number[],supporterSummary:object,rows:object[],qualifiedMatches:number}} */
function census(){
  const source=JSON.parse(fs.readFileSync(SOURCE_FILE,'utf8'));
  assert.equal(source.schema,'aichi-top32-original-decklists-v1');
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
