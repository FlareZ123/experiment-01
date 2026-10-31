'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'../..');
const ONCE_USE=/\bonce during your (?:first )?turn\b|you can.t use more than 1/i;

/**
 * Read the supplied exact Aichi source list and bundled English card records.
 * This measures printed wording, not native Ability availability.
 * @param {string} [root] Repository root.
 * @returns {object} Reproducible original-source incidence report.
 */
function scanOriginalField(root=ROOT){
  const source=JSON.parse(fs.readFileSync(
    path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
  const sets=JSON.parse(fs.readFileSync(
    path.join(root,'resources/sets/en.json'),'utf8'));
  const ids=new Map();
  for(const set of sets){
    if(typeof set.ptcgoCode!=='string')continue;
    const found=ids.get(set.ptcgoCode)??[];
    found.push(set.id);
    ids.set(set.ptcgoCode,found);
  }
  ids.set('SMP',['smp']);
  ids.set('XYP',['xyp']);
  const loaded=new Map();
  /** @param {string} id Set identifier. */
  const getSet=id=>{
    if(!loaded.has(id)){
      loaded.set(id,JSON.parse(fs.readFileSync(
        path.join(root,'resources/cards/en',id+'.json'),'utf8')));
    }
    return loaded.get(id);
  };
  /** @param {object} printing Original manifest's exact English printing. */
  const resolve=printing=>{
    const prefix={SMP:'SM',XYP:'XY'}[printing.set]??'';
    const number=prefix+String(printing.number);
    const matches=(ids.get(printing.set)??[])
      .flatMap(id=>getSet(id).filter(card=>String(card.number)===number));
    assert.equal(matches.length,1,
      'Non-unique source Pokémon '+printing.set+' '+number);
    return matches[0];
  };

  const unique=new Set(),perRank={},relevant=new Map();
  let pokemonRows=0,pokemonCopies=0;
  for(const deck of source.decks){
    let count=0;
    for(const row of deck.cards){
      if(row.category!=='Pokémon')continue;
      pokemonRows++;
      pokemonCopies+=row.count;
      const card=resolve(row.printing);
      unique.add(card.id);
      if((card.abilities??[]).some(x=>ONCE_USE.test(x.text??''))){
        count+=row.count;
        const detail=relevant.get(card.id)??{
          id:card.id,name:card.name,sourceCopies:0,ranks:[]
        };
        detail.sourceCopies+=row.count;
        detail.ranks.push(deck.rank);
        relevant.set(card.id,detail);
      }
    }
    perRank[deck.rank]=count;
  }
  return {
    schema:'agent8-source-public-ability-use-text-v1',
    sourceDecks:source.decks.length,pokemonRows,pokemonCopies,
    uniquePokemonPrintings:unique.size,
    onceUseTextPrintings:relevant.size,
    onceUseTextCopies:[...relevant.values()].reduce(
      (sum,card)=>sum+card.sourceCopies,0),
    onceUseTextRanks:Object.values(perRank).filter(x=>x>0).length,
    perRank,sourceCards:[...relevant.values()].sort(
      (a,b)=>b.sourceCopies-a.sourceCopies||a.id.localeCompare(b.id)),
    caveat:'Printed text incidence only; does not establish usable native actions or competitive wins.'
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(scanOriginalField(),null,2)+'\n');

module.exports={ONCE_USE,scanOriginalField};
