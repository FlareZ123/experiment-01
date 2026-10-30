'use strict';

const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {loadTrainerTypes}=require('./agent3-jellicent-field-exposure.cjs');

/**
 * Exact authenticated print-only classification. Counts slots with an
 * Item/Tool play prohibited by Active Jellicent ex and Basic Pokemon whose
 * Abilities Silent Lab suppresses, without equating the latter to unplayable
 * cards. Classification is by source set-code+printed number, not name
 * matching alone. A source Prism Star diamond is a cosmetic alias only.
 *
 * @param {string} repositoryRoot
 * @returns {{rank:number,items:number,tools:number,basicWithAbilities:number,
 *   otherPokemon:number,stadiums:number,supporters:number,energy:number,
 *   totalAffectedCategories:number,abilities:Array<{name:string,count:number,
 *   printing:string,abilities:string[]}>}}
 */
function rank26PrintedExposure(repositoryRoot){
  const root=path.resolve(repositoryRoot);
  const manifest=JSON.parse(fs.readFileSync(path.join(root,
    'results','aichi-2026','full-decklists.json'),'utf8'));
  const source=manifest.decks.find(d=>d.rank===26);
  assert.ok(source,'missing authenticated source rank26');
  assert.equal(source.archetype,'Meloetta Donk');
  const sets=JSON.parse(fs.readFileSync(path.join(root,
    'resources','sets','en.json'),'utf8'));
  const setsByCode=new Map(sets.filter(s=>s.ptcgoCode).map(
    s=>[s.ptcgoCode,s.id]));
  const cardsBySet=new Map();
  const trainerTypes=loadTrainerTypes(path.join(root,
    'resources','cards','en'));
  const counts={items:0,tools:0,basicWithAbilities:0,
    otherPokemon:0,stadiums:0,supporters:0,energy:0};
  const abilities=[];
  for(const slot of source.cards){
    if(slot.category==='Energy'){
      counts.energy+=slot.count;continue;
    }
    if(slot.category==='Trainer'){
      const type=trainerTypes.get(slot.name);
      assert.ok(type,`Unclassified Trainer ${slot.name}`);
      const key=type==='Pokémon Tool'?'tools':type==='Item'?'items':
        type==='Stadium'?'stadiums':type==='Supporter'?'supporters':null;
      assert.ok(key,`Unsupported Trainer type ${type}`);
      counts[key]+=slot.count;continue;
    }
    assert.equal(slot.category,'Pokémon');
    const set=setsByCode.get(slot.printing?.set);
    assert.ok(set,`Unknown source Pokémon set ${slot.printing?.set}`);
    if(!cardsBySet.has(set))cardsBySet.set(set,JSON.parse(
      fs.readFileSync(path.join(root,'resources','cards','en',
        `${set}.json`),'utf8')));
    const card=cardsBySet.get(set).find(c=>
      c.number===slot.printing.number);
    assert.ok(card,`Missing source Pokémon print ${set}-${slot.printing.number}`);
    assert.equal(card.name.replaceAll('◇','♢'),slot.name,
      `Printed Pokémon name differs: ${card.id}`);
    assert.ok(card.subtypes.includes('Basic'),
      `Source rank26 unexpectedly non-Basic: ${card.id}`);
    if((card.abilities??[]).length){
      counts.basicWithAbilities+=slot.count;
      abilities.push({name:slot.name,count:slot.count,
        printing:`${slot.printing.set}${slot.printing.number}`,
        abilities:card.abilities.map(x=>x.name)});
    }else counts.otherPokemon+=slot.count;
  }
  const total=Object.values(counts).reduce((a,b)=>a+b,0);
  assert.equal(total,60,'Source deck no longer consists of 60 cards');
  return {rank:26,...counts,
    totalAffectedCategories:counts.items+counts.tools+
      counts.basicWithAbilities,abilities};
}

module.exports={rank26PrintedExposure};
if(require.main===module){
  const root=path.resolve(__dirname,'..');
  process.stdout.write(JSON.stringify(rank26PrintedExposure(root),null,2)+'\n');
}
