'use strict';

const VERSION='agent3-aichi-original29-source-capability-census-v1';
const BASIC_ENERGY=/^(?:Basic )?(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy$/;
const V_EVOLUTION=/\b(?:VMAX|VSTAR)\b/;

/**
 * Count three printed-name capability lower bounds from the archived Aichi
 * original 60s. Classification is deliberately card-name-only: exact paper
 * legality, turn-wise availability and play policy are different questions.
 *
 * @param {object} source Parsed results/aichi-2026/full-decklists.json
 * @returns {object} Deterministic source-only audit, no game inference.
 */
function summarizeOriginalCapabilities(source){
  if(source?.published_deck_count!==29||
     !Array.isArray(source.decks)||source.decks.length!==29)
    throw new Error('Exactly 29 authenticated original decks are required');
  const missing=source.missing_full_lists.map(x=>x.rank).sort((a,b)=>a-b);
  if(JSON.stringify(missing)!=='[23,25,28]')
    throw new Error('The incomplete original 32-entrant denominator changed');

  const observed=new Set(),rows=[];
  for(const deck of source.decks){
    if(!Number.isSafeInteger(deck.rank)||deck.rank<1||deck.rank>32||
       observed.has(deck.rank))
      throw new Error('Duplicate or invalid original rank');
    observed.add(deck.rank);
    if(!Array.isArray(deck.cards))throw new Error('Missing printed card inventory');
    let cards=0,energy=0,special=0,vEvolution=0,guzma=0;
    for(const card of deck.cards){
      if(!Number.isSafeInteger(card.count)||card.count<=0||
         typeof card.name!=='string'||typeof card.category!=='string')
        throw new Error('Invalid original printed card entry');
      cards+=card.count;
      if(card.category==='Energy'){
        energy+=card.count;
        if(!BASIC_ENERGY.test(card.name))special+=card.count;
      }
      if(card.category==='Pokémon'&&V_EVOLUTION.test(card.name))
        vEvolution+=card.count;
      if(card.category==='Trainer'&&card.name==='Guzma')
        guzma+=card.count;
    }
    if(cards!==60)throw new Error('Original printed source is not a fixed 60');
    rows.push({
      rank:deck.rank,energyCopies:energy,specialEnergyCopies:special,
      basicEnergyCopies:energy-special,
      printedVmaxOrVstarCopies:vEvolution,exactGuzmaCopies:guzma
    });
  }
  for(let rank=1;rank<=32;rank++)
    if(!observed.has(rank)&&!missing.includes(rank))
      throw new Error('Missing authenticated rank unaccounted for');
  rows.sort((a,b)=>a.rank-b.rank);
  const ranks=predicate=>rows.filter(predicate).map(row=>row.rank);
  const totals={
    energyCopies:rows.reduce((n,row)=>n+row.energyCopies,0),
    specialEnergyCopies:rows.reduce((n,row)=>n+row.specialEnergyCopies,0),
    exactGuzmaCopies:rows.reduce((n,row)=>n+row.exactGuzmaCopies,0)
  };
  return {
    version:VERSION,authenticatedOriginalDecks:rows.length,
    benchmarkFieldSize:32,missingOriginalRanks:missing,
    allAuthenticatedOriginalsHave60:true,
    withSpecialEnergy:ranks(row=>row.specialEnergyCopies>0),
    specialEnergyOnly:ranks(row=>row.energyCopies>0&&
      row.specialEnergyCopies===row.energyCopies),
    withPrintedVmaxOrVstar:ranks(row=>row.printedVmaxOrVstarCopies>0),
    withExactGuzma:ranks(row=>row.exactGuzmaCopies>0),
    ...totals,
    byRank:rows,
    nativeGamesRun:0,
    qualifiedPaperGames:0,
    claim: 'printed-card composition census only'
  };
}
module.exports={VERSION,summarizeOriginalCapabilities};
