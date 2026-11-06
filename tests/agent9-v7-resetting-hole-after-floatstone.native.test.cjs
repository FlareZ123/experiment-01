'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {runOriginalV7GuzmaCanary,makeOpponentFloatStoneReplyLayer}=
  require('../simulation/evaluation/agent9-v7-guzma-causal-replay.cjs');
const {withFloatStoneOwnerCounterReply}=
  require('../simulation/twinleaf/agent9-v7-floatstone-counterreply.cjs');
const {writeLocked}=require(
  '../simulation/evaluation/agent5-rank6-paid-dce-thunder-volt-v10.cjs');

test('on exact source deal owner uses Float Stone, retreats, then Resetting Hole deletes Thunder',()=>{
  const out=runOriginalV7GuzmaCanary({
    voltLayer:makeOpponentFloatStoneReplyLayer({
      float:next=>withFloatStoneOwnerCounterReply(next,{
        includeResettingHole:true
      })
    })
  });
  const dir=process.env.AGENT9_V7_RESETTING_HOLE_DIR;
  if(dir)writeLocked(path.join(dir,
    'agent9-v7-guzma-opponent-float-reset-hole.json'),out);
  const c=out.comparison,a=c.target,m=a.opponentFloatStoneCounter;
  const both=out.treatmentReceipt.attempts.find(x=>x.id===a.id);
  const attackSet=both.actualSourceAttackSettlement?.attacks??[];
  console.log('AGENT9_V7_POSTFLOAT_MARSHADOW_HOLE',JSON.stringify({
    checkout:out.checkout,vendor:out.vendorPin,
    registeredArms:c.arms,allPhysicalOpeningsMatch:
      c.sameOriginalPhysicalOpenings,
    sevenOtherOriginalActionHistories:c.nonTargetExactPublicReplays,
    controlRestoration:out.controlRoundtrip.fullABAReturnToOriginal,
    exactRoot:a.firstTreatmentDifference,
    ownerGuzma:a.guzmaCanary,ownerGuzmaPrompts:a.guzmaPromptContinuation,
    opponentCounter:m,
    opponentTurnSix:both.publicRootActions.filter(action=>
      action.turnBefore===6&&
      action.playerSlot===1&&
      action.action!=='ResolvePromptAction'),
    sourceSettledAttacks:attackSet.map(x=>({
      turn:x.turnBefore,name:x.attackName,
      prizesBefore:x.prizesBefore,prizesAfter:x.prizesAfter
    })),
    completedGames:0
  }));
  assert.equal(c.arms,8);
  assert.equal(c.sameOriginalPhysicalOpenings,true);
  assert.equal(c.nonTargetExactPublicReplays,7);
  assert.equal(out.controlRoundtrip.fullABAReturnToOriginal,true);
  assert.equal(a.firstControlDifference.actionOrdinal,32);
  assert.equal(a.firstControlDifference.action,'PassTurnAction');
  assert.equal(a.firstTreatmentDifference.action,'PlayCardAction');
  assert.equal(a.firstTreatmentDifference.card,'Guzma');
  assert.equal(a.guzmaCanary.nativeStoreAcceptedGuzmaRoots,1);
  assert.equal(a.guzmaPromptContinuation.ownTargetPhysicalConfirmations,1);
  assert.equal(a.guzmaPromptContinuation.gustTargetPhysicalConfirmations,1);
  assert.equal(m.acceptedNativeTools,1);
  assert.equal(m.acceptedNativeRetreats,1);
  assert.equal(m.proposedResettingHole,1);
  assert.equal(m.acceptedResettingHole,1);
  assert.equal(m.nativeRejects,0);
  const hole=m.records.find(x=>
    x.kind==='remove-thunder-with-benched-marshadow');
  assert.ok(hole);
  assert.equal(hole.accepted,true);
  assert.equal(hole.thunderStadiumAbsentAfter,true);
  assert.equal(hole.thunderInSourceLostZoneAfter,true);
  assert.equal(hole.marshadowBenchedAfter,false);
  assert.equal(hole.marshadowInOwnerDiscardAfter,true);
  assert.equal(out.competitiveGamesQualified,0);
});
