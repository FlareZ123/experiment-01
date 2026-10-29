'use strict';
const assert=require('node:assert/strict');
const {BASIC_ENERGIES,auditSourceRootCoverage}=
  require('./aichi-source-root-coverage.cjs');
const {conditionalSpecialExposure,auditSpecialOnlySourceOpenings}=
  require('./agent17-special-only-opening-exposure.cjs');
const {specialEnergyUnits,VERSION}=
  require('../simulation/twinleaf/agent3-special-energy-frontier.cjs');

/**
 * Count exact original Energy printings recognized by the implemented
 * actor numeric frontier. Recognition is weaker than native play legality.
 * @param {object} corpus Original source manifest
 * @returns {object} Source-rank-specific static coverage report
 */
function auditSpecialEnergyVocabulary(corpus){
  const baseline=auditSourceRootCoverage(corpus);
  assert.equal(baseline.exactPrintedSources,29);
  const special=card=>card.category==='Energy'&&
    !BASIC_ENERGIES.has(card.name);
  const identity=card=>card.name+' '+card.printing.set;
  const all=corpus.decks.flatMap(d=>d.cards.filter(special));
  const catalog={
    specialEnergies:new Set(all.map(identity)),colorlessEnergyType:0,
    basicEnergyTypes:{Lightning:1,Psychic:2}
  };
  const basicCounts=new Map(auditSpecialOnlySourceOpenings(corpus)
    .rows.map(d=>[d.rank,d.basicCopies]));
  const rows=corpus.decks.map(deck=>{
    let recognized=0,unrecognized=0;
    const unsupported=[];
    for(const card of deck.cards.filter(special)){
      const printing=identity(card);
      const units=specialEnergyUnits(printing,catalog,false);
      if(units===null){
        unrecognized+=card.count;
        unsupported.push({printing,count:card.count});
      }else{
        assert.ok(Array.isArray(units)&&units.length>0);
        recognized+=card.count;
      }
    }
    const total=recognized+unrecognized;
    const original=baseline.decks.find(d=>d.rank===deck.rank);
    assert.equal(total,original.specialEnergy);
    const b=basicCounts.get(deck.rank);
    return {
      rank:deck.rank,archetype:deck.archetype,
      specialCopies:total,recognizedCopies:recognized,
      unrecognizedCopies:unrecognized,unsupported,
      recognizedFirstSeven:b===undefined?null:
        conditionalSpecialExposure(b,recognized,0),
      recognizedByOneDraw:b===undefined?null:
        conditionalSpecialExposure(b,recognized,1)
    };
  }).sort((a,b)=>a.rank-b.rank);
  const active=rows.filter(r=>r.specialCopies>0);
  return {
    protocol:'agent17-special-energy-vocabulary-v1',
    frontierVersion:VERSION,originalSources:rows.length,
    missingOriginals:baseline.missingFullPrintedRanks,
    specialSources:active.length,
    specialCopies:active.reduce((s,r)=>s+r.specialCopies,0),
    recognizedCopies:active.reduce((s,r)=>s+r.recognizedCopies,0),
    unrecognizedCopies:active.reduce((s,r)=>s+r.unrecognizedCopies,0),
    fullRanks:active.filter(r=>r.unrecognizedCopies===0).map(r=>r.rank),
    partialRanks:active.filter(r=>r.recognizedCopies>0&&
      r.unrecognizedCopies>0).map(r=>r.rank),
    zeroRanks:active.filter(r=>r.recognizedCopies===0).map(r=>r.rank),
    rows,qualification:{
      recognizedNumericPrintingOnly:true,
      legalAttachmentCertified:false,
      realStoreExecutionCertified:false,
      competitiveGameQualified:false
    }
  };
}
if(require.main===module){
  const source=require('../results/aichi-2026/full-decklists.json');
  process.stdout.write(JSON.stringify(auditSpecialEnergyVocabulary(source),null,2)+'\n');
}
module.exports={auditSpecialEnergyVocabulary};
