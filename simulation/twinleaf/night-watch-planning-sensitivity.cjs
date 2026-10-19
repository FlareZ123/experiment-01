'use strict';

const assert=require('node:assert/strict');
const {isDeepStrictEqual}=require('node:util');
const {oneArm,SEED}=require('./rank11-night-watch-random-paired.cjs');

/** All planning draws choose the lowest available opaque index. */
function lowPlanningSample(){ return 0; }
/** All planning draws choose the highest available opaque index. */
function highPlanningSample(){ return 0.999; }

/** @param {object[]} left @param {object[]} right @returns {number|null} */
function firstDifference(left,right){
  for(let i=0;i<Math.max(left.length,right.length);i++){
    if(!isDeepStrictEqual(left[i],right[i]))return i;
  }
  return null;
}

/**
 * Fixed real source RNG, fixed per-seat policy RNG, and equal exact 60s in two
 * reproducible counterfactuals. Only planning-time Night Watch sampled indices
 * differ. This is a stress test of policy sensitivity, never a match statistic.
 * @returns {object}
 */
function run(){
  const low=oneArm(true,{
    planningRandomSource:lowPlanningSample,
    includeRootLedger:true,labelSuffix:'-planning-low'
  });
  const high=oneArm(true,{
    planningRandomSource:highPlanningSample,
    includeRootLedger:true,labelSuffix:'-planning-high'
  });
  assert.equal(low.seed,SEED);
  assert.equal(high.seed,SEED);
  assert.equal(low.sourceDigest,high.sourceDigest);
  assert.equal(low.firstTurnSlot,high.firstTurnSlot);
  assert.equal(low.firstTurnSlot,1,'Authentic seed opening start changed');
  assert.equal(low.candidateLength,60);
  assert.equal(high.candidateLength,60);
  assert.equal(low.opponentLength,60);
  assert.equal(high.opponentLength,60);
  assert.equal(low.hook.invalid,0);
  assert.equal(high.hook.invalid,0);
  assert.equal(low.hook.planningRandomOverrideEnabled,true);
  assert.equal(high.hook.planningRandomOverrideEnabled,true);
  assert.ok(low.hook.precommitsInBotDecision>0);
  assert.ok(high.hook.precommitsInBotDecision>0);
  assert.ok(Array.isArray(low.rootActionLedger));
  assert.ok(Array.isArray(high.rootActionLedger));
  const i=firstDifference(low.rootActionLedger,high.rootActionLedger);
  const decisionI=firstDifference(low.decisionTrace,high.decisionTrace);
  const choiceI=firstDifference(low.sourceHandTransitions,high.sourceHandTransitions);
  const arm=x=>({
    firstTurnSlot:x.firstTurnSlot,finished:x.finished,winner:x.winner,
    actionCount:x.actualActions,nightWatchDeclarations:x.declarations.length,
    liveHandPositions:x.sourceHandTransitions,
    rootLedgerLength:x.rootActionLedger.length,
    selectiveDecisionTraceLength:x.decisionTrace.length,
    chanceAudit:x.hook,
    rootActionLedger:x.rootActionLedger,
    decisionTrace:x.decisionTrace,
    physicalZoneIntegrity:x.rootPhysicalIntegrity
  });
  return {
    schema:'night-watch-planning-only-chance-sensitivity-v1',
    preregistration:'results/twinleaf/night-watch-planning-only-sensitivity-registration.md',
    seed:SEED,sourceDigest:low.sourceDigest,candidateRank:1,sourceRank:11,
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    samplingMode:'deterministic-planning-only-low-versus-high-index-stress',
    actualSourceGameRandomness:'unchanged-fixed-match-seed',
    firstRootActionDivergenceIndex:i,
    firstRootActionDivergence:i===null?null:{
      low:low.rootActionLedger[i]??null,high:high.rootActionLedger[i]??null
    },
    firstSelectiveDecisionDivergenceIndex:decisionI,
    firstRootNightWatchEffectDivergenceIndex:choiceI,
    rootLedgerExactlyEqual:i===null,
    low:arm(low),high:arm(high),
    sourceGamesRepresented:1,
    independentGames:0,competitiveQualifiedGames:0,
    qualifiedForCompetitiveInference:false
  };
}

if(require.main===module){
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
}
module.exports={run,firstDifference};
