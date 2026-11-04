'use strict';

const fs=require('node:fs');
const path=require('node:path');

const SCHEMA='agent6-aichi-japanese-only-promo-source-census-v1';

// Verified Japanese promo print identities, NOT assertions about physical
// copies or about the meaning of the source manifest's language label.
const PROMOS=Object.freeze([
  {set:'BWP',number:'153',name:'Palace Belt',japanesePrint:'153/BW-P',
    japaneseCardUrl:'https://www.pokemon-card.com/card-search/details.php/card/28213'},
  {set:'SMP',number:'NAN25',name:'Palace Book',japanesePrint:'SM-P unnumbered Palace Book',
    japaneseCardUrl:'https://www.pokemon-card.com/card-search/details.php/card/34382/regu/all'},
  {set:'SP',number:'127',name:"Player's Ceremony",japanesePrint:'127/S-P',
    japaneseCardUrl:'https://www.pokemon-card.com/card-search/details.php/card/38633/regu/XY'}
]);

/**
 * Census three verified Japanese-only promo identities in the source archive.
 * A source language token is preserved, never treated as physical language.
 *
 * @param {{decks:Array<{rank:number,cards:Array<{name:string,count:number,printing:{set:string,number:string,language:string}}>}>,missing_full_lists:Array<{rank:number}>}} field
 * @param {Set<string>} englishCardNames Exact names present in supplied English DB.
 * @returns {object} Read-only copy/rank provenance census.
 */
function auditJapaneseOnlyPromos(field,englishCardNames){
  if(!Array.isArray(field?.decks)||!(englishCardNames instanceof Set)){
    throw new TypeError('Expected original source decks and an English-card-name Set');
  }
  const provenance=[];
  const languageRows=new Map();
  const languageCopies=new Map();
  for(const d of field.decks){
    for(const row of d.cards){
      if(!Number.isSafeInteger(d.rank)||!Number.isSafeInteger(row.count)||
        row.count<=0||typeof row.printing?.language!=='string'){
        throw new TypeError('Invalid source rank, quantity, or language annotation');
      }
      const language=row.printing.language;
      languageRows.set(language,(languageRows.get(language)||0)+1);
      languageCopies.set(language,(languageCopies.get(language)||0)+row.count);
      const promo=PROMOS.find(p=>p.name===row.name &&
        p.set===row.printing?.set &&
        p.number===String(row.printing.number));
      if(!promo)continue;
      if(!Number.isSafeInteger(d.rank)||!Number.isSafeInteger(row.count)||
        row.count<=0)throw new TypeError('Invalid source rank or quantity');
      provenance.push({rank:d.rank,name:row.name,copies:row.count,
        displaySet:row.printing.set,displayNumber:String(row.printing.number),
        sourceLanguageToken:row.printing.language,
        japanesePrint:promo.japanesePrint,
        japaneseCardUrl:promo.japaneseCardUrl,
        englishDatabaseNamePresent:englishCardNames.has(row.name)});
    }
  }
  provenance.sort((a,b)=>a.rank-b.rank || a.name.localeCompare(b.name));
  const byIdentity=PROMOS.map(p=>{
    const rows=provenance.filter(r=>r.name===p.name);
    return {name:p.name,displaySet:p.set,displayNumber:p.number,
      japanesePrint:p.japanesePrint,originalSourceRows:rows.length,
      copies:rows.reduce((sum,row)=>sum+row.copies,0),
      sourceRanks:rows.map(row=>row.rank).sort((a,b)=>a-b),
      englishDatabaseNamePresent:englishCardNames.has(p.name)};
  });
  return {schema:SCHEMA,sourceOriginalLists:field.decks.length,
    knownMissingOriginalRanks:field.missing_full_lists.map(d=>d.rank),
    originalSourceRows:provenance.length,
    originalSourceCopies:provenance.reduce((sum,row)=>sum+row.copies,0),
    allOriginalSourceLanguageTokenRows:Object.fromEntries([...languageRows].sort()),
    allOriginalSourceLanguageTokenCopies:Object.fromEntries([...languageCopies].sort()),
    affectedRanks:[...new Set(provenance.map(r=>r.rank))].sort((a,b)=>a-b),
    byIdentity,provenance,
    scope:'Japanese promo print evidence; not original physical-language evidence, native card support, English Expanded legality, or match qualification'};
}

/** @returns {object} Source-locked census using repository data only. */
function auditRepositoryJapaneseOnlyPromos(){
  const root=path.resolve(__dirname,'..');
  const field=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const englishDir=path.join(root,'resources/cards/en');
  const names=new Set();
  for(const file of fs.readdirSync(englishDir).filter(f=>f.endsWith('.json'))){
    const cards=JSON.parse(fs.readFileSync(path.join(englishDir,file),'utf8'));
    for(const card of cards)names.add(card.name);
  }
  return auditJapaneseOnlyPromos(field,names);
}

module.exports={SCHEMA,PROMOS,auditJapaneseOnlyPromos,
  auditRepositoryJapaneseOnlyPromos};
