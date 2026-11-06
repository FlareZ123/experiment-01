'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const sets=require('../../resources/sets/en.json');
const field=require('../../results/aichi-2026/full-decklists.json');

const VERSION='agent2-aichi29-exact-printing-retreat-prohibition-census-v3';
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
  const group=byCode.get(printing?.set)??sets.filter(set=>set.id===String(printing?.set??'').toLowerCase());
  if(group.length===0){
    return {status:'unresolved-set-code',code:printing?.set,candidates:[]};
  }
  const numbered=[];
  const missing=[];
  for(const set of group){
    let printed=cache.get(set.id);
    if(!printed){
      const filename=path.resolve(__dirname,
        '../../resources/cards/en',set.id+'.json');
      if(!fs.existsSync(filename)){
        missing.push(set.id);
        continue;
      }
      printed=JSON.parse(fs.readFileSync(filename,'utf8'));
      assert.ok(Array.isArray(printed));
      cache.set(set.id,printed);
    }
    for(const card of printed){
      const promoPrefix=set.id==='xyp'?'XY':set.id==='smp'?'SM':null;
      if(String(card.number)===String(printing.number)||
        (promoPrefix&&String(card.number)===promoPrefix+String(printing.number))){
        numbered.push({setId:set.id,card});
      }
    }
  }
  if(missing.length){
    return {status:'missing-set-files',code:printing.set,missing};
  }
  const normalizePrismName=name=>String(name).replaceAll('♢','◇');
  const exact=numbered.filter(x=>
    normalizePrismName(x.card.name)===normalizePrismName(registered.name));
  if(exact.length===1){
    return {status:'exact-printing',setId:exact[0].setId,
      card:exact[0].card};
  }
  if(exact.length>1){
    return {status:'ambiguous-exact-printing',code:printing.set,
      number:printing.number,matchingIds:exact.map(x=>x.card.id)};
  }
  return {status:'unresolved-exact-printing',
    code:printing.set,number:printing.number,
    names:numbered.map(x=>x.card.name),
    candidateIds:numbered.map(x=>x.card.id),
    expectedName:registered.name};
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
