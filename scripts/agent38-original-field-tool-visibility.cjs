'use strict';

const assert=require('node:assert/strict');
const {auditPrintedSixty}=require('./agent38-candidate-printing-audit.cjs');
const {toolCounterFieldCensus}=
  require('./agent38-garbotoxin-tool-counter-census.cjs');
const {seenAnswerConditionalValidOpening}=
  require('./agent38-early-tool-answer-visibility.cjs');

/**
 * Field-wide narrow card visibility, with original printed Pokémon stages
 * resolved strictly from the bundled card corpus. Never guess which
 * unresolved printing is a starting Basic.
 *
 * @param {object} field Authenticated 29-original physical-card manifest.
 * @param {string} [root] Existing bundled resources location.
 * @returns {object} Per-rank coverage or explicit unresolved stage identities.
 */
function originalFieldToolAnswerVisibility(field,root){
  const census=toolCounterFieldCensus(field);
  const rows=census.rows.map(counter=>{
    const original=field.decks.find(d=>d.rank===counter.rank);
    const audit=auditPrintedSixty(original,root);
    const pokemon=audit.rows.filter(row=>row.category==='Pokémon');
    const unresolved=pokemon.filter(row=>
      row.state!=='exact-bundled-printing'||
      row.matchedIds.length!==1);
    // Stage-ambiguity detection: a printed identity must have exactly one
    // resolved Basic-or-nonBasic classification, not a chosen first match.
    if(unresolved.length){
      return {
        rank:counter.rank,archetype:counter.archetype,
        directAnswerCount:counter.directCounterCopies,
        status:'unknown-pokemon-stage',
        unresolvedPrintedPokemon:unresolved.map(row=>({
          name:row.name,count:row.count,printing:row.printing,
          lookupState:row.state,matchedIds:row.matchedIds.map(x=>x.id)
        }))
      };
    }
    const basicCount=pokemon.reduce((n,row)=>n+(
      row.matchedIds[0].subtypes.includes('Basic')?row.count:0),0);
    assert.ok(basicCount>=1&&basicCount<=60);
    const distribution=seenAnswerConditionalValidOpening({
      deckSize:60,basicCount,answerCount:counter.directCounterCopies,
      openingSize:7,ordinaryDraws:2
    });
    return {
      rank:counter.rank,archetype:counter.archetype,
      directAnswerCount:counter.directCounterCopies,
      status:'resolved-corpus-basic-stage',
      basicCount,probabilitySeenInNine:distribution.answerSeenProbability,
      probabilityRational:{
        numerator:distribution.numerator,denominator:distribution.denominator
      },
      caveat:'Direct natural draw visibility conditional on Basic-valid seven; '+
        'does not model search, locks, timed play or owner decision policy'
    };
  });
  assert.equal(rows.length,census.knownSourceDecks);
  const resolved=rows.filter(row=>row.status==='resolved-corpus-basic-stage');
  return {
    schema:'agent38-aichi-original-field-tool-counter-visibility-v1',
    originalSources:census.knownSourceDecks,
    resolvedOriginals:resolved.length,
    unresolvedOriginals:rows.length-resolved.length,
    printedCounterOriginals:census.directBenchedToolCounterRanks,
    resolvedPotentialCounterOriginals:resolved.filter(row=>
      row.directAnswerCount>0).length,
    rows,
    warning:'Missing Pokémon print/stage is explicitly unresolved. The local '+
      'English corpus and theoretical draw model are not game simulations.'
  };
}

module.exports={originalFieldToolAnswerVisibility};
