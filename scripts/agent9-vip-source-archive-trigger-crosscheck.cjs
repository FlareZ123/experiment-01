'use strict';

const fs=require('node:fs');
const path=require('node:path');

const VERSION='agent9-exact-vip-hand-trigger-archive-census-v1';
const ROOT=path.resolve(__dirname,'..');
const FROM_HAND_BENCH=/when you play this Pok[eé]mon from your hand (?:onto|to) your Bench/i;

/**
 * Resolve only exact English printings from the bundled archive.
 * Unresolved or mismatched printed card identities stay observable.
 * @param {object} original Full 29-source original event manifest.
 * @param {object[]} sets Local set index with ptcgoCode and id.
 * @param {(setId:string)=>object[]} loadSet Local complete card archive loader.
 * @returns {object} Explicit matched, hand-only and unresolved inventories.
 */
function auditOriginalVipBenchEntry(original,sets,loadSet){
  const setIds=new Map(sets.filter(s=>s.ptcgoCode)
    .map(s=>[s.ptcgoCode,s.id]));
  const cache=new Map();
  const rows=[];
  for(const deck of original.decks){
    const vip=deck.cards.find(c=>c.name==='Battle VIP Pass');
    if(!vip)continue;
    const handOnly=[],otherMatched=[],unresolved=[];
    for(const card of deck.cards.filter(c=>c.category==='Pokémon')){
      const setId=setIds.get(card.printing.set);
      if(!setId){
        unresolved.push({name:card.name,set:card.printing.set,
          number:String(card.printing.number),copies:card.count,
          reason:'unmapped-set'});
        continue;
      }
      if(!cache.has(setId))cache.set(setId,loadSet(setId));
      const exact=cache.get(setId).find(entry=>
        String(entry.number)===String(card.printing.number)&&
        entry.name===card.name);
      if(!exact){
        unresolved.push({name:card.name,set:card.printing.set,
          number:String(card.printing.number),copies:card.count,
          reason:'printed-card-missing-or-name-mismatch'});
        continue;
      }
      if(!exact.subtypes?.includes('Basic'))continue;
      const abilities=(exact.abilities??[]).filter(a=>
        FROM_HAND_BENCH.test(a.text??''));
      const item={name:card.name,set:card.printing.set,
        number:String(card.printing.number),copies:card.count};
      if(abilities.length>0)handOnly.push({
        ...item,abilities:abilities.map(a=>a.name)});
      else otherMatched.push(item);
    }
    rows.push({rank:deck.rank,archetype:deck.archetype,
      vipCopies:vip.count,handOnly,otherMatched,unresolved});
  }
  const matchedCopies=rows.reduce((sum,r)=>sum+
    r.handOnly.reduce((n,x)=>n+x.copies,0),0);
  return {version:VERSION,originalSourceCount:original.decks.length,
    vipSourceCount:rows.length,
    handOnlyCopyCount:matchedCopies,
    handOnlySourceCount:rows.filter(r=>r.handOnly.length>0).length,
    matchedBasicOtherCopyCount:rows.reduce((n,r)=>n+
      r.otherMatched.reduce((s,c)=>s+c.copies,0),0),
    unresolvedPokemonCopies:rows.reduce((n,r)=>n+
      r.unresolved.reduce((s,c)=>s+c.copies,0),0),
    rows,
    completeness:'Every unresolved print is retained as unknown; never infer a negative ability trigger from an unmapped printing'};
}

/** Run against the in-repository full English card archive. */
function run(){
  const original=require(path.join(ROOT,'results/aichi-2026/full-decklists.json'));
  const sets=require(path.join(ROOT,'resources/sets/en.json'));
  return auditOriginalVipBenchEntry(original,sets,setId=>
    JSON.parse(fs.readFileSync(path.join(ROOT,'resources/cards/en',setId+'.json'),'utf8')));
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,FROM_HAND_BENCH,auditOriginalVipBenchEntry,run};
