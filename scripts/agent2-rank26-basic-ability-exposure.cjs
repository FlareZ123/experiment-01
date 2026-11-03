'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const PRINTS=Object.freeze({
 'Unown':{set:'AOR',number:'30',id:'xy7-30'},
 'Exeggcute':{set:'PLF',number:'4',id:'bw9-4'},
 'Meloetta ex':{set:'BLK',number:'44',id:'zsv10pt5-44'},
 'Tapu Koko ◇':{set:'TEU',number:'51',id:'sm9-51'},
 'Bunnelby':{set:'PRC',number:'121',id:'xy5-121'},
 'Squawkabilly ex':{set:'PAL',number:'169',id:'sv2-169'},
 'Crobat V':{set:'DAA',number:'104',id:'swsh3-104'},
 'Dedenne-GX':{set:'UNB',number:'57',id:'sm10-57'}
});

/**
 * Fail-closed lookup of an exact English print in provided card pool.
 * Japanese event print validity and runtime ability implementations differ.
 *
 * @param {string} root
 * @param {string} id
 * @returns {object}
 */
function printedCard(root,id){
 const [family,number]=id.split('-');
 const cards=JSON.parse(fs.readFileSync(
   path.join(root,'resources','cards','en',family+'.json'),'utf8'));
 const match=cards.filter(x=>x.id===id&&x.number===number);
 assert.equal(match.length,1,'Missing or ambiguous original '+id);
 return match[0];
}

/**
 * Audit original rank26 source Basic-Ability *susceptibility* to
 * SM1 Alolan Muk Power of Alchemy, independent of game-state playability.
 *
 * @param {object} original Original Aichi full-decklists.json content.
 * @param {string} root Repository root.
 * @returns {object} All original Basic ability-bearing printed copies.
 */
function rank26Exposure(original,root){
 const deck=original.decks.find(d=>Number(d.rank)===26);
 assert.equal(deck?.archetype,'Meloetta Donk');
 assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
 const pokerows=deck.cards.filter(c=>c.category==='Pokémon');
 assert.equal(pokerows.length,8);
 let basicCopies=0,abilityCopies=0;
 const rows=[];
 for(const item of pokerows){
  const source=PRINTS[item.name];
  assert.ok(source,'Unknown rank26 Pokémon '+item.name);
  assert.equal(item.printing.set,source.set);
  assert.equal(item.printing.number,source.number);
  const print=printedCard(root,source.id);
  assert.equal(print.name,item.name);
  assert.ok(print.subtypes.includes('Basic'),source.id+' not Basic');
  assert.equal(item.count>0,true);
  basicCopies+=item.count;
  assert.ok(Array.isArray(print.abilities)||!print.abilities);
  const abilities=(print.abilities??[]).map(x=>x.name);
  assert.ok(abilities.length<=1);
  if(abilities.length>0)abilityCopies+=item.count;
  rows.push({name:item.name,originalPrint:item.printing.set+' '+item.printing.number,
    sourceCardId:source.id,copies:item.count,isBasic:true,
    basicAbilityNames:abilities,
    suppressedByMukWhenEffectActive:abilities.length>0,
    inPlayOrHandOrDiscardSusceptibility:abilities.length>0});
 }
 assert.equal(basicCopies,12);
 assert.equal(abilityCopies,11);
 assert.equal(rows.filter(x=>x.basicAbilityNames.length).length,7);
 assert.deepEqual(rows.filter(x=>!x.basicAbilityNames.length).map(x=>x.name),
   ['Bunnelby']);
 return {schema:'agent2-original-rank26-basic-ability-exposure-v1',
  sourceRank:26,sourceTotalCards:60,sourceBasicCopies:12,
  sourceBasicCopiesWithAbility:11,sourceDistinctBasicAbilityNames:7,
  excludingBasicBunnelby:{copies:1,ancientTraitIsNotAbility:true},
  abilityRows:rows,
  scope:'printed-card susceptibility only; state, active Muk and options to suppress Muk not established',
  qualifiedCompetitiveGames:0};
}
module.exports={PRINTS,printedCard,rank26Exposure};
