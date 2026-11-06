'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {runOriginalV7GuzmaCanary,
  makeOpponentFloatStoneReplyLayer}=require(
  '../simulation/evaluation/agent9-v7-guzma-causal-replay.cjs');
const {writeLocked}=require(
  '../simulation/evaluation/agent5-rank6-paid-dce-thunder-volt-v10.cjs');

test('opponent-owned held Float Stone and physical free retreat after exact source paid Guzma',()=>{
  const out=runOriginalV7GuzmaCanary({
    voltLayer:makeOpponentFloatStoneReplyLayer()
  });
  const directory=process.env.AGENT9_V7_FLOATSTONE_COUNTER_DIR;
  if(directory)writeLocked(path.join(directory,
    'agent9-v7-floatstone-guzma-opponent-control.json'),out);
  const c=out.comparison,trial=c.target;
  console.log('AGENT9_V7_FLOATSTONE_COUNTER',JSON.stringify({
    schema:out.schema,
    checkout:out.checkout,vendor:out.vendorPin,
    eightPhysicalDealsMatched:c.sameOriginalPhysicalOpenings,
    sevenUntouched:c.nonTargetExactPublicReplays,
    ABAControlRestored:out.controlRoundtrip.fullABAReturnToOriginal,
    target:{
      id:trial.id,original:trial.firstControlDifference,
      counterfactual:trial.firstTreatmentDifference,
      sourceGuzma:trial.guzmaCanary,
      guzmaNativePrompt:trial.guzmaPromptContinuation,
      opponentRealToolAndRetreat:trial.opponentFloatStoneCounter
    },qualifiedGames:0
  }));
  assert.equal(c.arms,8);
  assert.equal(c.sameOriginalPhysicalOpenings,true);
  assert.equal(c.nonTargetExactPublicReplays,7);
  assert.equal(out.controlRoundtrip.fullABAReturnToOriginal,true);
  assert.equal(trial.firstControlDifference?.actionOrdinal,32);
  assert.equal(trial.firstControlDifference?.action,'PassTurnAction');
  assert.equal(trial.firstTreatmentDifference?.actionOrdinal,32);
  assert.equal(trial.firstTreatmentDifference?.card,'Guzma');
  assert.equal(trial.guzmaCanary?.nativeStoreAcceptedGuzmaRoots,1);
  assert.equal(trial.guzmaPromptContinuation?.gustTargetPhysicalConfirmations,1);
  assert.equal(trial.guzmaPromptContinuation?.ownTargetPhysicalConfirmations,1);
  assert.equal(trial.opponentFloatStoneCounter?.acceptedNativeTools,1);
  assert.equal(trial.opponentFloatStoneCounter?.acceptedNativeRetreats,1);
  assert.deepEqual(trial.opponentFloatStoneCounter?.
    genericFloatStoneIntents?.map(x=>x.sharedGenericIntent),[
      'attach-emergency-floatstone','retreat-emergency-floatstone'
    ]);
  assert.equal(trial.opponentFloatStoneCounter?.
    genericFloatStoneIntents?.every(x=>
      x.samePhysicalHandIndex===true&&
      x.sameBenchDestination===true),true);
  assert.equal(trial.opponentFloatStoneCounter?.nativeRejects,0);
  assert.equal(out.competitiveGamesQualified,0);
});
