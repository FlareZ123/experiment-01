'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {originalPrintGapCensus}=
  require('../scripts/agent3-original29-print-gap-census.cjs');

test('all 1740 original cards retained and no Pokémon identity silently unresolved',()=>{
  const result=originalPrintGapCensus();
  assert.equal(result.knownOriginals,29);
  assert.deepEqual(result.missingCompleteOriginals,[23,25,28]);
  assert.equal(result.printedSourceCopies,29*60);
  assert.equal(result.matchedCorpusCopies+result.unmatchedCorpusCopies,1740);
  assert.equal(result.unknownOriginalPokemonStageIdentities,0);
  assert.match(result.sourceRosterSha256,/^[a-f0-9]{64}$/);
  assert.equal(result.byRank.length,29);
  assert.equal(result.unresolvedDistinctPrintings,result.unresolvedPrintings.length);
  assert.equal(result.unresolvedPrintings
    .filter(x=>x.category==='Pokémon').length,0);
  assert.ok(result.byRank.every(x=>x.matchedCopies+x.unmatchedCopies===60));
  assert.ok(result.byRank.every(x=>Number.isSafeInteger(x.knownAceSpecCopies)));
  console.log('AGENT3_ORIGINAL29_PRINT_GAP_SUMMARY',
    JSON.stringify({
      matched:result.matchedCorpusCopies,
      missing:result.unmatchedCorpusCopies,
      distinct:result.unresolvedDistinctPrintings,
      printed:result.unresolvedPrintings
    }));
});

test('unresolved rank rows exactly reconcile grouped printed source identities',()=>{
  const result=originalPrintGapCensus();
  for(const gap of result.unresolvedPrintings){
    assert.equal(gap.copiesAcrossKnownOriginals,
      gap.ranks.reduce((s,row)=>s+row.count,0));
    assert.ok(gap.ranks.every(x=>result.byRank.some(row=>row.rank===x.rank)));
    for(const rank of gap.ranks){
      const original=result.byRank.find(row=>row.rank===rank.rank);
      assert.ok(original.unresolved.some(row=>
        row.name===gap.name&&row.category===gap.category&&
        row.printing.set===gap.printing.set&&
        String(row.printing.number)===String(gap.printing.number)&&
        row.count===rank.count));
    }
  }
  const sum=result.unresolvedPrintings.reduce((n,x)=>
    n+x.copiesAcrossKnownOriginals,0);
  assert.equal(sum,result.unmatchedCorpusCopies);
});

test('original printed corpus census replays identically',()=>{
  assert.deepEqual(originalPrintGapCensus(),originalPrintGapCensus());
});
