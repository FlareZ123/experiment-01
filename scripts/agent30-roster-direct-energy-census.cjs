'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {assessDirectEnergy,VERSION:ENERGY_VERSION}=
  require('../simulation/twinleaf/agent30-source-attack-energy-reachability.cjs');
const VERSION='agent30-original-roster-direct-energy-census-v1';
const ROOT=path.resolve(__dirname,'..');
const BARE_PROMOS={SMP:'smp',XYP:'xyp'};

/** @param {string} name @returns {string} */
function normalizeName(name){return String(name).replaceAll('♢','◇').trim();}

/**
 * Resolve exact printing set and number, not just Pokémon name. Absence is
 * preserved as missing evidence instead of a guessed equivalent printing.
 * @param {object} printing Original roster's set+collector number.
 * @param {string} name Original roster card name.
 * @param {object[]} sets Exact English card-database set rows.
 * @param {(setId:string)=>object[]} readCards Exact locally bundled set file.
 * @returns {object|null}
 */
function sourcePrintedCard(printing,name,sets,readCards){
  const ids=sets.filter(x=>x.ptcgoCode===printing.set).map(x=>x.id);
  if(BARE_PROMOS[printing.set])ids.push(BARE_PROMOS[printing.set]);
  const candidates=[];
  for(const id of ids){
    for(const card of readCards(id)){
      const number=String(card.number??'');
      const canonicalNumber=number.replace(/^(SM|XY)/,'');
      if((number===String(printing.number)||
         canonicalNumber===String(printing.number))&&
        normalizeName(card.name)===normalizeName(name))candidates.push(card);
    }
  }
  // Normal set+exact collector number should select one card. Some gallery
  // IDs may have duplicate displays, so never silently guess from a name.
  return candidates.length===1?candidates[0]:null;
}

/**
 * Literal consecutive normal evolution route from some included Basic.
 * Rare Candy, Ditto, attacks and other exceptional effects are excluded.
 * @param {object} pokemon Exact resolved source printing.
 * @param {object[]} sourcePokemon Exact source printings, possibly null.
 * @param {Set<string>} [visited]
 * @returns {boolean}
 */
function hasNormalEvolutionChain(pokemon,sourcePokemon,visited=new Set()){
  if(pokemon?.subtypes?.[0]==='Basic')return true;
  if(!pokemon?.evolvesFrom||visited.has(pokemon.name))return false;
  const parents=sourcePokemon.filter(card=>
    card?.name===pokemon.evolvesFrom);
  const nextVisited=new Set(visited).add(pokemon.name);
  return parents.some(parent=>hasNormalEvolutionChain(parent,sourcePokemon,
    nextVisited));
}

/**
 * Census of ordinary printed attack funding under complete registered Energy
 * roster. It ignores evolving/copying attacks, switching, time, prizes, tool
 * modifiers, discarded attack payloads, and policy choices deliberately.
 * @param {object[]} decks Source original 60 cards grouped by rank.
 * @param {object[]} sets English card metadata sets.
 * @param {(setId:string)=>object[]} readCards
 * @returns {object}
 */
function directRosterCensus(decks,sets,readCards){
  assert.ok(Array.isArray(decks)&&Array.isArray(sets));
  const rows=[];
  const sourceRanks=[];
  for(const deck of decks){
    assert.ok(Number.isSafeInteger(deck.rank));
    sourceRanks.push(deck.rank);
    const energy=deck.cards.filter(c=>c.category==='Energy').map(c=>({
      name:c.name,count:c.count
    }));
    const sourcePokemon=deck.cards.filter(c=>c.category==='Pokémon')
      .map(c=>sourcePrintedCard(c.printing,c.name,sets,readCards));
    for(const entry of deck.cards.filter(c=>c.category==='Pokémon')){
      const card=sourcePrintedCard(entry.printing,entry.name,sets,readCards);
      const attacks=card?.attacks??[];
      const perAttack=attacks.map(attack=>({name:attack.name,
        cost:attack.cost,
        assessment:assessDirectEnergy({types:card.types,
          stage:card.subtypes[0]},attack.cost,energy)}));
      const states=perAttack.map(a=>a.assessment.status);
      const status=!card?'PRINTING_UNRESOLVED':
        attacks.length===0?'NO_PRINTED_ATTACK':
        states.includes('POSSIBLE')?'POSSIBLE':
        states.includes('UNVERIFIED')?'UNVERIFIED':'IMPOSSIBLE';
      const normalEvolution=!card?'PRINTING_UNRESOLVED':
        hasNormalEvolutionChain(card,sourcePokemon)?'NORMAL_CHAIN_PRESENT':
        'NO_CONSECUTIVE_CHAIN';
      rows.push({rank:deck.rank,printing:
        entry.printing.set+'-'+entry.printing.number,
        name:entry.name,count:entry.count,status,normalEvolution,attacks:perAttack});
    }
  }
  const statuses=['POSSIBLE','IMPOSSIBLE','UNVERIFIED',
    'PRINTING_UNRESOLVED','NO_PRINTED_ATTACK'];
  const summary=Object.fromEntries(statuses.map(status=>[status,{
    printingRankRows:rows.filter(x=>x.status===status).length,
    physicalCopies:rows.filter(x=>x.status===status)
      .reduce((n,x)=>n+x.count,0)
  }]));
  const normalEvolution=Object.fromEntries(
    ['NORMAL_CHAIN_PRESENT','NO_CONSECUTIVE_CHAIN','PRINTING_UNRESOLVED']
      .map(status=>[status,{physicalCopies:rows.filter(x=>
        x.normalEvolution===status).reduce((n,x)=>n+x.count,0)}]));
  const normalUnreachableThoughEnergyPossible=rows.filter(x=>
    x.status==='POSSIBLE'&&x.normalEvolution==='NO_CONSECUTIVE_CHAIN');
  return {version:VERSION,energyVersion:ENERGY_VERSION,
    normalEvolution,normalUnreachableThoughEnergyPossibleCopies:
      normalUnreachableThoughEnergyPossible.reduce((n,x)=>n+x.count,0),
    sourceRanks,sourceDeckCount:decks.length,
    sourcePokemonPhysicalCopies:rows.reduce((n,x)=>n+x.count,0),
    summary,rows};
}

/** @param {string} root */
function censusFromRepository(root=ROOT){
  const source=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const sets=JSON.parse(fs.readFileSync(path.join(root,
    'resources/sets/en.json'),'utf8'));
  const cache=new Map();
  const readCards=setId=>{
    if(!cache.has(setId)){
      const file=path.join(root,'resources/cards/en',setId+'.json');
      cache.set(setId,fs.existsSync(file)?
        JSON.parse(fs.readFileSync(file,'utf8')):[]);
    }
    return cache.get(setId);
  };
  const result=directRosterCensus(source.decks,sets,readCards);
  return {...result,sourceSchema:source.schema??null,
    knownOriginalSourceDecks:source.published_deck_count??null,
    unresolvedFinalRanks:source.missing_full_lists??null};
}

if(require.main===module){
  process.stdout.write(JSON.stringify(censusFromRepository(),null,2)+'\n');
}
module.exports={VERSION,normalizeName,sourcePrintedCard,hasNormalEvolutionChain,directRosterCensus,
  censusFromRepository};
