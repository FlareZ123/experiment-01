'use strict';

const fs=require('node:fs');
const path=require('node:path');
const manifest=require('../../results/aichi-2026/full-decklists.json');
const sets=require('../../resources/sets/en.json');

const CARD_ROOT=path.resolve(__dirname,'../../resources/cards/en');
const VERSION='agent43-original-aichi-29-printed-random-hand-census-v1';
const SETS_BY_CODE=new Map();
for(const set of sets){
  const codes=[set.id.toUpperCase(),...(set.ptcgoCode?[set.ptcgoCode.toUpperCase()]:[])];
  for(const code of codes){
    const existing=SETS_BY_CODE.get(code)??[];
    if(!existing.includes(set.id))existing.push(set.id);
    SETS_BY_CODE.set(code,existing);
  }
}
const CACHE=new Map();

/** @param {string} setId @returns {object[]} */
function loadSet(setId){
  if(!CACHE.has(setId))
    CACHE.set(setId,JSON.parse(fs.readFileSync(
      path.join(CARD_ROOT,setId+'.json'),'utf8')));
  return CACHE.get(setId);
}

/** @param {string|number} cardNumber @returns {string} */
function physicalNumber(cardNumber){
  return String(cardNumber).toUpperCase()
    .replace(/^[A-Z]+(?=\d)/,'')
    .replace(/^0+(?=\d)/,'');
}

/** @param {object} card @returns {{kind:string,name:string,text:string}[]} */
function randomOpponentHandEffects(card){
  const result=[];
  for(const [kind,effects] of [['attack',card.attacks??[]],
    ['ability',card.abilities??[]]]){
    for(const effect of effects){
      const description=effect.text??'';
      const random=/\brandom\b/i.test(description);
      const opponentHand=/\bopponent(?:'s|’s)?\s+hand\b/i.test(description);
      if(random&&opponentHand)
        result.push({kind,name:effect.name,text:description});
    }
  }
  return result;
}

/** @returns {object} Printed source 29 field, with unresolved identities exposed. */
function audit(){
  const source=manifest.decks;
  const rows=source.flatMap(d=>d.cards.filter(c=>c.category==='Pokémon')
    .map(c=>({
      rank:d.rank,name:c.name,count:c.count,set:c.printing?.set??null,
      number:c.printing?.number??null,language:c.printing?.language??null
    })));
  const matched=[],unresolved=[];
  for(const input of rows){
    const setIds=SETS_BY_CODE.get(input.set?.toUpperCase()??'')??[];
    const candidates=setIds.flatMap(id=>loadSet(id).filter(c=>
      c.supertype==='Pokémon'&&c.name===input.name&&
      physicalNumber(c.number)===physicalNumber(input.number)));
    if(candidates.length!==1){
      unresolved.push({...input,candidateCount:candidates.length,setIds});
      continue;
    }
    const card=candidates[0];
    matched.push({...input,cardId:card.id,
      randomOpponentHandEffects:randomOpponentHandEffects(card)});
  }
  const hits=matched.filter(x=>x.randomOpponentHandEffects.length);
  const missingNames=[...new Set(unresolved.map(x=>x.name))];
  const unknownNameFlags=missingNames.map(name=>{
    const possible=[];
    for(const set of sets){
      for(const card of loadSet(set.id)){
        if(card.supertype==='Pokémon'&&card.name===name){
          const effects=randomOpponentHandEffects(card);
          if(effects.length)possible.push({cardId:card.id,effects});
        }
      }
    }
    return {name,otherPrintingsKnownWithRandomOpponentHand:possible};
  });
  return {
    version:VERSION,sourceEvent:manifest.event,
    registeredOriginalDecks:source.length,
    totalOriginalPokemonLines:rows.length,
    exactEnglishPrintMatches:matched.length,
    unresolvedOriginalPokemonLines:unresolved.length,
    exactRandomOpponentHandEffects:hits,
    unresolved,unknownNameFlags,
    limitations:[
      'Exact printed text from provided English card database only',
      'Unresolved Japanese and special aliases remain explicitly unknown',
      'An opponent might copy an attack even if it was not directly printed on its card',
      'This is source inventory classification; it does not evaluate ability or attack execution'
    ]
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(audit(),null,2)+'\n');
module.exports={VERSION,audit,physicalNumber,randomOpponentHandEffects};
