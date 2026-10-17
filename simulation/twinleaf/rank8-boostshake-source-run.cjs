'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {withStoreDispatchTranscript}=require('./store-dispatch-transcript.cjs');
const {withRank8BoardObserver}=require('./hood-rank8-source-board-observer.cjs');
const {withRank8BoostShakeFork}=require('./rank8-boostshake-source-fork.cjs');
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
  const observed=withRank8BoardObserver(Store,()=>
    withStoreDispatchTranscript(Store,()=>
      withRank8BoostShakeFork(()=>runMatch(request)),opts));
  const transcript=observed.result;
  const fork=transcript.result;
  assert.equal(control.result.firstTurnSlot,0);
  assert.equal(fork.result.firstTurnSlot,0);
  assert.equal(fork.stage,11);
  assert.ok(fork.turn8);
  assert.deepEqual(transcript.actionTrace.slice(0,86),
    control.actionTrace.slice(0,86),'Source prefix changed');
  const garbo=fork.turn8.board[0].bench.filter(p=>p.name==='Garbodor');
  assert.equal(garbo.length,1);
  assert.ok(garbo[0].tools.includes('Float Stone'));
  return {schema:'rank8-boostshake-real-deal-v1',
    seed:1260748957,sourcePrefixActions:86,
    sourceWitness:fork.witness,choices:fork.events,
    boardAtResponse:fork.turn8,
    candidateTurn8Actions:observed.records.filter(e=>e.turn===8)
      .map(e=>({action:e.action,seat:e.actingSeat,name:e.declaredName,
        source:e.abilitySource})),
    sourceOutcome:control.result.prizesRemaining,
    forkOutcome:fork.result.prizesRemaining,
    qualifiedForCompetitiveInference:false};
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main};