'use strict';
const assert=require('node:assert/strict');
const {BASIC_ENERGIES,auditSourceRootCoverage}=
  require('./aichi-source-root-coverage.cjs');
const {energyUnits}=require('../simulation/twinleaf/actor-energy-payability.cjs');
const {auditSpecialEnergyVocabulary}=
  require('./agent17-special-energy-vocabulary.cjs');

/**
 * Test recognition against the existing richer public-context Energy
 * model. Contexts are hypothetical rule branches, never assertions
 * that any original owner actually had a qualifying target.
 * @param {object} manifest Original printed full 60s
 * @returns {object}
 */
function auditEnergyModelBridge(manifest){
  const baseline=auditSpecialEnergyVocabulary(manifest);
  const indexed=new Map(baseline.rows.map(x=>[x.rank,x]));
  const original=auditSourceRootCoverage(manifest);
  assert.equal(original.exactPrintedSources,29);
  const contexts=[
    {isBasic:true,isEvolution:false,isDragon:false,
      hasRuleBox:false,behindOnPrizes:false},
    {isBasic:false,isEvolution:true,isDragon:true,
      hasRuleBox:false,behindOnPrizes:true}
  ];
  const covered=new Set();
  const rows=manifest.decks.map(deck=>{
    const base=indexed.get(deck.rank);
    let modeledCopies=0,missingCopies=0;
    const unsupported=[];
    for(const card of deck.cards.filter(card=>card.category==='Energy'&&
      !BASIC_ENERGIES.has(card.name))){
      const printing=card.name+' '+card.printing.set;
      const units=contexts.map(ctx=>energyUnits(printing,ctx));
      if(units.some(x=>x!==null)){
        modeledCopies+=card.count;
        covered.add(printing);
      }else{
        missingCopies+=card.count;
        unsupported.push({printing,count:card.count});
      }
    }
    assert.equal(modeledCopies+missingCopies,base.specialCopies);
    assert.ok(modeledCopies>=base.recognizedCopies,
      'Rich model should cover every recognized original printing');
    return {rank:deck.rank,archetype:deck.archetype,
      printedSpecialCopies:base.specialCopies,
      currentNumericRecognized:base.recognizedCopies,
      richerModelRecognized:modeledCopies,
      stillUnmodeled:missingCopies,
      unsupported};
  }).sort((a,b)=>a.rank-b.rank);
  const carrying=rows.filter(x=>x.printedSpecialCopies>0);
  return {
    protocol:'agent17-special-model-reuse-bridge-v1',
    originalSources:rows.length,
    missingRanks:original.missingFullPrintedRanks,
    contexts:'two hypothetical public board configurations, not actor exposure',
    specialCopies:carrying.reduce((a,r)=>a+r.printedSpecialCopies,0),
    currentNumericRecognized:carrying.reduce((a,r)=>
      a+r.currentNumericRecognized,0),
    richerModelRecognized:carrying.reduce((a,r)=>
      a+r.richerModelRecognized,0),
    stillUnmodeled:carrying.reduce((a,r)=>a+r.stillUnmodeled,0),
    fullyKnownRanks:carrying.filter(x=>x.stillUnmodeled===0)
      .map(x=>x.rank),
    partialRanks:carrying.filter(x=>x.richerModelRecognized>0&&
      x.stillUnmodeled>0).map(x=>x.rank),
    zeroRanks:carrying.filter(x=>x.richerModelRecognized===0)
      .map(x=>x.rank),
    recognizedPrintings:[...covered].sort(),
    rows,qualification:{
      publicConditionalEnergySymbolModelOnly:true,
      nativeStoreLegality:false,fullCardEffects:false,
      actorActionPolicy:false,competitiveGameQualified:false
    }
  };
}
if(require.main===module){
  const source=require('../results/aichi-2026/full-decklists.json');
  process.stdout.write(JSON.stringify(auditEnergyModelBridge(source),null,2)+'\n');
}
module.exports={auditEnergyModelBridge};
