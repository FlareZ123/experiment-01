'use strict';

const assert=require('node:assert/strict');
const corpus=require('../../results/aichi-2026/full-decklists.json');

const VERSION='agent2-original29-trainer-demand-census-v1';
const SELECTED_ITEMS=Object.freeze([
  'Quick Ball','VS Seeker','Battle VIP Pass','Mysterious Treasure',
  'Battle Compressor',"Trainers' Mail",'Hisuian Heavy Ball','Ultra Ball',
  'Rescue Carrier','Rescue Stretcher','Tag Call','Dark Patch'
]);
const GROUPS=Object.freeze({
  topTwoSearch:['Quick Ball','VS Seeker'],
  topThreeSearch:['Quick Ball','VS Seeker','Battle VIP Pass'],
  discardSupporterOrMail:['VS Seeker',"Trainers' Mail"],
  psychicOrGenericSearch:['Mysterious Treasure','Ultra Ball']
});

/**
 * Count published printed card copies, not inferred physical-play frequency.
 * Every 60 is an immutable original opposing tournament list; absent ranks
 * 23, 25, 28 remain absent rather than approximated from archetypes.
 * @param {object} [data] Original decklist dataset.
 * @returns {object} Exact reproducible source-presence and copy census.
 */
function census(data=corpus){
  assert.equal(data.decks.length,29,'source coverage changed; re-audit baseline');
  assert.deepEqual(data.missing_full_lists,[23,25,28]);
  const byName=new Map();
  const seenRanks=new Set();
  for(const d of data.decks){
    assert.ok(Number.isSafeInteger(d.rank)&&d.rank>=1&&d.rank<=32);
    assert.ok(!seenRanks.has(d.rank),'duplicate original rank');
    seenRanks.add(d.rank);
    assert.equal(d.cards.reduce((n,c)=>n+c.count,0),60);
    const seenName=new Set();
    for(const c of d.cards){
      if(c.category!=='Trainer')continue;
      assert.ok(Number.isSafeInteger(c.count)&&c.count>=1);
      assert.ok(!seenName.has(c.name),'duplicate Trainer name within original deck');
      seenName.add(c.name);
      const row=byName.get(c.name)??{
        name:c.name,deckCount:0,copyCount:0,ranks:[]
      };
      row.deckCount++;
      row.copyCount+=c.count;
      row.ranks.push(d.rank);
      byName.set(c.name,row);
    }
  }
  const normalized=rows=>rows.sort((a,b)=>
    b.copyCount-a.copyCount||b.deckCount-a.deckCount||
    a.name.localeCompare(b.name));
  const ranking=normalized([...byName.values()].map(row=>({
    ...row,ranks:row.ranks.sort((a,b)=>a-b)
  })));
  const selected=SELECTED_ITEMS.map(name=>{
    const row=byName.get(name);
    assert.ok(row,`Expected original field Item absent: ${name}`);
    return {...row,ranks:[...row.ranks]};
  });
  const groups=Object.fromEntries(Object.entries(GROUPS).map(([key,names])=>{
    const ranks=[...seenRanks].filter(rank=>names.some(name=>
      byName.get(name)?.ranks.includes(rank))).sort((a,b)=>a-b);
    const copies=names.reduce((sum,name)=>sum+(byName.get(name)?.copyCount??0),0);
    return [key,{names,deckCount:ranks.length,ranks,
      aggregatedCopies:copies}];
  }));
  const sourceDeckRanks=[...seenRanks].sort((a,b)=>a-b);
  return {
    version:VERSION,source:'results/aichi-2026/full-decklists.json',
    qualifiedGames:0,originalSixties:data.decks.length,
    missingFullListRanks:[...data.missing_full_lists],
    sourceDeckRanks,trainerNameCount:ranking.length,
    rankedTrainerCounts:ranking,selectedItemCounts:selected,groups,
    qualification:{
      countsOfListedPrintingsOnly:true,
      matchPlayFrequencyMeasured:false,
      profitableActionRateMeasured:false,
      actorOnlyNativePromptCoverageMeasured:false,
      effectSettlementCertified:false,
      futurePolicyWinRateInferred:false
    }
  };
}
if(require.main===module){
  process.stdout.write(JSON.stringify(census(),null,2)+'\n');
}
module.exports={VERSION,SELECTED_ITEMS,GROUPS,census};
