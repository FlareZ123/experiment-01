'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {withStoreDispatchTranscript}=require('./store-dispatch-transcript.cjs');
const {withRank8BoardObserver}=require('./hood-rank8-source-board-observer.cjs');
const {withRank8BoostShakeFork}=require('./rank8-boostshake-source-fork.cjs');
const {withRank8FieldBlowerReply}=require('./rank8-field-blower-source-reply.cjs');
const {withRank8PsychicRecoveryReply}=require('./rank8-psychic-recovery-source-reply.cjs');
const {withRank8HoodedDoorReply}=require('./rank8-hooded-door-source-reply.cjs');
const {withHoodGarbotoxinRecoveryAutonomy}=require('./hood-garbotoxin-recovery-autonomy.cjs');
function main(){
  const candidate=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
  const plan=planAichi(candidate,{allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
  const opponent=plan.opponents.find(d=>d.rank===8);
  assert.equal(opponent?.status,'ready');
  const request={deckA:opponent.cards,deckB:plan.candidate.cards,
    seed:1260748957,maxActions:200,strictPromptValidation:true,
    forestSealSearchCorrection:true,doubleDragonRecovery:true,
    supporterDecisionCorrection:true,isolatePolicyRandomness:true,
    leleEntryAbilityLockCorrection:true,radiantGateLockCorrection:true,
    entryDrawLockCorrection:true,captureDecisionTrace:true};
  initializeCards();
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const opts={liveStoreOnly:true,typedActionValues:true,
    promptReferenceActionValues:true,sourceZoneEveryDispatch:true};
  const control=withStoreDispatchTranscript(Store,()=>runMatch(request),opts);
  const neutral=withStoreDispatchTranscript(Store,()=>
    withHoodGarbotoxinRecoveryAutonomy(1,()=>runMatch(request)),opts);
  assert.equal(neutral.result.policyAudit.triggered,false,
    'Unmodified source game unexpectedly entered the conditioned Hood branch');
  assert.deepEqual(neutral.actionTrace,control.actionTrace,
    'No-op autonomous policy changed the unmodified source action trace');
  const observed=withRank8BoardObserver(Store,()=>
    withStoreDispatchTranscript(Store,()=>
      withRank8BoostShakeFork(()=>runMatch(request)),opts));
  const transcript=observed.result;
  const fork=transcript.result;
  const answered=withRank8BoardObserver(Store,()=>
    withStoreDispatchTranscript(Store,()=>
      withRank8FieldBlowerReply(()=>
        withRank8BoostShakeFork(()=>runMatch(request))),opts));
  const reply=answered.result.result;
  const recovered=withRank8BoardObserver(Store,()=>
    withStoreDispatchTranscript(Store,()=>
      withRank8PsychicRecoveryReply(()=>
        withRank8FieldBlowerReply(()=>
          withRank8BoostShakeFork(()=>runMatch(request)))),opts));
  const recovery=recovered.result.result;
  const hooded=withRank8BoardObserver(Store,()=>
    withStoreDispatchTranscript(Store,()=>
      withRank8HoodedDoorReply(()=>
        withRank8BoostShakeFork(()=>runMatch(request))),opts));
  const hoodedReply=hooded.result.result;
  const automatic=withRank8BoardObserver(Store,()=>
    withStoreDispatchTranscript(Store,()=>
      withHoodGarbotoxinRecoveryAutonomy(1,()=>
        withRank8BoostShakeFork(()=>runMatch(request))),opts));
  const auto=automatic.result.result;
  assert.equal(auto.result.stage,11);
  assert.equal(auto.policyAudit.triggered,true);
  assert.equal(auto.policyAudit.successfulEffect,true,
    'Automatic candidate response did not complete Hood-protected draw');
  const restored=withStoreDispatchTranscript(Store,()=>runMatch(request),opts);
  assert.deepEqual(restored.actionTrace,control.actionTrace,
    'Nested opponent and candidate policy adapters failed to restore baseline');
  assert.deepEqual(automatic.result.actionTrace.slice(0,86),
    control.actionTrace.slice(0,86),'Autonomous reply changed source prefix');
  assert.equal(hoodedReply.stage,7);
  assert.equal(hoodedReply.result.stage,11);
  assert.equal(hoodedReply.postDoorPassProbe?.observedAfterHoodedDoor,true,
    'Expected the source-dealt candidate to pass after Hooded Door setup');
  assert.equal(hoodedReply.liveLockAbilityProbes?.hoodedActive?.attachPromptOpened,true,
    'Protected Active should have an attach prompt under source Garbotoxin');
  assert.equal(hoodedReply.liveLockAbilityProbes?.unhoodedBench?.attachPromptOpened,false,
    'Unprotected Bench should be locked under source Garbotoxin');
  assert.equal(recovery.unlockedBenchAbilityProbe?.attachPromptOpened,true,
    'Field Blower should allow unprotected Bench Door after Tool removal');
  assert.equal(hoodedReply.witness?.sourceGarbodorStillEquipped,true);
  assert.equal(hoodedReply.witness?.heldFieldBlowerPreserved,true);
  assert.deepEqual(hooded.result.actionTrace.slice(0,86),
    control.actionTrace.slice(0,86),'Hooded Door changed original source prefix');
  assert.equal(recovery.stage,7);
  assert.ok(recovery.witness);
  assert.equal(recovery.result.stage,4);
  assert.equal(recovery.result.result.stage,11);
  assert.equal(reply.stage,4);
  assert.equal(reply.result.stage,11);
  assert.ok(reply.cleared);
  assert.deepEqual(answered.result.actionTrace.slice(0,86),
    control.actionTrace.slice(0,86),'Counter-response changed source prefix');
  assert.equal(control.result.firstTurnSlot,0);
  assert.equal(fork.result.firstTurnSlot,0);
  assert.equal(fork.stage,11);
  assert.ok(fork.turn8);
  assert.deepEqual(transcript.actionTrace.slice(0,86),
    control.actionTrace.slice(0,86),'Source prefix changed');
  const garbo=fork.turn8.board[0].bench.filter(p=>p.name==='Garbodor');
  assert.equal(garbo.length,1);
  assert.ok(garbo[0].tools.includes('Float Stone'));
  assert.deepEqual(reply.result.turn8.board,fork.turn8.board,
    'Counter-response changed original locked predecision board');
  assert.deepEqual(recovery.result.result.turn8.board,fork.turn8.board,
    'Resource continuation changed source-locked turn8 board');
  assert.deepEqual(hoodedReply.result.turn8.board,fork.turn8.board,
    'Hooded Door branch changed the source-locked turn8 board');
  assert.deepEqual(auto.result.turn8.board,fork.turn8.board,
    'Automatic Hood branch changed source-locked turn8 board');
  return {schema:'rank8-boostshake-real-deal-v1',
    seed:1260748957,sourcePrefixActions:86,
    sourceWitness:fork.witness,choices:fork.events,
    boardAtResponse:fork.turn8,
    candidateTurn8Actions:observed.records.filter(e=>e.turn===8)
      .map(e=>({action:e.action,seat:e.actingSeat,name:e.declaredName,
        source:e.abilitySource})),
    sourceOutcome:control.result.prizesRemaining,
    neutralPolicyControl:{
      triggered:neutral.result.policyAudit.triggered,
      fullOriginalActionStreamIdentical:true,
      afterAllAdapterRestorationIdentical:true,
      originalActionCount:control.result.actions,
      candidatePolicy:neutral.result.policyAudit.version
    },
    forkOutcome:fork.result.prizesRemaining,
    directReply:{steps:reply.events,initial:reply.initial,
      cleared:reply.cleared,prizes:reply.result.result.prizesRemaining,
      turn8Actions:reply.result.result.decisionTrace.filter(e=>
        e.turnBefore===8 && e.playerSlot===1).map(e=>({
          action:e.action,card:e.card,ability:e.ability,
          selectedCards:e.cardSelection?.selectedCards}))},
    psychicRecovery:{steps:recovery.events,witness:recovery.witness,
      unlockedBenchAbilityProbe:recovery.unlockedBenchAbilityProbe,
      turn8Actions:recovery.result.result.result.decisionTrace.filter(e=>
        e.turnBefore===8 && e.playerSlot===1).map(e=>({
          action:e.action,card:e.card,ability:e.ability,
          selectedCards:e.cardSelection?.selectedCards})),
      prizes:recovery.result.result.result.prizesRemaining},
    hoodedLiveLock:{steps:hoodedReply.events,witness:hoodedReply.witness,
      liveLockAbilityProbes:hoodedReply.liveLockAbilityProbes,
      postDoorPassProbe:hoodedReply.postDoorPassProbe,
      turn8Actions:hoodedReply.result.result.decisionTrace.filter(e=>
        e.turnBefore===8 && e.playerSlot===1).map(e=>({
          action:e.action,card:e.card,ability:e.ability,
          selectedCards:e.cardSelection?.selectedCards})),
      prizes:hoodedReply.result.result.prizesRemaining},
    autonomousHood:{audit:auto.policyAudit,
      turn8Actions:auto.result.result.decisionTrace.filter(e=>
        e.turnBefore===8 && e.playerSlot===1).map(e=>({
          action:e.action,card:e.card,ability:e.ability,
          selectedCards:e.cardSelection?.selectedCards})),
      prizes:auto.result.result.prizesRemaining},
    qualifiedForCompetitiveInference:false};
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main};