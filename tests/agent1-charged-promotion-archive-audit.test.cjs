'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {audit,VERSION}=
  require('../scripts/agent1-charged-promotion-archive-audit.cjs');

/** @returns {object} Four synthetic identical-source historical fixtures. */
function fixture(){
  const rows=Array.from({length:4},(_,i)=>({
    trial:{id:'trial-'+i},
    sourceActuallyFirst:true,
    actorOnlyDecisionCoverage:{detailedComponentAudits:{
      choosePokemon:{selected:i,postconditionsConfirmed:i,
        boundedSelections:[{turn:7,choiceIndex:0,offered:1,
          selectedPrinting:'Garbodor BKP'}]}
    }},
    sourceOwnerPostPassMobility:{
      totalSourcePasses:2,strippedGarbodorPasses:1,
      observations:[
        {strandedGarbodor:true,hasHeldMobility:true,
          globalTurn:7,activeName:'Garbodor',activeEnergyCards:[],
          mobilityHeld:{'Float Stone':1,'Guzma':0,'Escape Rope':0},
          benchNames:['Oranguru V']},
        {strandedGarbodor:false,hasHeldMobility:false}
      ]
    }
  }));
  return {
    version:'agent1-charged-promotion-native-pair-v1',
    selectorVersion:'charge-v1',
    competitiveQualifiedGames:0,sourceFirstHistoricallySelected:true,
    allFourSameSourceDeals:true,allFourSameActualStarters:true,
    control:{attempted:4,rows},
    treatment:{attempted:4,rows:rows.map(x=>({...x}))},
    pairs:rows.map((row,i)=>({
      id:row.trial.id,identicalRootLedger:true,
      baselineRoots:i+50,treatmentRoots:i+50,sameSourceDeal:true
    }))
  };
}

test('four historical pairs and source-owned mobility have correct bounded values',()=>{
  const output=audit(fixture());
  assert.equal(output.version,VERSION);
  assert.equal(output.genuineNativeRootComparisons.length,4);
  assert.equal(output.genuineNativeRootComparisons[0].realSourceFirst,true);
  assert.equal(output.genuineNativeRootComparisons[0].nativeChoosePokemonSelected[0],0);
  assert.equal(output.genuineNativeRootComparisons[1].sourceStrandedAndHeldMobility,1);
  assert.equal(output.genuineNativeRootComparisons[1].strandedHeldMobilityExamples[0].mobilityHeld['Float Stone'],1);
  assert.equal(output.competitiveGames,0);
});

test('rejects wrong trial attribution and unsupported nonhistorical status',()=>{
  const wrong=fixture();
  wrong.treatment.rows[2]={trial:{id:'other'}};
  assert.throws(()=>audit(wrong),/trial-2/);
  const status=fixture();
  status.competitiveQualifiedGames=1;
  assert.throws(()=>audit(status));
});
