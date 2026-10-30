'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const {canonicalNumber}=require('./aichi-opening-basics.cjs');
const VERSION='agent2-paper-expanded-firstturn-attack-vocabulary-v1';
const BW_FORWARD_SET=/^(?:bw|xy|sm|swsh|sv|me)/;

/**
 * English printed attack text governs this *lexical* screen. This is a
 * research candidate pool, not a banlist, release-date, errata or tournament
 * legality certification.
 * @param {string} text Printed attack text
 * @returns {string|null} Semantic first-turn orientation, or null
 */
function classifyFirstTurnText(text){
  assert.equal(typeof text,'string');
  if(!/first turn/i.test(text)||!/go (?:first|second)/i.test(text))
    return null;
  if(/if you go first, you can use this attack (?:on|during) your first turn/i
    .test(text))return 'first-player-attack-exception';
  if(/you can use this attack only if you go second, and only (?:on|during) (?:your |the )?first turn/i
    .test(text))return 'second-player-firstturn-only';
  if(/if you go second, you can't use this attack during your first turn/i
    .test(text))return 'second-player-firstturn-prohibition';
  if(/if you go second(?: and (?:it's|it is) your first turn|,.*during your first turn)/i
    .test(text))return 'second-player-firstturn-modifier';
  return 'unclassified-firstturn-language';
}

/**
 * Read every BW-onward English print present in the supplied card archive.
 * Do not conflate printings with distinct attack mechanics; report both.
 * @param {string} [root] Repository with resources/cards/en and sets/en.json
 * @returns {object} All printed lexical hits plus deduplicated attack families
 */
function scanFirstTurnAttacks(root=ROOT){
  const cardsDir=path.join(root,'resources','cards','en');
  const filenames=fs.readdirSync(cardsDir).filter(n=>
    n.endsWith('.json')&&BW_FORWARD_SET.test(n)).sort();
  const found=[];
  for(const filename of filenames){
    const cards=JSON.parse(fs.readFileSync(path.join(cardsDir,filename),'utf8'));
    for(const card of cards){
      if(card.supertype!=='Pokémon')continue;
      for(const attack of card.attacks??[]){
        const printedText=attack.text??'';
        const orientation=classifyFirstTurnText(printedText);
        if(!orientation)continue;
        found.push({
          cardId:card.id,cardNumber:card.number,
          setId:filename.slice(0,-5),card:card.name,stage:card.subtypes??[],
          attack:attack.name,cost:attack.cost??[],
          damage:attack.damage??'',orientation,
          text:printedText
        });
      }
    }
  }
  const families=new Map();
  for(const row of found){
    const key=JSON.stringify([row.card,row.attack,row.cost,row.text]);
    const current=families.get(key);
    if(current){
      assert.equal(row.orientation,current.orientation);
      current.printings.push(row.cardId);
    }else{
      families.set(key,{
        card:row.card,attack:row.attack,cost:row.cost,
        orientation:row.orientation,text:row.text,
        printings:[row.cardId]
      });
    }
  }
  const groups=[...families.values()].sort((a,b)=>
    a.orientation.localeCompare(b.orientation)||
    a.card.localeCompare(b.card)||a.attack.localeCompare(b.attack));
  const byOrientation={};
  for(const row of groups){
    byOrientation[row.orientation]=(byOrientation[row.orientation]??0)+1;
  }
  // Join exact Pokemon printing ID/number, never species names. This avoids
  // falsely counting rank26's PLF4 Exeggcute as the separate SSP first-turn
  // evolution printing merely because both are named Exeggcute.
  const setMeta=JSON.parse(fs.readFileSync(
    path.join(root,'resources','sets','en.json'),'utf8'));
  const source=JSON.parse(fs.readFileSync(
    path.join(root,'results','aichi-2026','full-decklists.json'),'utf8'));
  const idToCode=new Map(setMeta.filter(x=>x.ptcgoCode)
    .map(x=>[x.id,x.ptcgoCode]));
  idToCode.set('smp','SMP');
  idToCode.set('xyp','XYP');
  const firstTurnExactPrintings=new Set(found.map(row=>[
    row.card,idToCode.get(row.setId)||null,
    canonicalNumber(String(row.cardNumber))
  ].join('|')));
  const originalFieldExactOverlap=[];
  for(const deck of source.decks){
    const cards=deck.cards.filter(x=>x.category==='Pokémon');
    for(const row of cards){
      const printId=[row.name,row.printing.set,
        canonicalNumber(String(row.printing.number))].join('|');
      if(firstTurnExactPrintings.has(printId)){
        originalFieldExactOverlap.push({rank:deck.rank,card:row.name,
          sourcePrinting:row.printing,count:row.count});
      }
    }
  }
  assert.equal(source.decks.length,29);
  return {
    schema:VERSION,
    source:'user-supplied BW-onward English card archive represented in resources/',
    note:'Lexical printed-card opportunity only. Legal bans, official errata, format release dates and actual game-state availability require independent verification.',
    englishSetFilesScanned:filenames.length,
    matchingPrintedAttacks:found.length,
    distinctPrintedAttackFamilies:groups.length,
    distinctFamiliesByOrientation:byOrientation,
    firstTurnAttackFamilies:groups,
    authenticatedOriginalAichiSixties:29,
    matchingOriginalSourcePrintedFirstTurnAttackCopies:
      originalFieldExactOverlap.reduce((n,x)=>n+x.count,0),
    originalSourceFirstTurnPrintings:originalFieldExactOverlap,
    fieldMatched:false,
    paperLegalCertified:false,
    simulated:false,
    competitiveGameQualified:false
  };
}

if(require.main===module){
  process.stdout.write(JSON.stringify(scanFirstTurnAttacks(),null,2)+'\n');
}
module.exports={VERSION,BW_FORWARD_SET,classifyFirstTurnText,scanFirstTurnAttacks};
