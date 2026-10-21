'use strict';

const assert=require('node:assert/strict');
const {runDevelopment}=require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const {VERSION}=require('../simulation/twinleaf/agent1-charged-promotion-choice.cjs');

const SETTINGS=Object.freeze({
  sourceFirstRetrospective:true,
  actorOnlyComposition:true,
  actorChoosePokemon:true,
  paperSupporterQuota:true
});

/**
 * Describe all attempted native same-checkout, same-deal arms. A changed
 * root action is causal to the policy variant under a stable physical deal,
 * but engine results remain untimed and competitively unqualified.
 * @param {object} control
 * @param {object} treatment
 * @returns {object[]}
 */
function compare(control,treatment){
  assert.equal(control.attempted,4);
  assert.equal(treatment.attempted,4);
  assert.equal(control.rows.length,treatment.rows.length);
  return control.rows.map((before,i)=>{
    const after=treatment.rows[i];
    assert.equal(before.trial.id,after.trial.id);
    assert.equal(before.trial.seed,after.trial.seed);
    assert.equal(before.trial.candidateSlot,after.trial.candidateSlot);
    const sameSourceDeal=before.sourceDealFingerprint!==null&&
      before.sourceDealFingerprint!==undefined&&
      before.sourceDealFingerprint===after.sourceDealFingerprint;
    const sameActualStarter=before.actualStarterSeat!==undefined&&
      before.actualStarterSeat!==null&&
      before.actualStarterSeat===after.actualStarterSeat;
    const first=before.rootActionLedger??[];
    const second=after.rootActionLedger??[];
    let commonPrefix=0;
    while(commonPrefix<first.length&&commonPrefix<second.length&&
      JSON.stringify(first[commonPrefix])===JSON.stringify(second[commonPrefix]))
      commonPrefix++;
    const decisions={
      control:before.actorOnlyDecisionCoverage?.detailedComponentAudits
        ?.choosePokemon?.boundedSelections??[],
      treatment:after.actorOnlyDecisionCoverage?.detailedComponentAudits
        ?.choosePokemon?.boundedSelections??[]
    };
    return {
      id:before.trial.id,sourceRank:before.trial.rank,
      physicalCandidateSeat:before.trial.candidateSlot,
      sameSourceDeal,sameActualStarter,
      baselineStatus:before.status,treatmentStatus:after.status,
      baselineError:before.error??null,treatmentError:after.error??null,
      baselineActions:before.actions??null,treatmentActions:after.actions??null,
      baselinePrizes:before.prizesRemaining??null,
      treatmentPrizes:after.prizesRemaining??null,
      baselineWinner:before.winner??null,treatmentWinner:after.winner??null,
      baselineRoots:first.length,treatmentRoots:second.length,
      identicalRootLedger:commonPrefix===first.length&&commonPrefix===second.length,
      commonPrefixRootCount:commonPrefix,
      firstDifferingControlRoot:first[commonPrefix]??null,
      firstDifferingTreatmentRoot:second[commonPrefix]??null,
      choosePokemon:decisions,
      competitiveQualified:false
    };
  });
}

/** @returns {object} */
function runPair(){
  const control=runDevelopment({...SETTINGS,actorChargedPromotion:false});
  const treatment=runDevelopment({...SETTINGS,actorChargedPromotion:true});
  const pairs=compare(control,treatment);
  return {
    version:'agent1-charged-promotion-native-pair-v1',
    selectorVersion:VERSION,settings:SETTINGS,
    sourceFirstHistoricallySelected:true,
    policyOnlyDifference:'own-Bench ChoosePokemon index prioritizes attached Energy CARD count',
    control,treatment,pairs,
    allFourSameSourceDeals:pairs.every(p=>p.sameSourceDeal),
    allFourSameActualStarters:pairs.every(p=>p.sameActualStarter),
    competitiveQualifiedGames:0,
    competitiveStrengthInferred:false
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(runPair(),null,2)+'\n');
module.exports={compare,runPair,SETTINGS};
