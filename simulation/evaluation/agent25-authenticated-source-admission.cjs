'use strict';

const assert=require('node:assert/strict');

/**
 * The original paper Aichi source is authenticated by the shared roster.
 * A developmental all-field trial can admit a rank only if the published
 * opponent's original printed manifest actually contains 60 physical cards.
 * The earlier two-rank default remains frozen for historical comparisons.
 *
 * @param {{decks:Array<{rank:number,cards:Array<{count:number}>}>}} roster
 * @param {boolean} expand Opt-in all-authenticated-original discovery.
 * @returns {number[]}
 */
function authenticatedSourceRanks(roster,expand=false){
  if(!expand)return [6,11];
  assert.ok(Array.isArray(roster?.decks));
  const found=new Set();
  const ranks=[];
  for(const deck of roster.decks){
    assert.ok(Number.isSafeInteger(deck.rank)&&deck.rank>=1&&deck.rank<=32);
    assert.ok(!found.has(deck.rank),'Duplicate published original source rank');
    found.add(deck.rank);
    if(!Array.isArray(deck.cards)||deck.cards.length===0)continue;
    if(!deck.cards.every(card=>Number.isSafeInteger(card.count)&&card.count>0))
      continue;
    if(deck.cards.reduce((count,card)=>count+card.count,0)!==60)continue;
    ranks.push(deck.rank);
  }
  return ranks.sort((a,b)=>a-b);
}

module.exports={authenticatedSourceRanks};
