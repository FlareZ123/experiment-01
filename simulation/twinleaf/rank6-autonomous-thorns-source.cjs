'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch}=require('./headless.cjs');
const {withSourceOpeningProbe}=require('./rank6-seed-opening-probe.cjs');
const {withDamageObserver}=require('./rank6-seed-guzma-hala-fork.cjs');
const {withAutonomousThornsSourceAttack}=
  require('./rank6-autonomous-thorns-line.cjs');
const {publicTurnLedger}=require('./rank6-response-projection.cjs');

const positiveSeed=20367160;
const heldOutSeeds=[20367161,20367162,20367163,20367164];

/** @param {object} game */
function describeGame(game) {
  return {
    firstTurnSlot:game.firstTurnSlot,
    drawLogVerified:game.verifiedByDrawLog,
    finished:game.finished,
    engineWinner:game.finished?game.winner:null,
    actions:game.actions,
    turns:game.turns,
    attackCountBySeat:[0,1].map(seat=>
      game.attackTrace.filter(row=>row.seat===seat).length),
    opponentThirdTurn:publicTurnLedger(game.decisionTrace,{seat:0,turn:3})
  };
}

/**
 * Source-dealt autonomous opponent attack and real downstream opponent turn.
 * No card is inserted, seeded decision is forced, or hidden Prize is consulted
 * by the decision policy. Control and treatment share the original physical
 * seed, paper-source 60s and normal headless simulator options.
 * @returns {object}
 */
function main() {
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const rank6=plan.opponents.find(entry=>entry.rank===6);
  assert.equal(plan.candidate.cards.length,60);
  assert.equal(rank6.cards.length,60);
  const base={
    deckA:plan.candidate.cards,deckB:rank6.cards,
    maxActions:125,strictPromptValidation:true,
    forestSealSearchCorrection:true,doubleDragonRecovery:true,
    supporterDecisionCorrection:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,leleEntryAbilityLockCorrection:true,
    radiantGateLockCorrection:true,entryDrawLockCorrection:true
  };
  const request={...base,seed:positiveSeed};
  const control=withSourceOpeningProbe(()=>runMatch(request));
  const treated=withSourceOpeningProbe(()=>
    withAutonomousThornsSourceAttack(()=>
      withDamageObserver(()=>runMatch(request))));
  const action=treated.out;
  const game=action.result.result;
  assert.equal(control.out.firstTurnSlot,0);
  assert.equal(game.firstTurnSlot,0);
  assert.equal(control.out.verifiedByDrawLog,true);
  assert.equal(game.verifiedByDrawLog,true);
  assert.deepEqual(treated.observed.hand,control.observed.hand);
  assert.deepEqual(treated.observed.prizes,control.observed.prizes);
  assert.deepEqual(treated.observed.doubleColorless,
    control.observed.doubleColorless);
  assert.deepEqual(game.deckHashes,control.out.deckHashes);
  assert.equal(action.started,true,
    'Physical source hand did not activate autonomous public-hand gate');
  assert.equal(action.completed,true,
    'Autonomous policy did not reach Volt Cyclone attack');
  assert.equal(action.abortReason,null);
  assert.equal(action.result.attack?.announced,'Volt Cyclone');
  assert.equal(action.result.attack?.damageBefore,0);
  assert.equal(action.result.attack?.damageAfter,140);
  assert.ok(game.attackTrace.some(row=>row.seat===1 &&
    row.attack==='Volt Cyclone'), 'No real opponent AttackAction found');
  const opponentResponse=publicTurnLedger(game.decisionTrace,
    {seat:0,turn:3});
  assert.ok(opponentResponse.length>0,
    'Original-source champion did not make a real next turn response');

  const heldOut=heldOutSeeds.map(seed=>{
    const observation=withAutonomousThornsSourceAttack(()=>
      runMatch({...base,seed,maxActions:95}));
    return {
      seed,
      started:observation.started,
      attackProposed:observation.completed,
      abortReason:observation.abortReason,
      openingPolicyEvents:observation.events,
      ...describeGame(observation.result)
    };
  });
  const report={
    schema:'rank6-real-source-hand-autonomous-thorns-attack-v1',
    experimentPrecommittedSeeds:[positiveSeed,...heldOutSeeds],
    positiveControlSeed:positiveSeed,
    frozenSourceRanks:[1,6],
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    alternativePolicy:'hand-visible-low-discard-G&H-DCE-Thunder-Volt-v1',
    sourceInventoryHashes:game.deckHashes,
    seedSameHand:true,
    seedSamePrizeSix:true,
    seedSameDCEZone:true,
    control:describeGame(control.out),
    alternative:describeGame(game),
    autonomy:{
      actualAttackDamage:action.result.attack.damageAfter,
      started:action.started,completed:action.completed,
      abortReason:action.abortReason,
      events:action.events
    },
    heldOut,
    sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false,
    interpretation:'One source-dealt positive control plus four prospectively fixed unseen seeds. The policy reads own hand and legally prompted own deck only. All unexposed seeds remain in denominator. The champion continuation uses an unqualified generic bot; no game is evidence of human-competent win rate.'
  };
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  return report;
}
if(require.main===module) main();
module.exports={main,describeGame};
