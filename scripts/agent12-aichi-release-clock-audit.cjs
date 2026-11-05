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
 * Audit archived source print labels at their actual regional/card-art clock.
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
 *   futureEnergyArtRows:number,futureEnergyArtCopies:number,
 *   japanesePromoRows:number,japanesePromoCopies:number,
 *   rows:Array<object>,uncertainRegionalRows:number}}
 */
function auditEnglishSetClock(original,sets,eventDate=EVENT_DATE,
  crosswalks=JAPANESE_CROSSWALKS){
  assert.match(eventDate,/^\d{4}\/\d{2}\/\d{2}$/);
  const byCode=new Map();
  for(const set of sets){
    for(const code of [set.ptcgoCode,set.id?.toUpperCase()]){
      if(!code)continue;
      const existing=byCode.get(code);
      assert.ok(!existing||existing.releaseDate===set.releaseDate,
        'One abbreviated set code must not resolve to conflicting release dates');
      byCode.set(code,set);
    }
  }
  const rows=[];
  let allDecksHaveSixty=true;
  let japanesePromoRows=0,japanesePromoCopies=0;
  for(const deck of original.decks){
    allDecksHaveSixty &&=
      deck.cards.reduce((n,card)=>n+card.count,0)===60;
    for(const card of deck.cards){
      const {set:printedSet,number}=card.printing;
      const id=Number(number);
      // A Japanese S-P promotional collector identifier is not an English
      // expansion-code clock. Only this exact verified 2020 promo is admitted.
      if(printedSet==='SP'){
        assert.ok(id===127&&card.name==="Player's Ceremony",
          'Unresolved Japanese S-P promotional printing: '+number);
        japanesePromoRows++;
        japanesePromoCopies+=card.count;
        continue;
      }
      // MEE is a *split* Energy-art collector series, absent from
      // resources/sets/en.json; 001-008 date to Mega Evolution 2025,
      // whereas 009-016 are September 2026 30th Celebration art.
      if(printedSet==='MEE'){
        assert.ok(Number.isSafeInteger(id)&&id>=1&&id<=16&&
          card.name.endsWith(' Energy'),
          'Unsupported MEE collector printing: '+number);
        const date=id<=8?'2025/09/26':'2026/09/16';
        if(date>eventDate)rows.push({
          kind:'future-energy-art',
          rank:deck.rank,player:deck.player,card:card.name,count:card.count,
          englishPrinting:'MEE '+number,englishSetName:
            'MEE Basic Energies, 30th Celebration art',
          englishRelease:date,japaneseCrosswalk:null,
          earlierJapaneseEquivalent:false
        });
        continue;
      }
      const set=byCode.get(printedSet);
      assert.ok(set,'Missing English release date for '+printedSet);
      if(set.releaseDate<=eventDate)continue;
      const crosswalkKey=printedSet+':'+id+':'+card.name;
      const crosswalk=crosswalks[crosswalkKey]??null;
      const earlierJapaneseEquivalent=!!crosswalk&&
        crosswalk.japaneseRelease.replaceAll('/','')<
          eventDate.replaceAll('/','');
      rows.push({
        kind:'future-english-set',
        rank:deck.rank,player:deck.player,card:card.name,count:card.count,
        englishPrinting:printedSet+' '+number,
        englishSetName:set.name,englishRelease:set.releaseDate,
        japaneseCrosswalk:crosswalk,
        earlierJapaneseEquivalent
      });
    }
  }
  const futureEnglish=rows.filter(row=>row.kind==='future-english-set');
  const futureEnergyArt=rows.filter(row=>row.kind==='future-energy-art');
  return {
    date:eventDate,deckCount:original.decks.length,
    allDecksHaveSixty,
    futureEnglishRows:futureEnglish.length,
    futureEnglishCopies:futureEnglish.reduce((n,row)=>n+row.count,0),
    futureEnergyArtRows:futureEnergyArt.length,
    futureEnergyArtCopies:futureEnergyArt.reduce((n,row)=>n+row.count,0),
    japanesePromoRows,japanesePromoCopies,
    rows,
    uncertainRegionalRows:futureEnglish.filter(row=>
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
