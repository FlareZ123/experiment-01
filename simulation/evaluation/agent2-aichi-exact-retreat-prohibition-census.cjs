'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const sets=require('../../resources/sets/en.json');
const field=require('../../results/aichi-2026/full-decklists.json');

const VERSION='agent2-aichi29-exact-printing-retreat-prohibition-census-v1';
const WORDING=/(?:can't|can’t|cannot) retreat\b/i;
const cache=new Map();
const byCode=new Map();
for(const set of sets){
  if(typeof set.ptcgoCode==='string'){
    const bucket=byCode.get(set.ptcgoCode)??[];
    bucket.push(set);
    byCode.set(set.ptcgoCode,bucket);
  }
}
/**
 * Fetch a single exact official set printing from the supplied local corpus.
 * @param {object} registered Fully specified source registered card row.
 * @returns {object} Found printing, or an explicit unresolved reason.
 */
function resolvePrinting(registered){
  const printing=registered?.printing;
  const group=byCode.get(printing?.set)??[];
  if(group.length!==1){
    return {status:'unresolved-set-code',code:printing?.set,
      candidates:group.map(x=>x.id)};
  }
  const set=group[0];
  let printed=cache.get(set.id);
  if(!printed){
    const filename=path.resolve(__dirname,
      '../../resources/cards/en',set.id+'.json');
    if(!fs.existsSync(filename)){
      return {status:'missing-set-file',code:printing?.set,
        id:set.id};
    }
    printed=JSON.parse(fs.readFileSync(filename,'utf8'));
    assert.ok(Array.isArray(printed));
    cache.set(set.id,printed);
  }
  const match=printed.filter(card=>
    String(card.number)===String(printing.number));
  if(match.length!==1||match[0].name!==registered.name){
    return {status:'unresolved-exact-printing',
      code:printing.set,number:printing.number,
      names:match.map(c=>c.name),
      expectedName:registered.name};
  }
  return {status:'exact-printing',setId:set.id,card:match[0]};
}
/**
 * Exact registered opponent source Pokémon whose card printing contains an
 * Ability or attack with explicit can't-retreat text. This enumerates literal
 * wording, not all equivalent lock mechanics or always-active effects.
 * @returns {object} Failure-inclusive corpus coverage and exact matching hits.
 */
function run(){
  assert.equal(field.decks.length,29);
  const hits=[],unresolved=[],covered=[];
  for(const deck of field.decks){
    assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
    for(const row of deck.cards){
      if(row.category!=='Pokémon')continue;
      const resolved=resolvePrinting(row);
      if(resolved.status!=='exact-printing'){
        unresolved.push({rank:deck.rank,archetype:deck.archetype,
          name:row.name,count:row.count,printing:row.printing,
          ...resolved});
        continue;
      }
      covered.push({rank:deck.rank,name:row.name,count:row.count,
        setId:resolved.setId,cardId:resolved.card.id});
      const card=resolved.card;
      for(const category of ['attacks','abilities']){
        for(const ability of card[category]??[]){
          if(!WORDING.test(ability.text??''))continue;
          hits.push({
            rank:deck.rank,archetype:deck.archetype,
            name:row.name,count:row.count,
            set:row.printing.set,number:row.printing.number,
            cardId:card.id,category,nameOfEffect:ability.name,
            text:ability.text,
            classification:category==='abilities'?
              'potential-continuous-ability-lock':
              'potential-attack-imposed-temporary-lock'
          });
        }
      }
    }
  }
  const ranks=[...new Set(hits.map(x=>x.rank))].sort((a,b)=>a-b);
  return {
    version:VERSION,originalSourceDecks:field.decks.length,
    originalRankIds:field.decks.map(d=>d.rank).sort((a,b)=>a-b),
    registeredPokemonRows:covered.length+unresolved.length,
    exactPokemonRows:covered.length,unresolvedPokemonRows:unresolved.length,
    exactRetreatProhibitionHits:hits.length,
    sourceDeckRanksWithLiteralProhibition:ranks,
    hits,unresolved,
    caveat:'Literal exact-printing text only; attack lock requires prior attack, Abilities depend on board, suppression and other rules. Three original full decklists missing, zero paper-qualified games.'
  };
}
if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result)+'\n');
  if(result.unresolvedPokemonRows>0)process.exitCode=1;
}
module.exports={VERSION,WORDING,resolvePrinting,run};
