'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {auditPrintedSixty}=
  require('./agent38-candidate-printing-audit.cjs');
const {originalSourceBasicCensus}=
  require('./agent3-original-source-basic-mulligan-census.cjs');

const VERSION='agent3-original29-printed-corpus-gap-census-v1';
const SOURCE=path.resolve(__dirname,
  '../results/aichi-2026/full-decklists.json');

/**
 * Scan each of the 29 authentic original printed source 60s for exact English
 * database identity and preserve every unresolved printing by physical rank.
 * The card corpus is a search resource, not a complete Japanese paper
 * Expanded legality oracle.
 *
 * @returns {object}
 */
function originalPrintGapCensus(){
  const raw=fs.readFileSync(SOURCE,'utf8');
  const originals=JSON.parse(raw);
  const stages=originalSourceBasicCensus();
  assert.equal(originals.decks.length,29);
  assert.equal(stages.exactResolvedSourceBasicStages,29);
  const byRank=originals.decks.map(source=>{
    const audit=auditPrintedSixty(source);
    const unresolved=audit.rows.filter(row=>
      row.state!=='exact-bundled-printing');
    assert.equal(audit.quantities,60);
    assert.equal(audit.matchedCopies+audit.unmatchedCopies,60);
    assert.equal(unresolved.reduce((sum,row)=>sum+row.count,0),
      audit.unmatchedCopies);
    assert.equal(unresolved.filter(row=>row.category==='Pokémon').length,0,
      'Original Pokémon stages must be fully locally verified');
    return {
      rank:source.rank,archetype:source.archetype,
      matchedCopies:audit.matchedCopies,
      unmatchedCopies:audit.unmatchedCopies,
      allNamesSatisfyOrdinaryFourCopyCap:
        audit.noMoreThanFourFromNamesAndCategory,
      knownAceSpecCopies:audit.knownAceSpecCopies,
      unresolved:unresolved.map(row=>({
        category:row.category,name:row.name,count:row.count,
        printing:row.printing,state:row.state
      }))
    };
  }).sort((a,b)=>a.rank-b.rank);
  assert.equal(byRank.length,29);
  assert.equal(new Set(byRank.map(row=>row.rank)).size,29);
  const all=byRank.flatMap(row=>
    row.unresolved.map(x=>({...x,rank:row.rank})));
  const byPrinting=new Map();
  for(const entry of all){
    const key=[entry.category,entry.name,entry.printing.set,
      String(entry.printing.number)].join('|');
    if(!byPrinting.has(key))byPrinting.set(key,{
      category:entry.category,name:entry.name,
      printing:entry.printing,
      copiesAcrossKnownOriginals:0,ranks:[]
    });
    const summary=byPrinting.get(key);
    summary.copiesAcrossKnownOriginals+=entry.count;
    summary.ranks.push({rank:entry.rank,count:entry.count});
  }
  const unresolvedPrintings=[...byPrinting.values()].sort((a,b)=>
    (a.category+'|'+a.name+'|'+a.printing.set+'|'+a.printing.number)
      .localeCompare(b.category+'|'+b.name+'|'+b.printing.set+'|'+b.printing.number));
  const matched=byRank.reduce((sum,row)=>sum+row.matchedCopies,0);
  const unmatched=byRank.reduce((sum,row)=>sum+row.unmatchedCopies,0);
  assert.equal(matched+unmatched,1740);
  return {
    schema:VERSION,
    sourceRosterSha256:createHash('sha256').update(raw).digest('hex'),
    knownOriginals:29,missingCompleteOriginals:[23,25,28],
    printedSourceCopies:1740,matchedCorpusCopies:matched,
    unmatchedCorpusCopies:unmatched,
    unresolvedDistinctPrintings:unresolvedPrintings.length,
    unknownOriginalPokemonStageIdentities:0,
    unresolvedPrintings,byRank,
    caveat:'Exact local English bundled printing coverage, no native engine/paper Japanese-era legality attestation. Missing English energy or other printings are not automatically illegal or absent from physical tournament lists. Zero qualified game outcomes.'
  };
}
module.exports={VERSION,originalPrintGapCensus};

if(require.main===module) {
  const x=originalPrintGapCensus();
  console.log('AGENT3_ORIGINAL29_PRINTING_GAP_CENSUS',JSON.stringify({
    printedSourceCopies:x.printedSourceCopies,
    matchedCorpusCopies:x.matchedCorpusCopies,
    unmatchedCorpusCopies:x.unmatchedCorpusCopies,
    unresolvedDistinctPrintings:x.unresolvedDistinctPrintings,
    unresolvedPrintings:x.unresolvedPrintings
  }));
}
