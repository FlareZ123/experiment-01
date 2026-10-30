'use strict';

const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');

const ROOT=path.resolve(__dirname,'..');
const field=require(path.join(ROOT,'results/aichi-2026/full-decklists.json'));
const sets=require(path.join(ROOT,'resources/sets/en.json'));
const cardDir=path.join(ROOT,'resources/cards/en');
const setCodes=new Map();
for(const set of sets){
  if(!set.ptcgoCode)continue;
  const aliases=setCodes.get(set.ptcgoCode)??[];
  aliases.push(set.id);
  setCodes.set(set.ptcgoCode,aliases);
}

const available=new Map();
for(const filename of fs.readdirSync(cardDir)){
  if(!filename.endsWith('.json'))continue;
  const id=filename.slice(0,-5);
  const cards=JSON.parse(fs.readFileSync(path.join(cardDir,filename),'utf8'));
  for(const card of cards){
    const key=[id,String(card.number),card.name].join('|');
    available.set(key,card);
  }
}
function printingCard(item){
  if(!item.printing?.set||item.printing.language!=='en')return null;
  const ids=setCodes.get(item.printing.set)??[];
  for(const id of ids){
    const found=available.get([id,String(item.printing.number),item.name].join('|'));
    if(found)return found;
  }
  return null;
}
function category(attack){
  const t=attack.text??'';
  const tags=[];
  if(/search your deck/i.test(t))tags.push('attack-deck-search');
  if(/discard pile/i.test(t)&&
      /(?:deck|hand)/i.test(t))tags.push('attack-discard-recovery');
  if(/evolve (?:it|this|one|a|your|the)|evolves from/i.test(t))
    tags.push('attack-evolution');
  if(/switch .*active|switch .*benched|switch .*of your opponent/i.test(t))
    tags.push('attack-position-change');
  if(/if you go first, you can use this attack (?:on|during) your first turn/i.test(t))
    tags.push('first-player-exception');
  return tags;
}
const records=[],unknown=[];
for(const deck of field.decks){
  for(const item of deck.cards){
    const card=printingCard(item);
    if(!card){
      unknown.push({rank:deck.rank,name:item.name,printing:item.printing});
      continue;
    }
    for(const attack of card.attacks??[]){
      const tags=category(attack);
      if(tags.length)records.push({
        rank:deck.rank,archetype:deck.archetype,
        card:item.name,printing:item.printing,
        copies:item.count,attack:attack.name,tags
      });
    }
  }
}
const byTag={};
for(const record of records){
  for(const tag of record.tags){
    const group=byTag[tag]??new Set();
    group.add(record.rank);
    byTag[tag]=group;
  }
}
const data={
  version:'agent37-aichi-attack-text-census-v1',
  source:'exact 29 published Aichi source 60s, English printing text only',
  matchedDecks:field.decks.length,
  distinctRanksByTag:Object.fromEntries(Object.entries(byTag)
    .map(([name,ranks])=>[name,[...ranks].sort((a,b)=>a-b)])),
  unmatchedPrintings:unknown,
  records:records.sort((a,b)=>a.rank-b.rank||a.card.localeCompare(b.card))
};
assert.equal(data.matchedDecks,29);
const concise=process.argv.includes('--summary');
if(concise){
  console.log(JSON.stringify({
    version:data.version,matchedDecks:data.matchedDecks,
    distinctRanksByTag:data.distinctRanksByTag,
    unmatchedPrintings:data.unmatchedPrintings.length,
    relevantRecords:data.records.filter(r=>r.tags.some(t=>
      t==='attack-deck-search'||t==='attack-discard-recovery'||
      t==='attack-evolution')).slice(0,80)
  },null,2));
}else console.log(JSON.stringify(data,null,2));
module.exports={printingCard,category};
