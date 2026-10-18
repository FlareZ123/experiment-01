'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {withStoreDispatchTranscript}=require('./store-dispatch-transcript.cjs');
const {withRank8BoostShakeFork}=require('./rank8-boostshake-source-fork.cjs');
const {withHoodGarbotoxinRecoveryAutonomy}=
  require('./hood-garbotoxin-recovery-autonomy.cjs');
const {withRank8AutonomousBoostShake}=
  require('./rank8-boostshake-autonomous-policy.cjs');

/**
 * Actual 60-versus-60 source-locked autonomous-pressure comparison.
 * Known positive source seed is reused to test policy substitution only.
 * Every attempt, Store root dispatch, selected prompt and board response are
 * kept separate, and game outcomes remain unqualified.
 * @returns {object}
 */
function run() {
  initializeCards();
  const candidate=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
  const plan=planAichi(candidate,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true
  });
  const opponent=plan.opponents.find(item=>item.rank===8);
  assert.equal(opponent?.status,'ready');
  const seed=1260748957;
  const request={
    deckA:opponent.cards,deckB:plan.candidate.cards,seed,maxActions:200,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    doubleDragonRecovery:true,supporterDecisionCorrection:true,
    isolatePolicyRandomness:true,leleEntryAbilityLockCorrection:true,
    radiantGateLockCorrection:true,entryDrawLockCorrection:true,
    captureDecisionTrace:true,label:'rank8-source-owner-visible-opponent-policy'
  };
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const opts={liveStoreOnly:true,typedActionValues:true,
    promptReferenceActionValues:true,sourceZoneEveryDispatch:true};
  /** @param {()=>object} play */
  const trace=play=>withStoreDispatchTranscript(Store,play,opts);
  const control=trace(()=>runMatch(request));
  const manual=trace(()=>withRank8BoostShakeFork(()=>runMatch(request)));
  const adaptive=trace(()=>withRank8AutonomousBoostShake(0,()=>runMatch(request)));
  const paired=trace(()=>withRank8AutonomousBoostShake(0,()=>
    withHoodGarbotoxinRecoveryAutonomy(1,()=>runMatch(request))));
  const noOp=trace(()=>withRank8AutonomousBoostShake(1,()=>runMatch(request)));
  assert.equal(control.result.firstTurnSlot,0);
  assert.equal(adaptive.result.policyAudit.attempted,true);
  assert.equal(adaptive.result.policyAudit.aborted,null);
  assert.equal(adaptive.result.policyAudit.completed,true);
  assert.equal(adaptive.result.policyAudit.events
    .filter(item=>item.kind==='proposed-action').length,11);
  assert.equal(paired.result.policyAudit.completed,true);
  assert.equal(paired.result.result.policyAudit.triggered,true);
  assert.equal(paired.result.result.policyAudit.successfulEffect,true);
  assert.equal(noOp.result.policyAudit.attempted,false);
  assert.deepEqual(noOp.actionTrace,control.actionTrace,
    'Ineligible alternate physical seat must not disturb any Store action');
  assert.deepEqual(adaptive.actionTrace.slice(0,86),control.actionTrace.slice(0,86),
    'Autonomous opponent changed the established original source prefix');
  assert.deepEqual(adaptive.actionTrace.slice(86,97),
    manual.actionTrace.slice(86,97),
    'Autonomous selected Store actions differ from legal manual positive control');
  assert.deepEqual(paired.actionTrace.slice(0,97),
    adaptive.actionTrace.slice(0,97),
    'Conditional candidate recovery changed the opponent root sequence');
  const restored=trace(()=>runMatch(request));
  assert.deepEqual(restored.actionTrace,control.actionTrace,
    'Nested source policy failed to restore the original bot');
  return {
    schema:'rank8-autonomous-source-opponent-and-candidate-v1',
    sourceSeed:seed,opponentRank:8,
    opponentSourcePrinted60:true,candidateSourcePrinted60:true,
    engineRevision:plan.engineRevision,
    originalSourcePrefixActions:86,
    auditedOpponentActualRootActions:11,
    attemptWasAutonomous:true,
    opponentPolicy:adaptive.result.policyAudit,
    candidatePolicy:paired.result.result.policyAudit,
    actualFirstTurnSlot:control.result.firstTurnSlot,
    baseline:{actions:control.result.actions,finished:control.result.finished,
      prizesRemaining:control.result.prizesRemaining},
    autonomousOpponent:{actions:adaptive.result.result.actions,
      finished:adaptive.result.result.finished,
      prizesRemaining:adaptive.result.result.prizesRemaining},
    autonomousPair:{actions:paired.result.result.result.actions,
      finished:paired.result.result.result.finished,
      prizesRemaining:paired.result.result.result.prizesRemaining},
    noOpportunityControlRootStreamIdentical:true,
    opponentPositiveControlRootStepsIdentical:true,
    candidateDoesNotRewriteOpponentRootSteps:true,
    afterAllAdaptersRestoredRootStreamIdentical:true,
    qualifiedForCompetitiveInference:false,
    statement:'One reused authentic seed and conditional source action path only'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
