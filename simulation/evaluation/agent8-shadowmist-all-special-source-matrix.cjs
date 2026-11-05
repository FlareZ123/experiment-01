'use strict';
const assert=require('node:assert/strict');
const BASIC=new Set(['Grass Energy','Fire Energy','Water Energy',
 'Lightning Energy','Psychic Energy','Fighting Energy','Darkness Energy',
 'Metal Energy','Fairy Energy']);
const SPECIAL=new Set(['Capture Energy','Jet Energy','Memory Energy',
 'Reversal Energy','Counter Energy','Unit Energy LPM',
 'Double Colorless Energy','Speed Lightning Energy','Spiky Energy',
 'Recycle Energy','Prism Energy','Telepathic Psychic Energy',
 'Double Dragon Energy','Powerful Colorless Energy']);
const VERSION='agent8-shadowmist-source-energy-matrix-v1';
/**
 * Deterministic printed Energy census of authenticated original source 60s.
 * New unclassified names fail closed; do not project missing ranks.
 * @param {{decks:object[]}} input Original documented source inventories.
 * @returns {object} Rank-level Energy type matrix.
 */
function sourceEnergyMatrix(input){
 assert.ok(Array.isArray(input?.decks));
 const rows=input.decks.map(deck=>{
   assert.ok(Number.isSafeInteger(deck.rank)&&deck.rank>=1&&deck.rank<=32);
   let basics=0,specials=0;
   for(const card of deck.cards){
     if(card.category!=='Energy')continue;
     assert.ok(Number.isSafeInteger(card.count)&&card.count>0);
     if(BASIC.has(card.name))basics+=card.count;
     else{
       assert.ok(SPECIAL.has(card.name),
         'Unclassified printed Energy: '+String(card.name));
       specials+=card.count;
     }
   }
   return {rank:deck.rank,archetype:deck.archetype,
     basicEnergy:basics,specialEnergy:specials,
     allEnergySpecial:basics===0&&specials>0};
 }).sort((a,b)=>a.rank-b.rank);
 assert.equal(new Set(rows.map(r=>r.rank)).size,rows.length);
 return {version:VERSION,authenticatedOriginalRanks:rows.length,
   missingOriginalRanks:Array.from({length:32},(_,i)=>i+1)
     .filter(rank=>!rows.some(r=>r.rank===rank)),
   allSpecialRanks:rows.filter(r=>r.allEnergySpecial).map(r=>r.rank),
   rows,competitiveGamesQualified:0};
}
module.exports={VERSION,sourceEnergyMatrix};
