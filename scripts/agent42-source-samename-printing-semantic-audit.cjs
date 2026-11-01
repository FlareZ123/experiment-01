'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const source=require('../results/aichi-2026/full-decklists.json');

/** @returns {Map<string,string[]>} */
function setCodeIndex(){
  const sets=JSON.parse(fs.readFileSync(
    path.join(root,'resources/sets/en.json'),'utf8'));
  const m=new Map();
  for(const s of sets){
    if(!s.ptcgoCode)continue;
    const a=m.get(s.ptcgoCode)||[];
    a.push(s.id);
    m.set(s.ptcgoCode,a);
  }
  return m;
}

/**
 * Resolve immutable EN printing without falling back to a same-name card.
 * @param {{name:string,printing:{set:string,number:string}}} entry
 * @param {Map<string,string[]>} sets
 * @param {Map<string,Map<string,object>>} cache
 */
function exactCard(entry,sets,cache){
  const code=entry.printing.set,number=entry.printing.number;
  const setIds=sets.get(code)||[];
  const found=[];
  for(const id of setIds){
    if(!cache.has(id)){
      const cards=JSON.parse(fs.readFileSync(
        path.join(root,'resources/cards/en',id+'.json'),'utf8'));
      cache.set(id,new Map(cards.map(c=>[c.id,c])));
    }
    const c=cache.get(id).get(id+'-'+number);
    if(c?.name===entry.name)found.push(c);
  }
  assert.equal(found.length,1,
    'Cannot resolve exact published Pokemon printing '+entry.name+
    ' '+code+' '+number);
  return found[0];
}

/** @param {object} card */
function semanticSignature(card){
  return JSON.stringify({
    hp:card.hp,
    evolvesFrom:card.evolvesFrom||null,
    abilities:(card.abilities||[]).map(a=>[a.name,a.text]),
    attacks:(card.attacks||[]).map(a=>
      [a.name,a.cost,a.damage,a.text])
  });
}

function run(){
  const registry=new Map();
  const mixedWithinDeck=[];
  for(const d of source.decks){
    const seen=new Map();
    for(const entry of d.cards.filter(c=>c.category==='Pokémon')){
      const print=entry.printing.set+' '+entry.printing.number;
      const names=registry.get(entry.name)||new Map();
      const owners=names.get(print)||[];
      owners.push({rank:d.rank,count:entry.count,entry});
      names.set(print,owners);
      registry.set(entry.name,names);
      const local=seen.get(entry.name)||[];
      local.push(print);
      seen.set(entry.name,local);
    }
    for(const [name,prints] of seen)
      if(new Set(prints).size>1)
        mixedWithinDeck.push({rank:d.rank,name,printings:prints});
  }
  const sets=setCodeIndex(),cache=new Map();
  const variants=[];
  for(const [name,prints] of registry){
    if(prints.size<2)continue;
    const cards=[...prints].map(([printing,owners])=>{
      const c=exactCard(owners[0].entry,sets,cache);
      return {
        printing,sourceRanks:owners.map(o=>o.rank),
        sourceCopies:owners.reduce((sum,o)=>sum+o.count,0),
        hp:c.hp,abilityNames:(c.abilities||[]).map(a=>a.name),
        attackNames:(c.attacks||[]).map(a=>a.name),
        semanticSignature:semanticSignature(c)
      };
    });
    variants.push({name,printingCount:cards.length,
      distinctSemantics:new Set(cards.map(c=>c.semanticSignature)).size,
      printings:cards.map(({semanticSignature,...rest})=>rest)});
  }
  variants.sort((a,b)=>a.name.localeCompare(b.name));
  return {
    schema:'agent42-source-samename-printing-semantic-audit-v1',
    sourceOriginalSixties:source.decks.length,
    namesWithMultipleSourcePrintings:variants.length,
    variants,
    mixedWithinDeck:mixedWithinDeck.sort((a,b)=>a.rank-b.rank),
    qualifiedCompetitiveGames:0,
    caution:'Printed semantic diversity is not a proven policy or simulator error.'
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={setCodeIndex,exactCard,semanticSignature,run};
