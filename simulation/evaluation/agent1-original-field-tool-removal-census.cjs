'use strict';

const assert=require('node:assert/strict');
const source=require('../../results/aichi-2026/full-decklists.json');

const VERSION='agent1-2026-original-field-direct-trainer-tool-removal-v1';
// Exact card names from the original printed 60s. A name or connective route
// cannot guarantee the card is available or playable in any given game.
const DIRECT_TOOL_REMOVERS=Object.freeze({
  'Field Blower':'Item',
  'Lost Vacuum':'Item',
  'Tool Scrapper':'Item',
  'Startling Megaphone':'Item',
  'Faba':'Supporter',
  'Xerosic':'Supporter'
});

/** @returns {object} Exact printed-source finite inventory, no implicit card family matches. */
function census(){
  assert.equal(Array.isArray(source.decks),true);
  assert.equal(source.decks.length,source.published_deck_count);
  const byRank=source.decks.map(deck=>{
    const removerCopies=deck.cards.filter(card=>
      Object.hasOwn(DIRECT_TOOL_REMOVERS,card.name))
      .map(card=>{
        assert.ok(Number.isInteger(card.count)&&card.count>0);
        return {name:card.name,count:card.count,
          kind:DIRECT_TOOL_REMOVERS[card.name]};
      });
    return {rank:deck.rank,archetype:deck.archetype,
      totalCopies:removerCopies.reduce((n,c)=>n+c.count,0),
      removerCopies};
  });
  assert.equal(new Set(byRank.map(row=>row.rank)).size,byRank.length);
  const using=byRank.filter(row=>row.totalCopies>0);
  const cardTypes=Object.keys(DIRECT_TOOL_REMOVERS).map(name=>({
    name,kind:DIRECT_TOOL_REMOVERS[name],
    printedCopies:using.reduce((sum,row)=>sum+row.removerCopies
      .filter(card=>card.name===name)
      .reduce((n,card)=>n+card.count,0),0),
    exactSourceDecks:using.filter(row=>
      row.removerCopies.some(card=>card.name===name)).length
  }));
  const totalCopies=using.reduce((n,row)=>n+row.totalCopies,0);
  assert.equal(totalCopies,
    cardTypes.reduce((n,c)=>n+c.printedCopies,0));
  return {
    version:VERSION,source:'results/aichi-2026/full-decklists.json',
    completeAuthenticatedDecks:source.decks.length,
    incompleteFinalRanks:source.missing_full_lists,
    decksWithAtLeastOneNamedDirectToolRemover:using.length,
    totalDirectToolRemovalCopies:totalCopies,
    exactNameCounts:cardTypes,
    ranksWithCopies:using,
    excludedCardExample:"Xerosic's Machinations is a different Supporter from Xerosic",
    limits:'This is a lower-bound exact-name inventory of six direct Trainer Tool-removal types, not a functional or reachable Tool-breaking move census. Evolution, attack, Stadium, Knock Out, search, prizes, hand costs, lock states, and policy are not modeled. No native games or win-rate evidence.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(census(),null,2)+'\n');
module.exports={VERSION,DIRECT_TOOL_REMOVERS,census};
