'use strict';
const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch,initializeCards}=require('./headless.cjs');
const {withRank11FirstTurnBoostShake}=
  require('./rank11-firstturn-boostshake-fork.cjs');

const SEED=1244180408;

/**
 * Actual source-dealt rank11 first-turn forced ALS with an unmodified,
 * continuing rank1 reference opponent. No result qualifies as win-rate data.
 */
function run(){
  initializeCards();
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const source=plan.opponents.find(x=>x.rank===11);
  assert.equal(source?.status,'ready');
  const req={
    deckA:source.cards,deckB:plan.candidate.cards,
    seed:SEED,maxActions:450,strictPromptValidation:true,
    forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    label:'rank11-source-firstturn-VIP-Stone-Shake-fork'};
  const control=runMatch(req);
  const fork=withRank11FirstTurnBoostShake(()=>runMatch(req));
  assert.equal(control.firstTurnSlot,0,'Frozen rank11 must actually go first');
  assert.equal(fork.result.firstTurnSlot,control.firstTurnSlot);
  assert.deepEqual(fork.result.deckHashes,control.deckHashes);
  assert.equal(fork.stage,11,'Full paid Boost Shake action line did not complete');
  const response=fork.response;
  assert.ok(response,'No actual Shadow Rider turn-two decision reached');
  assert.equal(response.turn,2);
  assert.equal(response.sourceUsedVSTAR,true);
  assert.ok(response.sourceBench.some(p=>p.name==='Garbodor'&&
    p.tools.includes('Float Stone')),'Tool Garbotoxin must be live before reply');
  return {
    experiment:'rank11-published-firstturn-forced-Boost-Shake-source-v1',
    engine:plan.engineRevision,sourceSeed:SEED,
    fieldDigest:plan.manifestDigest,candidateDigest:plan.candidateDigest,
    sourceRank:11,candidateRank:1,
    sourceStartsFirst:true,
    witness:fork.witness,issuedActions:fork.events,
    actualOpponentReplyAtTurnTwo:response,
    control:{finished:control.finished,winner:control.winner,
      actions:control.actions,turns:control.turns,
      remainingPrizes:control.prizesRemaining,
      firstTurnActions:control.decisionTrace.filter(e=>
        e.playerSlot===0&&e.turnBefore===1).slice(0,15)},
    forcedFork:{finished:fork.result.finished,winner:fork.result.winner,
      actions:fork.result.actions,turns:fork.result.turns,
      remainingPrizes:fork.result.prizesRemaining,
      firstTurnActions:fork.result.decisionTrace.filter(e=>
        e.playerSlot===0&&e.turnBefore===1).slice(0,20),
      nextOpponentActions:fork.result.decisionTrace.filter(e=>
        e.playerSlot===1&&e.turnBefore===2).slice(0,20)},
    qualifiedForCompetitiveInference:false,
    scope:'One forced paid source-60 first-turn action line; generic weak opponent and no independent policy/rule verification'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,SEED};
