'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const VERSION='agent34-aichi-29-original-printed-exemptions-v2';
const PROMO_SET_ALIASES=Object.freeze({
  SMP:Object.freeze({id:'smp',numberPrefix:'SM'}),
  XYP:Object.freeze({id:'xyp',numberPrefix:'XY'})
});
const canonicalPokemonName=name=>name.replace(/♢/g,'◇');
const PATTERNS=Object.freeze({
  disregardWeaknessResistance:/\b(?:isn't|is not|not)\s+affected\s+by\s+Weakness\s+or\s+Resistance\b|\bdon't\s+apply\s+Weakness\s+and\s+Resistance\b(?!\s+for\s+Benched\s+Pok[eé]mon)/i,
  benchOnlyWeaknessReminder:/\bdon't\s+apply\s+Weakness\s+and\s+Resistance\s+for\s+Benched\s+Pok[eé]mon/i,
  disregardDefenderEffects:/\b(?:isn't|is not|not)\s+affected\s+by\s+any\s+effects\s+on\b/i,
  damageCounters:/\bput\s+\d+\s+damage\s+counters\b/i
});

/** Only exact registered original source card printings are analyzed.
 * @param {{decks:object[]}} source Canonical authenticated Aichi roster.
 * @param {object[]} sets Printed card-pool set identification.
 * @param {(setId:string)=>object[]} readCards Fetch a given set's printed cards.
 * @returns {object} Failure-inclusive printed-language exposure.
 */
function censusOriginalSourceExceptions(source,sets,readCards){
  assert.ok(Array.isArray(source?.decks));
  const byCode=new Map();
  for(const set of sets){
    const code=set.ptcgoCode;
    if(typeof code!=='string'||!code)continue;
    const list=byCode.get(code)??[];
    list.push(set.id);byCode.set(code,list);
  }
  const unique=new Map();
  for(const deck of source.decks){
    assert.ok(Number.isSafeInteger(deck.rank));
    const pokemon=deck.cards.filter(c=>c.category==='Pokémon');
    for(const c of pokemon){
      const printing=c.printing;
      const key=[c.name,printing?.set,printing?.number].join('|');
      if(!unique.has(key))unique.set(key,{name:c.name,set:printing?.set,
        number:String(printing?.number??''),ranks:[]});
      unique.get(key).ranks.push(deck.rank);
    }
  }
  const unresolved=[],rows=[],resolved=[],setCache=new Map();
  for(const entry of unique.values()){
    const promo=PROMO_SET_ALIASES[entry.set];
    const ids=promo?[promo.id]:(byCode.get(entry.set)??[]);
    if(ids.length===0){
      unresolved.push({...entry,reason:'no-exact-set-code',ids});
      continue;
    }
    const expectedNumber=promo?promo.numberPrefix+entry.number:entry.number;
    const expectedName=canonicalPokemonName(entry.name);
    const matches=[];
    const nearby=[];
    for(const id of ids){
      if(!setCache.has(id))setCache.set(id,readCards(id));
      for(const c of setCache.get(id)){
        if(String(c.number)!==expectedNumber)continue;
        nearby.push({id,name:c.name,cardId:c.id});
        if(c.name===expectedName)matches.push({id,card:c});
      }
    }
    if(matches.length!==1){
      unresolved.push({...entry,reason:matches.length>1?
        'ambiguous-card-printing':ids.length>1?
        'ambiguous-set-code':'exact-card-printing-unresolved',
        ids,candidates:nearby});
      continue;
    }
    const {id:setId,card}=matches[0];
    resolved.push({...entry,setId,cardId:card.id,
      canonicalName:card.name,collectorNumber:String(card.number)});
    const attacks=(card.attacks??[]).map(a=>{
      const txt=a.text??'';
      const kinds=Object.entries(PATTERNS).filter(([,regex])=>
        regex.test(txt)).map(([key])=>key);
      return {name:a.name,text:txt,kinds};
    }).filter(a=>a.kinds.length>0);
    if(attacks.length>0)rows.push({...entry,cardId:card.id,
      attacks});
  }
  const byKind=Object.fromEntries(Object.keys(PATTERNS).map(kind=>[
    kind,{
      uniquePrintings:rows.filter(r=>r.attacks.some(a=>
        a.kinds.includes(kind))).length,
      distinctRanks:[...new Set(rows.filter(r=>r.attacks.some(a=>
        a.kinds.includes(kind))).flatMap(r=>r.ranks))].sort((a,b)=>a-b)
    }]));
  return {schema:VERSION,sourceDecks:source.decks.length,
    sourcePokemonPrintings:unique.size,resolvedPrintedExceptions:rows.length,
    unresolvedPrintingCount:unresolved.length,rows,resolved,unresolved,byKind,
    actualNativeEffectVerified:false,competitiveGameQualified:false,
    limitation:'Printed exception catalog only. Matchup attack usage, native behavior, and every source paper effect require independent real-Store tests.'};
}

/** Load the bundled offline source files. */
function run(){
  const source=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const sets=JSON.parse(fs.readFileSync(path.join(root,
    'resources/sets/en.json'),'utf8'));
  return censusOriginalSourceExceptions(source,sets,id=>
    JSON.parse(fs.readFileSync(path.join(root,
      'resources/cards/en',id+'.json'),'utf8')));
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,PATTERNS,PROMO_SET_ALIASES,canonicalPokemonName,censusOriginalSourceExceptions,run};
