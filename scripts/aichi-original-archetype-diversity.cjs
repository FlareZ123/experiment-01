'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_ROSTER = path.resolve(__dirname,
  '../results/aichi-2026/full-decklists.json');

/** @typedef {{category:string,count:number,name:string,printing:{set:string,number:string,language:string}}} Card */
/** @typedef {{rank:number,archetype:string,cards:Card[]}} Deck */

/**
 * Card printing distinguishes different attacks/Abilities with identical names.
 * @param {Card} card
 * @returns {string}
 */
function printingKey(card) {
  return [card.name,card.printing.set,card.printing.number,
    card.printing.language].join('|');
}

/**
 * @param {Card[]} cards
 * @param {(card:Card)=>string} key
 * @returns {Map<string,number>}
 */
function cardCounts(cards,key) {
  const counts=new Map();
  for(const card of cards) {
    const id=key(card);
    counts.set(id,(counts.get(id)??0)+card.count);
  }
  return counts;
}

/**
 * Copy-count multiset distance. One substitution removes one card and adds
 * another; it is counted once, not twice as a symmetric-difference count.
 * Identical names of different printings may represent different game text.
 * @param {Deck} a
 * @param {Deck} b
 * @param {(card:Card)=>string} key
 * @returns {{shared:number,replacements:number}}
 */
function deckDistance(a,b,key) {
  const ac=cardCounts(a.cards,key);
  const bc=cardCounts(b.cards,key);
  const aCount=[...ac.values()].reduce((sum,n)=>sum+n,0);
  const bCount=[...bc.values()].reduce((sum,n)=>sum+n,0);
  assert.equal(aCount,bCount,'Compared decks must contain equal cards');
  const shared=[...ac].reduce((sum,[id,n])=>
    sum+Math.min(n,bc.get(id)??0),0);
  return {shared,replacements:aCount-shared};
}

/**
 * @param {Deck[]} decks
 * @returns {{knownLists:number,archetypes:number,pairCount:number,groups:object[]}}
 */
function analyzeRoster(decks) {
  const groups=new Map();
  for(const deck of decks) {
    assert.equal(deck.cards.reduce((sum,c)=>sum+c.count,0),60,
      `Original rank ${deck.rank} must be a complete 60`);
    if(!groups.has(deck.archetype)) groups.set(deck.archetype,[]);
    groups.get(deck.archetype).push(deck);
  }
  const output=[];
  for(const [archetype,originals] of groups) {
    originals.sort((a,b)=>a.rank-b.rank);
    const pairs=[];
    for(let i=0;i<originals.length;i++) {
      for(let j=i+1;j<originals.length;j++) {
        const a=originals[i];
        const b=originals[j];
        const byName=deckDistance(a,b,c=>c.name);
        const byPrinting=deckDistance(a,b,printingKey);
        pairs.push({
          ranks:[a.rank,b.rank],
          nameShared:byName.shared,
          nameReplacements:byName.replacements,
          printingShared:byPrinting.shared,
          printingReplacements:byPrinting.replacements
        });
      }
    }
    pairs.sort((a,b)=>b.nameReplacements-a.nameReplacements||
      a.ranks[0]-b.ranks[0]||a.ranks[1]-b.ranks[1]);
    output.push({
      archetype,
      ranks:originals.map(d=>d.rank),
      pairCount:pairs.length,
      mostDifferent:pairs[0]??null,
      leastDifferent:pairs[pairs.length-1]??null,
      pairs
    });
  }
  output.sort((a,b)=>b.ranks.length-a.ranks.length||
    a.archetype.localeCompare(b.archetype,'en'));
  return {
    knownLists:decks.length,
    archetypes:groups.size,
    pairCount:output.reduce((sum,g)=>sum+g.pairCount,0),
    groups:output
  };
}

/** @param {string} [rosterPath] */
function analyzeFile(rosterPath=DEFAULT_ROSTER) {
  const roster=JSON.parse(fs.readFileSync(rosterPath,'utf8'));
  return analyzeRoster(roster.decks);
}

if(require.main===module) {
  process.stdout.write(JSON.stringify(analyzeFile(),null,2)+'\n');
}

module.exports={
  DEFAULT_ROSTER,printingKey,cardCounts,deckDistance,analyzeRoster,analyzeFile
};
