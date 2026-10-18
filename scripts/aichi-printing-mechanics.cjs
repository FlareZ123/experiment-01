'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { analyzeIncidence } = require('./aichi-source-incidence.cjs');

const resourceRoot = path.resolve(__dirname, '../resources');
const fieldPath = path.resolve(__dirname,
  '../results/aichi-2026/full-decklists.json');

/**
 * Resolve exact English printings before drawing conclusions about Abilities.
 * A shared printed name does not identify a shared Pokémon effect.
 * @param {object} field Published Aichi inventory
 * @param {string} root Local committed card and set database root
 * @returns {{rank:number,name:string,distinctAbilities:boolean,distinctAttacks:boolean,printings:object[]}[]}
 */
function compareMixedPrintings(field, root = resourceRoot) {
  const groups = analyzeIncidence(field).mixedPrintingNames;
  const sets = JSON.parse(fs.readFileSync(path.join(root,'sets','en.json'),'utf8'));
  const codeToId = new Map(sets.filter(s=>s.ptcgoCode)
    .map(s=>[s.ptcgoCode,s.id]));
  const cache = new Map();

  /** @param {string} setId */
  function cardsForSet(setId) {
    if (!cache.has(setId)) {
      const cards = JSON.parse(fs.readFileSync(
        path.join(root,'cards','en',setId+'.json'),'utf8'));
      cache.set(setId,cards);
    }
    return cache.get(setId);
  }

  const output=[];
  for (const group of groups) {
    const deck = field.decks.find(row=>row.rank===group.rank);
    const entries=deck.cards.filter(row=>row.name===group.name);
    const printings=entries.map(row=>{
      const code=row.printing?.set;
      const number=String(row.printing?.number??'');
      assert.equal(row.printing?.language,'en',
        'Expected published English mapped printing');
      const setId=codeToId.get(code);
      assert.ok(setId,'Unknown source printing set: '+code);
      const hits=cardsForSet(setId).filter(c=>String(c.number)===number);
      assert.equal(hits.length,1,
        'Expected exactly one printing for '+code+' '+number);
      const card=hits[0];
      assert.equal(card.name,row.name,
        'Aichi printing points to different named card');
      return {
        sourceCode:code, sourceNumber:number, cardId:card.id,
        copies:row.count, hp:Number(card.hp),
        abilities:(card.abilities??[]).map(a=>({
          name:a.name,text:a.text
        })),
        attacks:(card.attacks??[]).map(a=>({
          name:a.name,text:a.text??''
        })),
        expandedFlag:card.legalities?.expanded??null
      };
    });
    const distinctAbilities=new Set(printings.map(p=>
      JSON.stringify(p.abilities))).size>1;
    const distinctAttacks=new Set(printings.map(p=>
      JSON.stringify(p.attacks))).size>1;
    output.push({
      rank:group.rank,name:group.name,
      distinctAbilities,distinctAttacks,printings
    });
  }
  return output;
}

/** @returns {object} Full source-locked mechanical comparison. */
function main() {
  const field=JSON.parse(fs.readFileSync(fieldPath,'utf8'));
  const groups=compareMixedPrintings(field);
  const result={
    source:'resources/cards/en and resources/sets/en.json',
    field:'results/aichi-2026/full-decklists.json',
    groups,
    note:'Printing text is a card database record, not a gameplay or simulator validation.'
  };
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  return result;
}

if(require.main===module)main();
module.exports={compareMixedPrintings,main};
