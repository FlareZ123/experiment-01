'use strict';
const assert=require('node:assert/strict');
const {exactOpportunity}=require('./agent25-dhelmise-t1-physical-opportunity.cjs');
const {prizeSurvival,printCard}=require('./agent25-dhelmise-hns-discard-lock.cjs');
const candidate=require('../results/als/agent25-dhelmise-mixed-lock-answers-v2.json');
const VERSION='agent25-dhelmise-donor-count-frontier-v1';

/**
 * Exact paper text/discard-Ability print constraints for hypothetical donor
 * count changes only. Other-card cuts are unspecified and unvalidated.
 * @param {2|3|4} pairCopies Count each of Psychic Shuppet and Grass Sinistcha.
 * @returns {object} Exact card-location and six-Prize necessary events.
 */
function donorScenario(pairCopies){
  assert.ok([2,3,4].includes(pairCopies));
  const banette=4,shuppet=pairCopies,sinistcha=pairCopies;
  const totalDonors=banette+shuppet+sinistcha;
  const countCategories=[4,totalDonors,4,4,1,2,4,41-totalDonors];
  const basicCount=14+pairCopies-2;
  assert.equal(countCategories.reduce((a,b)=>a+b,0),60);
  assert.equal(printCard('me5-34').subtypes[0],'Stage 1');
  assert.ok(printCard('me5-34').types.includes('Psychic'));
  assert.ok(printCard('me5-33').subtypes.includes('Basic'));
  assert.ok(printCard('me5-33').types.includes('Psychic'));
  assert.ok(printCard('me5-6').subtypes.includes('Stage 1'));
  assert.ok(printCard('me5-6').types.includes('Grass'));
  const direct=exactOpportunity({counts:countCategories,basicCount});
  const wobb=prizeSurvival(banette+shuppet);
  const lab=prizeSurvival(banette+sinistcha);
  const ordinary=prizeSurvival(totalDonors);
  return {
    donorComposition:{'Banette ME5 34':banette,
      'Shuppet ME5 33':shuppet,'Sinistcha ME5 6':sinistcha},
    donors:totalDonors,basicCount,
    sourceV2OnlyWhenEight:pairCopies===2,
    hypotheticalNonDonorCardsCut:totalDonors-8,
    absoluteDeckCards:60,
    cardLocationUnconditional:direct.unconditionalProbability,
    cardLocationConditionalBasicValid:direct.conditionalBasicValidProbability,
    basicValidOpeningProbability:direct.basicValidOpeningProbability,
    blenderRouteUnconditional:Number(direct.favorableViaBlender)/
      Number(direct.denominator),
    compressorOnlyRouteUnconditional:Number(direct.favorableViaCompressorOnly)/
      Number(direct.denominator),
    wobbuffetEffectiveDonors:banette+shuppet,
    silentLabEffectiveDonors:banette+sinistcha,
    noLockPrizeOnlyProbability:ordinary.unprizedAtLeastNeedProbability,
    wobbuffetPrizeOnlyProbability:wobb.unprizedAtLeastNeedProbability,
    silentLabPrizeOnlyProbability:lab.unprizedAtLeastNeedProbability,
    garbotoxinEffectiveDonors:0,
    garbotoxinPrizeOnlyProbability:0,
    actualDiscardAndSearchLinesUnverified:true,
    conditionalOnExactlySevenThenOneDrawNoOtherAccess:true
  };
}
function study(){
  const base=candidate.cards.filter(c=>
    ['me5-34','me5-33','me5-6'].includes(c.id));
  assert.deepEqual(base.map(row=>[row.id,row.count]),
    [['me5-34',4],['me5-6',2],['me5-33',2]]);
  const scenarios=[2,3,4].map(donorScenario);
  const baseline=scenarios[0];
  return {version:VERSION,sourceCandidate:candidate.version,
    candidate60Unchanged:true,
    additionalScenariosAreAbstractNotCompleteDecklists:true,
    scenarios:scenarios.map(s=>({...s,
      unconditionalDeltaPercentagePoints:
        100*(s.cardLocationUnconditional-baseline.cardLocationUnconditional),
      worstNamedPartialLockPrizeOnly:
        Math.min(s.wobbuffetPrizeOnlyProbability,s.silentLabPrizeOnlyProbability)
    })),competitiveQualifiedGames:0};
}
module.exports={VERSION,donorScenario,study};
if(require.main===module)process.stdout.write(JSON.stringify(study(),null,2)+'\n');
