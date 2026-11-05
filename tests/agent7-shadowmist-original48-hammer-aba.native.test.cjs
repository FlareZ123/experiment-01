'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {VERSION,TARGET,runOriginalShadowMistHammerAB}=
  require('../simulation/evaluation/agent7-shadowmist-original48-hammer-aba.cjs');

test('same original rank6 physical deal changes from locked Pass to Hammer',()=>{
  const result=runOriginalShadowMistHammerAB();
  const target=result.target;
  const summary={
    version:VERSION,actualRegisteredTrials:result.historicalRegisteredTrialCount,
    unchangedOriginalAndFullDeal:result.unchangedOriginalAndFullDeal,
    sourceIndependentCommonPolicy:result.sourceIndependentCommonPolicy,
    originalNativeRootCap:result.fixedNativeRootActionLimit,
    exactRank6HistoricalTrial:TARGET,
    targetSourceSeat:target.originalSourceSeat,
    targetOriginalDealSha256:target.sourceDealSha256,
    targetRootDivergence:target.firstDivergence,
    targetControlRootCount:target.controlRootCount,
    targetTreatmentRootCount:target.treatmentRootCount,
    allOriginalTrialPairs:result.paired.map(row=>({
      id:row.id,originalSourceSeat:row.originalSourceSeat,
      controlStatus:row.controlStatus,treatmentStatus:row.treatmentStatus,
      controlFinished:row.controlFinished,
      treatmentFinished:row.treatmentFinished,
      controlRoots:row.controlRootCount,
      treatmentRoots:row.treatmentRootCount,
      firstChangedRoot:row.firstDivergence
    })),
    qualifiedCompetitiveGames:result.competitiveGamesQualified,
    actualPaperGameWins:null
  };
  console.log('AGENT7_SHADOWMIST_HAMMER_ORIGINAL_AB',JSON.stringify(summary));
  assert.equal(result.historicalRegisteredTrialCount,8);
  assert.equal(result.fixedNativeRootActionLimit,48);
  assert.equal(result.sourceIndependentCommonPolicy,true);
  assert.equal(target.originalSourceSeat,1);
  assert.ok(target.firstDivergence,'A real native policy difference is required');
  assert.equal(target.firstDivergence.control.action,'PassTurnAction');
  assert.equal(target.firstDivergence.treatment.action,'PlayCardAction');
  assert.equal(target.firstDivergence.treatment.card,'Crushing Hammer');
  assert.equal(result.competitiveGamesQualified,0);
});
