'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const EVENT_DATE='2026/05/10';
// The Japanese equivalents are source-verified card identities, not an
// assertion about which physical art or print each competitor owned.
const JAPANESE_CROSSWALKS=Object.freeze({
  'CRI:82:Special Red Card':Object.freeze({
    japanesePrint:'Ninja Spinner M4 072/083',
    japaneseRelease:'2026/03/13',
    officialJapaneseCardUrl:
      'https://www.pokemon-card.com/card-search/details.php/card/50156/regu/all'
  }),
  'CRI:56:Trubbish':Object.freeze({
    japanesePrint:'Ninja Spinner M4 054/083',
    japaneseRelease:'2026/03/13',
    officialJapaneseCardUrl:
      'https://www.pokemon-card.com/card-search/details.php/card/50138'
  })
});

/**
 * Audit only the release date of the specific normalized English printing.
 * Cross-region print identities are explicitly sourced, never inferred from
 * a same-name card or an international legality flag.
 *
 * @param {{decks:Array<{rank:number,player:string,cards:Array<{
 *   count:number,name:string,printing:{set:string,number:string}
 * }>}>}} original
 * @param {Array<{id:string,ptcgoCode?:string,releaseDate:string}>} sets
 * @param {string} [eventDate] YYYY/MM/DD
 * @param {Record<string,{japanesePrint:string,japaneseRelease:string,
 *   officialJapaneseCardUrl:string}>} [crosswalks]
 * @returns {{date:string,deckCount:number,allDecksHaveSixty:boolean,
 *   futureEnglishRows:number,futureEnglishCopies:number,
 *   rows:Array<object>,uncertainRegionalRows:number}}
 */
function auditEnglishSetClock(original,sets,eventDate=EVENT_DATE,
  crosswalks=JAPANESE_CROSSWALKS){
  assert.match(eventDate,/^\d{4}\/\d{2}\/\d{2}$/);
  const byCode=new Map();
  for(const set of sets){
    if(!set.ptcgoCode)continue;
    const existing=byCode.get(set.ptcgoCode);
    assert.ok(!existing||existing.releaseDate===set.releaseDate,
      'One abbreviated set code must not resolve to conflicting release dates');
    byCode.set(set.ptcgoCode,set);
  }
  const rows=[];
  let allDecksHaveSixty=true;
  for(const deck of original.decks){
    allDecksHaveSixty &&=
      deck.cards.reduce((n,card)=>n+card.count,0)===60;
    for(const card of deck.cards){
      const set=byCode.get(card.printing.set);
      assert.ok(set,'Missing English release date for '+card.printing.set);
      if(set.releaseDate<=eventDate)continue;
      const crosswalkKey=card.printing.set+':'+
        Number(card.printing.number)+':'+card.name;
      const crosswalk=crosswalks[crosswalkKey]??null;
      const earlierJapaneseEquivalent=!!crosswalk&&
        crosswalk.japaneseRelease.replaceAll('/','')<
          eventDate.replaceAll('/','');
      rows.push({
        rank:deck.rank,player:deck.player,card:card.name,count:card.count,
        englishPrinting:card.printing.set+' '+card.printing.number,
        englishSetName:set.name,englishRelease:set.releaseDate,
        japaneseCrosswalk:crosswalk,
        earlierJapaneseEquivalent
      });
    }
  }
  return {
    date:eventDate,deckCount:original.decks.length,
    allDecksHaveSixty,
    futureEnglishRows:rows.length,
    futureEnglishCopies:rows.reduce((n,row)=>n+row.count,0),
    rows,
    uncertainRegionalRows:rows.filter(row=>
      !row.earlierJapaneseEquivalent).length
  };
}

/** @returns {ReturnType<typeof auditEnglishSetClock>} */
function auditRepository(){
  const root=path.join(__dirname,'..');
  const read=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
  return auditEnglishSetClock(
    read('results/aichi-2026/full-decklists.json'),
    read('resources/sets/en.json'));
}

module.exports={EVENT_DATE,JAPANESE_CROSSWALKS,auditEnglishSetClock,
  auditRepository};

if(require.main===module)
  process.stdout.write(JSON.stringify(auditRepository(),null,2)+'\n');
