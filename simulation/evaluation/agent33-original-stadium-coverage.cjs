'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const VERSION='agent33-original-stadium-root-coverage-v1';

/**
 * Closed, reviewed 29-original-card vocabulary from the supplied all-card
 * pool (Stadium subtype) and research Japanese SP127 Stadium hook.
 * Prism glyph values follow full-decklists.json, not native ID normalization.
 */
const STADIUM_NAMES=Object.freeze([
  'Artazon','Chaotic Swell','Dimension Valley','Grand Tree',
  'Parallel City','Path to the Peak',"Player's Ceremony",'PokéStop',
  'Risky Ruins','Shopping Center','Silent Lab','Sky Field',
  'Temple of Sinnoh','Thunder Mountain ♢','Tropical Beach',
  'Wondrous Labyrinth ♢'
]);
const EXPLICIT_OWNER_PLACEMENT=Object.freeze({
  'Thunder Mountain ♢':'thornsDirectLine (default false; Iron Thorns only)',
  'Tropical Beach':'tropicalBeachLastChance (default false; last chance only)'
});
const FIRST29=Object.freeze([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,
  17,18,19,20,21,22,24,26,27,29,30,31,32]);
const nameSet=new Set(STADIUM_NAMES);
const explicitSet=new Set(Object.keys(EXPLICIT_OWNER_PLACEMENT));
/** Group actual original registered print counts; no game simulation. */
function census(decks){
  assert.ok(Array.isArray(decks));
  const ranked=new Map(decks.map(deck=>[deck.rank,deck]));
  for(const rank of FIRST29){
    const deck=ranked.get(rank);
    assert.ok(deck,'Missing authenticated original rank '+rank);
    assert.equal(deck.cards.reduce((s,c)=>s+c.count,0),60,
      'Original source must remain exactly 60');
  }
  const rows=FIRST29.map(rank=>{
    const deck=ranked.get(rank);
    const stadium=deck.cards.filter(card=>nameSet.has(card.name))
      .map(c=>({name:c.name,count:c.count}));
    const total=stadium.reduce((s,c)=>s+c.count,0);
    const explicitCopies=stadium
      .filter(c=>explicitSet.has(c.name)).reduce((s,c)=>s+c.count,0);
    return {rank,archetype:deck.archetype,totalStadiumCopies:total,
      explicitOptInPlacementCopies:explicitCopies,
      noExplicitPlacementCopies:total-explicitCopies,stadium};
  });
  const byName=STADIUM_NAMES.map(name=>{
    const ranks=rows.filter(row=>row.stadium.some(c=>c.name===name))
      .map(row=>row.rank);
    const copies=rows.reduce((s,row)=>s+
      (row.stadium.find(c=>c.name===name)?.count??0),0);
    return {name,copies,ranks,explicitRoot:
      EXPLICIT_OWNER_PLACEMENT[name]??null};
  });
  const totalCopies=rows.reduce((s,row)=>s+row.totalStadiumCopies,0);
  const explicitCopies=rows.reduce((s,row)=>
    s+row.explicitOptInPlacementCopies,0);
  return {schema:VERSION,originalRankCount:rows.length,
    originalRanks:FIRST29.slice(),
    totalStadiumCopies:totalCopies,
    stadiumNames:STADIUM_NAMES.length,
    ranksWithAnyStadium:rows.filter(row=>row.totalStadiumCopies>0).length,
    explicitOptInPlacementCopies:explicitCopies,
    noExplicitPlacementCopies:totalCopies-explicitCopies,
    ranksWithoutExplicitPlacement:rows.filter(row=>
      row.explicitOptInPlacementCopies===0).map(row=>row.rank),
    caveat:'This counts root placement vocabulary only; a visible Stadium may '+
      'still affect either player. The two existing explicit branches are '+
      'default-off, conditional, and do not establish native Store success.',
    competitiveGameQualified:false,byName,rows};
}
function load(){
  const file=path.join(__dirname,'../../results/aichi-2026/full-decklists.json');
  return census(JSON.parse(fs.readFileSync(file,'utf8')).decks);
}
if(require.main===module)process.stdout.write(JSON.stringify(load(),null,2)+'\n');
module.exports={VERSION,STADIUM_NAMES,EXPLICIT_OWNER_PLACEMENT,FIRST29,census,load};
