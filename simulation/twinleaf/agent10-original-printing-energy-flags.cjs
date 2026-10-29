'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const VERSION='agent10-original-printing-energy-recipient-flags-v1';

/**
 * Rule Box and evolution state must come from a printed Pokémon definition.
 * Pokémon V is a Rule-Box Pokémon but is not Pokémon-GX or Pokémon-EX.
 * Reversal and Counter therefore ask different questions.
 *
 * @param {object} card Exact Pokémon card JSON entry from resources/cards/en.
 * @returns {{printingId:string,name:string,isEvolution:boolean,
 *   hasRuleBox:boolean,isPokemonGX:boolean,isPokemonEX:boolean}}
 */
function classifyPrintedPokemon(card){
  assert.equal(card?.supertype,'Pokémon');
  const subtypes=new Set(card.subtypes??[]);
  const isEvolution=subtypes.has('Stage 1')||subtypes.has('Stage 2')||
    subtypes.has('VMAX')||subtypes.has('VSTAR')||
    subtypes.has('BREAK')||subtypes.has('MEGA')||
    Boolean(card.evolvesFrom);
  const rules=card.rules??[];
  assert.ok(Array.isArray(rules));
  return {printingId:card.id,name:card.name,isEvolution,
    hasRuleBox:rules.length>0,
    isPokemonGX:subtypes.has('GX'),
    isPokemonEX:subtypes.has('EX')};
}

/**
 * Resolve original Aichi EN source printing by its actual source set code and
 * collector number. Never accept a same-name replacement print without a
 * matching immutable set-number identity.
 *
 * @param {string} root Research repo root.
 * @param {object} sourceCard Exact source deck entry.
 * @param {object} [cache] Optional reused parsed set JSON cache.
 * @returns {ReturnType<typeof classifyPrintedPokemon>}
 */
function originalPrintedPokemon(root,sourceCard,cache={}){
  assert.equal(sourceCard.category,'Pokémon');
  const code=sourceCard.printing?.set;
  const number=sourceCard.printing?.number;
  assert.equal(sourceCard.printing?.language,'en');
  assert.ok(typeof code==='string'&&typeof number==='string');
  if(!cache.setCodeToIds){
    const setEntries=JSON.parse(fs.readFileSync(
      path.resolve(root,'resources/sets/en.json'),'utf8'));
    cache.setCodeToIds=new Map();
    for(const item of setEntries){
      if(!item.ptcgoCode)continue;
      const ids=cache.setCodeToIds.get(item.ptcgoCode)??[];
      ids.push(item.id);
      cache.setCodeToIds.set(item.ptcgoCode,ids);
    }
  }
  const setIds=cache.setCodeToIds.get(code)??[];
  assert.ok(setIds.length>0,'No exact English source set for '+code);
  if(!cache.cardsBySet)cache.cardsBySet=new Map();
  const candidates=[];
  const normalize=name=>name.replaceAll('♢','◇');
  for(const setId of setIds){
    if(!cache.cardsBySet.has(setId)){
      const filename=path.resolve(root,'resources/cards/en',setId+'.json');
      const entries=JSON.parse(fs.readFileSync(filename,'utf8'));
      cache.cardsBySet.set(setId,
        new Map(entries.map(card=>[card.id,card])));
    }
    const id=setId+'-'+number;
    const card=cache.cardsBySet.get(setId).get(id);
    if(card&&normalize(card.name)===normalize(sourceCard.name))
      candidates.push(card);
  }
  assert.equal(candidates.length,1,
    'Printed identity must resolve uniquely: '+sourceCard.name+
      ' '+code+' '+number+', matches='+candidates.length);
  return classifyPrintedPokemon(candidates[0]);
}

/**
 * Use only an already exposed, exact printed Pokémon and public Prize counts
 * to construct conditional-Special-Energy inputs. This helper cannot see a
 * concealed Prize identity or opponent hand.
 *
 * @param {object} ownPublic Pokemon attached recipient visible on board.
 * @param {object} opponentPublic Opponent public board.
 * @param {object} printedProfile Exact printed Pokémon metadata.
 * @returns {object} Input for conditional Energy model.
 */
function energyContextFromPublic(ownPublic,opponentPublic,printedProfile){
  assert.ok(Number.isInteger(ownPublic.prizeCount));
  assert.ok(Number.isInteger(opponentPublic.prizeCount));
  return {
    ownerPrizes:ownPublic.prizeCount,
    opponentPrizes:opponentPublic.prizeCount,
    isEvolution:printedProfile.isEvolution,
    hasRuleBox:printedProfile.hasRuleBox,
    isPokemonGX:printedProfile.isPokemonGX,
    isPokemonEX:printedProfile.isPokemonEX,
    templeOfSinnoh:[
      ...(ownPublic.stadium??[]),...(opponentPublic.stadium??[])
    ].some(printing=>printing.startsWith('Temple of Sinnoh '))
  };
}

module.exports={VERSION,classifyPrintedPokemon,originalPrintedPokemon,
  energyContextFromPublic};
