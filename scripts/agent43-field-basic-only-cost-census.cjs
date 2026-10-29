'use strict';

const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');

const root=path.resolve(__dirname,'..');
const BASIC_NAMES=[
  'Grass Energy','Fire Energy','Water Energy','Lightning Energy',
  'Psychic Energy','Fighting Energy','Darkness Energy',
  'Metal Energy','Fairy Energy'
];
const basicTypes=new Set(BASIC_NAMES.map(x=>x.replace(/ Energy$/,'')));
const SETS=path.join(root,'resources/sets/en.json');
const CARDS=path.join(root,'resources/cards/en');
const FIELD=path.join(root,'results/aichi-2026/full-decklists.json');

const bySet=new Map();

/**
 * Use only the exact original collection number and set code; decline a
 * printing when the corpus lacks it or when two hits remain ambiguous.
 *
 * @param {object} printing Row from the exact public 60.
 * @param {object[]} sets Source set metadata.
 * @returns {object|null} Exact original English card record or null.
 */
function resolvePrintedCard(printing,sets){
  const ids=sets.filter(s=>s.ptcgoCode===printing.printing.set)
    .map(s=>s.id);
  const matches=[];
  for(const id of ids){
    const file=path.join(CARDS,id+'.json');
    if(!fs.existsSync(file))continue;
    if(!bySet.has(id))bySet.set(id,JSON.parse(fs.readFileSync(file,'utf8')));
    for(const card of bySet.get(id)){
      if(card.number===printing.printing.number&&
         card.name===printing.name)matches.push(card);
    }
  }
  return matches.length===1?matches[0]:null;
}

/** @param {object} deck Exact original registered deck. @param {object[]} sets */
function auditDeckBasicSupply(deck,sets){
  const size=deck.cards.reduce((sum,c)=>sum+c.count,0);
  assert.equal(size,60,'Original list must remain physically 60');
  const basic=deck.cards.filter(c=>BASIC_NAMES.includes(c.name))
    .map(c=>({name:c.name,type:c.name.replace(/ Energy$/,''),count:c.count}));
  const otherEnergies=deck.cards.filter(c=>c.name.endsWith(' Energy')&&
    !BASIC_NAMES.includes(c.name))
    .map(c=>({name:c.name,count:c.count}));
  const supply=new Map(basic.map(x=>[x.type,x.count]));
  const shortfalls=[],unresolvedPokemon=[];
  let resolvedPokemonPrintings=0,sourcePokemonPrintings=0;
  for(const row of deck.cards){
    const resolved=resolvePrintedCard(row,sets);
    if(!resolved){
      // Any source whose card naming looks like a Pokémon and whose printing
      // cannot be resolved is excluded from this card-text analysis, rather
      // than guessed from another print.
      if(!row.name.endsWith(' Energy'))unresolvedPokemon.push(row.name+' '+row.printing.set);
      continue;
    }
    if(resolved.supertype!=='Pokémon')continue;
    sourcePokemonPrintings++;
    resolvedPokemonPrintings++;
    if(otherEnergies.length)continue;
    for(const attack of resolved.attacks??[]){
      const needed=new Map();
      for(const type of attack.cost??[]){
        if(type==='Colorless')continue;
        if(!basicTypes.has(type)){
          needed.set(type,(needed.get(type)??0)+1);
          continue;
        }
        needed.set(type,(needed.get(type)??0)+1);
      }
      const impossible=[...needed.entries()].filter(([type,count])=>
        (supply.get(type)??0)<count).map(([type,count])=>({
          type,printedRequired:count,registeredBasicCount:supply.get(type)??0
        }));
      if(impossible.length)shortfalls.push({
        pokemon:resolved.name,printing:row.printing,
        copies:row.count,attack:attack.name,
        cost:attack.cost,missing:impossible
      });
    }
  }
  return {
    rank:deck.rank,player:deck.player,archetype:deck.archetype,
    source60Count:size,
    basicEnergySupply:basic,otherEnergies,
    basicOnlyEnergyModel:otherEnergies.length===0,
    sourcePokemonPrintings,resolvedPokemonPrintings,
    unresolvedCardPrintings:unresolvedPokemon.length,
    shortfalls:otherEnergies.length?[]:shortfalls,
    pureStructuralAuditOnly:true,competitiveGameQualified:false
  };
}

/** Inspect all printed 60s without claiming an inferred decklist for ranks missing one. */
function auditPublicField(){
  const field=JSON.parse(fs.readFileSync(FIELD,'utf8'));
  const sets=JSON.parse(fs.readFileSync(SETS,'utf8'));
  const rows=field.decks.map(deck=>auditDeckBasicSupply(deck,sets));
  return {
    audit:'agent43-basic-only-printed-attack-supply-field-v1',
    deckCount:rows.length,
    basicOnlyCount:rows.filter(x=>x.basicOnlyEnergyModel).length,
    omittedFromZeroSpecialModel:rows.filter(x=>!x.basicOnlyEnergyModel).length,
    observedShortfallRanks:rows.filter(x=>x.shortfalls.length).map(x=>x.rank),
    rows,competitiveGameQualified:false,
    scope:'Basic-only printed attacks and exact English card matching; card effects unmodeled'
  };
}

if(require.main===module){
  process.stdout.write(JSON.stringify(auditPublicField(),null,2)+'\n');
}
module.exports={resolvePrintedCard,auditDeckBasicSupply,auditPublicField};
