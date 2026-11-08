'use strict';

const assert=require('node:assert/strict');
const roster=require('../../results/aichi-2026/full-decklists.json');

const VERSION='agent7-original-top32-published-trainer-coverage-v1';

/** Count source-list incidence without inferring tactics, legality or prompt support. */
function trainerCoverage(){
  const decks=roster.decks;
  assert.equal(decks.length,roster.published_deck_count);
  const byName=new Map();
  const seenRanks=new Set();
  for(const deck of decks){
    assert.ok(Number.isSafeInteger(deck.rank)&&!seenRanks.has(deck.rank));
    seenRanks.add(deck.rank);
    assert.equal(deck.cards.reduce((n,row)=>n+row.count,0),60);
    const each=new Set();
    for(const row of deck.cards){
      if(row.category!=='Trainer')continue;
      assert.ok(!each.has(row.name),'Each name must be aggregated within its source deck');
      each.add(row.name);
      const item=byName.get(row.name)??{name:row.name,decks:0,
        copies:0,sourceRanks:[]};
      item.decks++;
      item.copies+=row.count;
      item.sourceRanks.push(deck.rank);
      byName.set(row.name,item);
    }
  }
  return {
    schema:VERSION,scope:'29 authenticated original Aichi 2026 name/count 60s',
    presentSourceDecks:decks.length,
    missingSourceRanks:roster.missing_full_lists,
    distinctTrainerNames:byName.size,
    trainerCoverage:[...byName.values()]
      .map(x=>({...x,sourceRanks:x.sourceRanks.sort((a,b)=>a-b)}))
      .sort((a,b)=>b.decks-a.decks||b.copies-a.copies||
        a.name.localeCompare(b.name))
  };
}

if(require.main===module){
  const result=trainerCoverage();
  process.stdout.write(JSON.stringify({
    schema:result.schema,sourceDecks:result.presentSourceDecks,
    distinctTrainerNames:result.distinctTrainerNames,
    topTwenty:result.trainerCoverage.slice(0,20),
    competitiveGamesQualified:0
  },null,2)+'\n');
}

module.exports={VERSION,trainerCoverage};
