'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');

/**
 * Exact printed Pokémon inventory potential under Iron Thorns ex TWM77
 * Initialization. Inventory eligibility never implies live suppression.
 * @param {object} field
 * @param {object[]} sets
 * @param {(id:string)=>object[]} readCards
 * @returns {object}
 */
function audit(field,sets,readCards){
  assert.equal(field.decks.length,field.published_deck_count);
  const codeMap=new Map();
  for(const set of sets){
    if(!set.ptcgoCode)continue;
    if(!codeMap.has(set.ptcgoCode))codeMap.set(set.ptcgoCode,[]);
    codeMap.get(set.ptcgoCode).push(set.id);
  }
  codeMap.set('SMP',['smp']);
  codeMap.set('XYP',['xyp']);
  const loaded=new Map();
  const rows=field.decks.map(deck=>{
    assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
    let eligible=0,eligibleBasic=0,ordinary=0,future=0;
    const matches=[];
    for(const entry of deck.cards.filter(c=>c.category==='Pokémon')){
      const code=entry.printing.set;
      const ids=codeMap.get(code);
      assert.ok(ids?.length,'Unknown set '+code);
      const number=(code==='SMP'?'SM':code==='XYP'?'XY':'')+
        entry.printing.number;
      const printed=ids.flatMap(id=>{
        if(!loaded.has(id))loaded.set(id,readCards(id));
        return loaded.get(id).filter(c=>
          c.number===number&&c.name.replaceAll('♢','◇')===entry.name.replaceAll('♢','◇'));
      });
      assert.equal(printed.length,1,
        'Missing or ambiguous '+deck.rank+' '+entry.name+' '+code+' '+number);
      const card=printed[0];
      if(!card.abilities?.length)continue;
      if(!card.rules?.length){ordinary+=entry.count;continue;}
      if(card.subtypes.includes('Future')){future+=entry.count;continue;}
      eligible+=entry.count;
      if(card.subtypes.includes('Basic'))eligibleBasic+=entry.count;
      matches.push({name:card.name,set:code,number:entry.printing.number,
        count:entry.count,abilities:card.abilities.map(a=>a.name)});
    }
    return {rank:deck.rank,archetype:deck.archetype,eligible,
      eligibleBasic,ordinary,future,matches};
  });
  return {schema:'aichi-initialization-static-potential-v1',
    published:rows.length,
    missing:field.missing_full_lists.map(x=>x.rank),
    noTarget:rows.filter(x=>x.eligible===0).map(x=>x.rank),
    evolutionOnly:rows.filter(x=>x.eligible>0&&x.eligibleBasic===0)
      .map(x=>x.rank),
    basicPossible:rows.filter(x=>x.eligibleBasic>0).map(x=>x.rank),
    competitiveQualifiedGames:0,rows};
}

/** @param {string} [root] @returns {object} */
function run(root=path.resolve(__dirname,'..')){
  const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
  return audit(load('results/aichi-2026/full-decklists.json'),
    load('resources/sets/en.json'),
    id=>load('resources/cards/en/'+id+'.json'));
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={audit,run};
