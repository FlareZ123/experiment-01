'use strict';

const assert=require('node:assert/strict');
const registration=require('../../results/aichi-2026/registrations/rank6-actual-first-eligible-v1-20261019.json');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch}=require('./headless.cjs');
const {withBroadThornsSourceAttack}=require('./rank6-broad-thorns-policy.cjs');
const {publicTurnLedger}=require('./rank6-response-projection.cjs');

/** @param {object} game */
function summarize(game) {
  const sourceTurn=game.firstTurnSlot===1?3:2;
  const opponentNextTurn=sourceTurn+1;
  const attacks=game.attackTrace.filter(row=>
    row.seat===1 && row.turn===sourceTurn && row.attack==='Volt Cyclone');
  return {
    actualFirstEngineSlot:game.firstTurnSlot,
    drawLogVerified:game.verifiedByDrawLog,
    engineFinished:game.finished,
    engineWinner:game.finished?game.winner:null,
    actionCount:game.actions,
    lastTurn:game.turns,
    sourceEligibleGlobalTurn:sourceTurn,
    sourceFirstEligibleVoltAttacks:attacks.length,
    sourceAttackDeclarations:attacks,
    publicOpponentResponse:publicTurnLedger(game.decisionTrace,{
      seat:0,turn:opponentNextTurn
    }),
    sourceDeckHashes:game.deckHashes
  };
}

/** @param {object} base @param {number} seed */
function oneTrial(base,seed) {
  const input={...base,seed};
  const row={seed,control:null,treatment:null,policy:null,
    controlError:null,treatmentError:null};
  try {
    row.control=summarize(runMatch(input));
  } catch(error) {
    row.controlError=String(error?.message??error);
  }
  try {
    const probe=withBroadThornsSourceAttack(()=>runMatch(input),{
      turn:'first-eligible',playLockAwareOpening:true,benchBackup:true
    });
    row.treatment=summarize(probe.result);
    row.policy={started:probe.started,completed:probe.completed,
      openingPlan:probe.openingPlan,abortReason:probe.abortReason,
      ownerSelectedActions:probe.events};
  } catch(error) {
    row.treatmentError=String(error?.message??error);
    row.policy=error?.rank6PolicyEvidence??null;
  }
  if(row.control&&row.treatment) {
    assert.equal(row.control.actualFirstEngineSlot,
      row.treatment.actualFirstEngineSlot,'True start order shifted across arms');
    assert.deepEqual(row.control.sourceDeckHashes,
      row.treatment.sourceDeckHashes,'Fixed source 60 changed across arms');
    assert.equal(row.control.drawLogVerified,true);
    assert.equal(row.treatment.drawLogVerified,true);
    if(row.policy.started&&row.policy.completed) {
      assert.equal(row.treatment.sourceFirstEligibleVoltAttacks>0,true,
        'Policy claims an attack without a real eligible-turn AttackAction');
    }
  }
  return row;
}

function main() {
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(row=>row.rank===6);
  assert.equal(source?.cards.length,60);
  assert.equal(plan.candidate.cards.length,60);
  assert.equal(registration.seeds.length,24);
  assert.equal(new Set(registration.seeds).size,24);
  const base={
    deckA:plan.candidate.cards,deckB:source.cards,
    maxActions:registration.root_action_cap,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    doubleDragonRecovery:true,supporterDecisionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    leleEntryAbilityLockCorrection:true,radiantGateLockCorrection:true,
    entryDrawLockCorrection:true
  };
  const rows=registration.seeds.map(seed=>oneTrial(base,seed));
  const summary={
    registered:rows.length,
    bothArmsCompleted:rows.filter(x=>x.control&&x.treatment).length,
    controlExceptions:rows.filter(x=>x.controlError).length,
    treatmentExceptions:rows.filter(x=>x.treatmentError).length,
    actualSourceFirst:rows.filter(x=>x.control?.actualFirstEngineSlot===1).length,
    actualSourceSecond:rows.filter(x=>x.control?.actualFirstEngineSlot===0).length,
    started:rows.filter(x=>x.policy?.started).length,
    actualAttacks:rows.filter(x=>x.treatment?.sourceFirstEligibleVoltAttacks>0).length,
    attacksWithOpponentReply:rows.filter(x=>
      x.treatment?.sourceFirstEligibleVoltAttacks>0 &&
      x.treatment?.publicOpponentResponse.length>0).length,
    sourceFirstAttacks:rows.filter(x=>
      x.treatment?.actualFirstEngineSlot===1 &&
      x.treatment?.sourceFirstEligibleVoltAttacks>0).length,
    sourceSecondAttacks:rows.filter(x=>
      x.treatment?.actualFirstEngineSlot===0 &&
      x.treatment?.sourceFirstEligibleVoltAttacks>0).length
  };
  const report={schema:'rank6-true-start-source-mechanics-v1',
    registration:'results/aichi-2026/registrations/rank6-actual-first-eligible-v1-20261019.json',
    sourceRanks:[1,6],enginePin:registration.engine_pin,
    researchRevision:process.env.GITHUB_SHA??null,
    treatmentOptions:{turn:'first-eligible',playLockAwareOpening:true,benchBackup:true},
    summary,rows,competitiveQualifiedGames:0,
    sourceReplayMechanicsVerified:false,
    claimScope:'Authentic source-dealt engine decisions with unqualified policies and no calibrated event clock. Retain every failure and cap; no competitive win percentage.'
  };
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  return report;
}

if(require.main===module) main();
module.exports={main,oneTrial,summarize};
