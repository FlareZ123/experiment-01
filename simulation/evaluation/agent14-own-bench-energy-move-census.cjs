'use strict';
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'../..');
const read=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const trigger=/\bMove\b[^.]{0,80}\bEnergy\b[^.]{0,80}\bfrom this Pokémon to\b[^.]{0,90}\b(?:your|Benched)\b/i;

/**
 * Scan only the exact published rank-specific Pokémon printings in the
 * canonical Aichi 29-source manifest. Repeated TCG sets can share PTCGO
 * abbreviations, so resolve set+printed number+exact name jointly.
 * Unsupported/ambiguous printing matches are reported, never substituted.
 *
 * @returns {object} Read-only original-print-custody and text-census record.
 */
function census(){
  const published=read('results/aichi-2026/full-decklists.json');
  const sets=read('resources/sets/en.json');
  const codeToSets=new Map();
  for(const set of sets){
    const code=set.ptcgoCode||null;
    if(code){
      if(!codeToSets.has(code))codeToSets.set(code,[]);
      codeToSets.get(code).push(set.id);
    }
  }
  for(const code of ['SMP','XYP'])codeToSets.set(code,[code.toLowerCase()]);
  const cardsCache=new Map();
  const getCards=id=>{
    if(!cardsCache.has(id))cardsCache.set(id,
      read('resources/cards/en/'+id+'.json'));
    return cardsCache.get(id);
  };
  const unresolved=[],matches=[];
  let checkedPokemonPrints=0;
  const decks=published.decks.filter(deck=>
    deck.status!=='missing'&&Array.isArray(deck.cards)&&
    deck.cards.reduce((n,c)=>n+c.count,0)===60);
  for(const deck of decks){
    for(const owned of deck.cards){
      if(owned.category!=='Pokémon')continue;
      checkedPokemonPrints++;
      const print=owned.printing||{};
      const choices=[];
      for(const setId of codeToSets.get(print.set)||[]){
        for(const card of getCards(setId)){
          if(card.number===String(print.number)&&card.name===owned.name)
            choices.push({setId,card});
        }
      }
      if(choices.length!==1){
        unresolved.push({rank:deck.rank,name:owned.name,
          printing:print,matchingCopies:choices.length});
        continue;
      }
      const {setId,card}=choices[0];
      for(const attack of card.attacks||[]){
        const txt=attack.text||'';
        if(!trigger.test(txt))continue;
        matches.push({
          rank:deck.rank,archetype:deck.archetype,
          pokemon:owned.name,count:owned.count,
          sourcePrinting:print,sourceCardId:card.id,setId,
          attack:attack.name,attackCost:attack.cost,damage:attack.damage,
          printedText:txt,
          deckEnergyInventory:deck.cards.filter(c=>c.category==='Energy')
            .map(c=>({name:c.name,count:c.count,printing:c.printing}))
        });
      }
    }
  }
  return {schema:'aichi-original-own-bench-energy-move-census-v1',
    exactPublishedSixties:decks.length,scannedPokemonPrintings:checkedPokemonPrints,
    completePrintingCoverage:unresolved.length===0,unresolved,
    matches:matches.sort((a,b)=>a.rank-b.rank),
    causalInference:false,competitiveQualified:false,
    scope:'exact original printings and one printed attack-text predicate only'};
}

if(require.main===module)process.stdout.write(JSON.stringify(census(),null,2)+'\n');
module.exports={trigger,census};
