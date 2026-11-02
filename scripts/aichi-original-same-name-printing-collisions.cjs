'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname,'..');
const ROSTER = path.join(ROOT,'results/aichi-2026/full-decklists.json');
const SETS = path.join(ROOT,'resources/sets/en.json');

/**
 * @typedef {{category:string,name:string,count:number,printing:{set:string,number:string,language:string}}} RosterCard
 * @typedef {{rank:number,archetype:string,cards:RosterCard[]}} RosterDeck
 */

/**
 * Enumerate multiple published printings with the same name inside one actual
 * deck. Do not overwrite a name-to-card Map, which loses exact printing data.
 * @param {RosterDeck[]} decks
 * @returns {object[]}
 */
function collisionInventory(decks) {
  const results=[];
  for(const deck of decks) {
    const byName=new Map();
    for(const c of deck.cards) {
      const entries=byName.get(c.name)??[];
      entries.push(c);
      byName.set(c.name,entries);
    }
    for(const [name,entries] of byName) {
      const ids=new Set(entries.map(c=>[
        c.printing.set,c.printing.number,c.printing.language].join('|')));
      if(ids.size<2)continue;
      results.push({
        rank:deck.rank,
        archetype:deck.archetype,
        name,
        copies:entries.reduce((n,c)=>n+c.count,0),
        printings:entries.map(c=>({
          count:c.count,...c.printing
        }))
      });
    }
  }
  return results.sort((a,b)=>a.rank-b.rank||
    a.name.localeCompare(b.name,'en'));
}

/**
 * Project the text/features responsible for in-play behavior. This is
 * database text, not a paper-errata or format-legality oracle.
 * @param {object} card
 */
function gameplayFingerprint(card) {
  return {
    hp:card.hp??null,
    types:card.types??[],
    subtypes:card.subtypes??[],
    abilities:(card.abilities??[]).map(a=>({
      name:a.name,text:a.text??''
    })),
    attacks:(card.attacks??[]).map(a=>({
      name:a.name,cost:a.cost??[],damage:a.damage??'',text:a.text??''
    }))
  };
}

/**
 * Resolve every ambiguous named printing to an actual distinct database
 * record, and report whether printed gameplay features match.
 * @param {RosterDeck[]} decks
 * @param {string} [root]
 * @returns {object[]}
 */
function auditCollisions(decks,root=ROOT) {
  const setList=JSON.parse(fs.readFileSync(
    path.join(root,'resources/sets/en.json'),'utf8'));
  const setIds=new Map(setList.filter(s=>s.ptcgoCode)
    .map(s=>[s.ptcgoCode,s.id]));
  const loadedSets=new Map();

  return collisionInventory(decks).map(group=>{
    const cards=group.printings.map(printed=>{
      assert.equal(printed.language,'en',
        'Unsupported non-English printing in the local English source');
      const id=setIds.get(printed.set);
      assert.ok(id,`Unknown set code ${printed.set}`);
      if(!loadedSets.has(id)) {
        loadedSets.set(id,JSON.parse(fs.readFileSync(
          path.join(root,'resources/cards/en',id+'.json'),'utf8')));
      }
      const found=loadedSets.get(id).filter(c=>
        c.number===printed.number&&c.name===group.name);
      assert.equal(found.length,1,
        `Expected one exact printing for ${group.name} ${printed.set} ${printed.number}`);
      const card=found[0];
      return {
        ...printed,
        databaseId:card.id,
        gameplay:gameplayFingerprint(card)
      };
    });
    const features=cards.map(c=>JSON.stringify(c.gameplay));
    const abilitySets=cards.map(c=>JSON.stringify(c.gameplay.abilities));
    const attackSets=cards.map(c=>JSON.stringify(c.gameplay.attacks));
    return {
      ...group,
      printings:cards,
      gameplayDistinct:new Set(features).size>1,
      abilitiesDistinct:new Set(abilitySets).size>1,
      attacksDistinct:new Set(attackSets).size>1
    };
  });
}

/** @param {string} [rosterPath] @param {string} [root] */
function auditFile(rosterPath=ROSTER,root=ROOT) {
  const roster=JSON.parse(fs.readFileSync(rosterPath,'utf8'));
  assert.equal(roster.decks.length,29,'Unchanged source denominator expected');
  return auditCollisions(roster.decks,root);
}

if(require.main===module)
  process.stdout.write(JSON.stringify(auditFile(),null,2)+'\n');

module.exports={
  ROOT,ROSTER,SETS,collisionInventory,gameplayFingerprint,
  auditCollisions,auditFile
};
