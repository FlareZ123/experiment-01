'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {originalPrintedPokemon}=
  require('../simulation/twinleaf/agent10-original-printing-energy-flags.cjs');

/**
 * Inspect exactly the published original Aichi opponents; missing ranks stay
 * absent and no proxy 60s are invented. Use exact EN set+number lookup rather
 * than name heuristics, public aliases or simulator fullName strings.
 * @param {string} root Repository root.
 * @returns {object} Reproducible 29-deck printed Prize inventory.
 */
function census(root){
  const source=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  assert.equal(source.decks.length,29,
    'Source-field denominator changed: revalidate source coverage');
  const ranks=new Set(),cache={},details=[];
  const byAward={1:{copies:0,entries:0,ranks:new Set()},
    2:{copies:0,entries:0,ranks:new Set()},
    3:{copies:0,entries:0,ranks:new Set()}};
  for(const deck of source.decks){
    assert.ok(Number.isInteger(deck.rank)&&deck.rank>=1&&deck.rank<=32);
    assert.ok(!ranks.has(deck.rank),'Duplicate rank '+deck.rank);
    ranks.add(deck.rank);
    const rows=[];
    for(const card of deck.cards){
      if(card.category!=='Pokémon')continue;
      const count=Number(card.count);
      assert.ok(Number.isInteger(count)&&count>=1&&count<=4,
        'Unexpected Pokémon count rank '+deck.rank+' '+card.name);
      const profile=originalPrintedPokemon(root,card,cache);
      const award=profile.prizesOnKnockout;
      assert.ok([1,2,3].includes(award),
        'Unmodeled exact printed Prize award '+card.name);
      byAward[award].copies+=count;
      byAward[award].entries++;
      byAward[award].ranks.add(deck.rank);
      if(award===3)rows.push({
        printingId:profile.printingId,
        name:card.name,set:card.printing.set,
        number:card.printing.number,copies:count,award
      });
    }
    if(rows.length)details.push({rank:deck.rank,cards:rows});
  }
  const summary=Object.fromEntries(Object.entries(byAward)
    .map(([k,v])=>[k,{copies:v.copies,entries:v.entries,
      ranks:[...v.ranks].sort((a,b)=>a-b)}]));
  return {
    schema:'agent42-exact-source-printed-prize-bounty-census-v1',
    originalCompleteDecks:source.decks.length,
    missingOriginalRanks:[23,25,28].filter(rank=>!ranks.has(rank)),
    summary,threePrizeSourceRanks:details.length,threePrizeCards:details,
    competitiveQualifiedGames:0
  };
}

if(require.main===module){
  process.stdout.write(JSON.stringify(census(path.resolve(__dirname,'..')),
    null,2)+'\n');
}
module.exports={census};
