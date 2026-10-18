'use strict';
const assert=require('node:assert/strict');
const source=require('../results/aichi-2026/full-decklists.json');

const DIRECT_TOOL_NAMES=Object.freeze([
  'Field Blower','Faba','Lost Vacuum','Xerosic',
  'Tool Scrapper','Startling Megaphone'
]);
const POSITIONAL_TOOL_NAMES=Object.freeze(['Tool Jammer','Jamming Tower']);

/** @param {{cards:Array<{name:string,count:number}>}} deck @param {string} name */
function count(deck,name) {
  return deck.cards.filter(row=>row.name===name)
    .reduce((total,row)=>total+row.count,0);
}
/** @returns {object} Deterministic printed-source card presence census. */
function run() {
  const decks=source.decks.slice().sort((a,b)=>a.rank-b.rank);
  assert.equal(decks.length,29);
  for(const deck of decks) {
    assert.equal(deck.cards.reduce((n,row)=>n+row.count,0),60);
  }
  const rows=decks.map(deck=>{
    const counts=Object.fromEntries([
      ...DIRECT_TOOL_NAMES,...POSITIONAL_TOOL_NAMES
    ].map(name=>[name,count(deck,name)]));
    return {
      rank:deck.rank,player:deck.player,counts,
      listedDirectToolNames:DIRECT_TOOL_NAMES.filter(name=>counts[name]>0),
      listedDirectToolCopies:DIRECT_TOOL_NAMES.reduce(
        (n,name)=>n+counts[name],0),
      listedPositionalToolNames:POSITIONAL_TOOL_NAMES.filter(
        name=>counts[name]>0)
    };
  });
  const namedPresence=Object.fromEntries([
    ...DIRECT_TOOL_NAMES,...POSITIONAL_TOOL_NAMES
  ].map(name=>[name,{
    decks:rows.filter(r=>r.counts[name]>0).length,
    copies:rows.reduce((n,r)=>n+r.counts[name],0)
  }]));
  const hasDirect=rows.filter(r=>r.listedDirectToolCopies>0);
  return {
    schema:'aichi-2026-published-field-direct-tool-names-census-v1',
    publishedExactLists:decks.length,
    unavailableRanks:[23,25,28],
    directNames:DIRECT_TOOL_NAMES,
    positionalNames:POSITIONAL_TOOL_NAMES,
    namedPresence,
    anyListedDirectToolAnswer:hasDirect.length,
    noListedDirectToolAnswer:rows.length-hasDirect.length,
    ranksWithListedDirect:hasDirect.map(r=>r.rank),
    ranksWithoutListedDirect:rows.filter(r=>r.listedDirectToolCopies===0)
      .map(r=>r.rank),
    rows,
    qualifiedMatchupEstimates:0,
    caveat:'Printed name presence only. No proof of access in hand, legality in a particular locked state, other card-based answers, engine policy, Tool removal, or game wins.'
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,count,DIRECT_TOOL_NAMES,POSITIONAL_TOOL_NAMES};
