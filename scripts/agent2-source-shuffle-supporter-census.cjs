'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const SCHEMA='agent2-source-exact-shuffle-supporter-coverage-v1';
const FAMILIES=['Lillie\'s Determination','Marnie','Iono'];

/**
 * Inventory-only three-family Supporter scope for known published Aichi Top32
 * sixties. This counts physical printed cards, not draw reachability, legal
 * first-turn actions, settled native effects, tactical value or win rates.
 *
 * @param {object} published Source dataset from full-decklists.json.
 * @returns {object} Placement-level complete audit.
 */
function sourceShuffleSupporterCoverage(published){
  assert.ok(Array.isArray(published.decks));
  assert.ok(Array.isArray(published.missing_full_lists));
  const ranks=new Set();
  const rows=published.decks.map(deck=>{
    assert.ok(Number.isInteger(deck.rank)&&deck.rank>=1&&deck.rank<=32);
    assert.ok(!ranks.has(deck.rank),'Duplicate tournament placement');
    ranks.add(deck.rank);
    assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60,
      'Every published source deck needs an exact 60-card multiset');
    const families=Object.fromEntries(FAMILIES.map(x=>[x,0]));
    const printings=[];
    for(const card of deck.cards){
      if(!Object.hasOwn(families,card.name))continue;
      assert.equal(card.category,'Trainer');
      families[card.name]+=card.count;
      printings.push({name:card.name,count:card.count,
        printingSet:card.printing?.set??null,
        printingNumber:card.printing?.number??null});
    }
    return {rank:deck.rank,archetype:deck.archetype,
      knownExact60:true,deckName:deck.player,
      totalShuffleCards:Object.values(families).reduce((a,b)=>a+b,0),
      familyCounts:families,printings};
  }).sort((a,b)=>a.rank-b.rank);
  const missing=published.missing_full_lists.map(row=>({
    rank:row.rank,archetype:row.archetype,
    knownExact60:false,reason:'original-registered-60-not-published'
  })).sort((a,b)=>a.rank-b.rank);
  for(const row of missing){
    assert.ok(!ranks.has(row.rank));
    ranks.add(row.rank);
  }
  assert.equal(rows.length,29);
  assert.equal(ranks.size,32);
  const sourceWithFamily=rows.filter(x=>x.totalShuffleCards>0);
  const sourceWithoutFamily=rows.filter(x=>x.totalShuffleCards===0);
  return {schema:SCHEMA,benchmark:'Aichi Open League 2026 Top32',
    source:published.source,
    literalNameFamilyOnly:true,exactPhysical60s:rows.length,
    unresolvedOriginal60s:missing.length,
    cardsCountedAsSupporters:FAMILIES,
    knownOriginalsWithAnyShuffleFamily:sourceWithFamily.length,
    knownOriginalsWithoutShuffleFamily:sourceWithoutFamily.length,
    totalKnownCardsFromTheseFamilies:
      rows.reduce((a,b)=>a+b.totalShuffleCards,0),
    familyRankCoverage:Object.fromEntries(FAMILIES.map(f=>[f,
      rows.filter(row=>row.familyCounts[f]>0).map(row=>row.rank)])),
    withoutFamilyRanks:sourceWithoutFamily.map(x=>x.rank),
    missing,rows,
    qualification:'Inventory only. Does not certify supporter eligibility in a dealt hand, available legal targets, game policy competence, or winning results.'};
}

function main(){
  const file=path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json');
  const published=JSON.parse(fs.readFileSync(file,'utf8'));
  const report=sourceShuffleSupporterCoverage(published);
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  return report;
}
if(require.main===module)main();
module.exports={SCHEMA,FAMILIES,sourceShuffleSupporterCoverage,main};
