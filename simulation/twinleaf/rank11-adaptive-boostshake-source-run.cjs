'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch,initializeCards}=require('./headless.cjs');
const {withRank11AdaptiveBoostShake}=
  require('./rank11-adaptive-boostshake-policy.cjs');

const SOURCE_SEED=1244180408;

/**
 * Positive-control rank11 physical seed. The alternative policy evaluates
 * its initial visible K0 own board and own hand and then acts through ordinary
 * Store card/prompt actions. A source screen does not establish frequency.
 */
function run() {
  initializeCards();
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const rank11=plan.opponents.find(x=>x.rank===11);
  assert.equal(rank11?.status,'ready');
  const request={
    deckA:rank11.cards,deckB:plan.candidate.cards,
    seed:SOURCE_SEED,maxActions:450,strictPromptValidation:true,
    forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    label:'rank11-conditional-firstturn-K0-adaptive-Boost-Shake'
  };
  const control=runMatch(request);
  const adaptive=withRank11AdaptiveBoostShake(()=>runMatch(request));
  const game=adaptive.result;
  assert.equal(control.firstTurnSlot,0);
  assert.equal(game.firstTurnSlot,control.firstTurnSlot);
  assert.equal(control.finished,true,'Frozen control must end naturally');
  assert.equal(game.finished,true,'Conditional policy must lead to a terminal game');
  assert.ok(game.decisionTrace.some(e=>e.playerSlot===1&&e.turnBefore===2),
    'The source rank1 opponent must receive its actual first turn');
  assert.deepEqual(game.deckHashes,control.deckHashes);
  assert.equal(adaptive.attempted,true,
    'The positive-control initial own-hand K0 gate must trigger');
  assert.equal(adaptive.aborted,null,'No expected source resource may be absent');
  assert.equal(adaptive.completed,true,
    'Conditional planner must finish the full printed eleven-action line');
  assert.equal(adaptive.issuedActions.length,11);
  assert.equal(adaptive.issuedActions[0].ordinal,0);
  assert.equal(adaptive.issuedActions[10].ordinal,10);
  assert.ok(adaptive.initialOwnHand.some(c=>c.includes('Battle VIP Pass')));
  assert.ok(adaptive.initialOwnHand.some(c=>c.includes('Float Stone')));

  const noOpSeed=1244180409;
  const noOpRequest={...request,seed:noOpSeed,
    label:'rank11-K0-conditional-noop-source-control'};
  const originalNoOp=runMatch(noOpRequest);
  const adaptiveNoOp=withRank11AdaptiveBoostShake(()=>runMatch(noOpRequest));
  assert.equal(adaptiveNoOp.attempted,false,
    'Preregistered source control must not satisfy the K0 activation gate');
  assert.equal(adaptiveNoOp.completed,false);
  assert.equal(adaptiveNoOp.aborted,null);
  assert.deepEqual(adaptiveNoOp.issuedActions,[]);
  assert.deepEqual(adaptiveNoOp.result.decisionTrace,originalNoOp.decisionTrace,
    'Absent a trigger, wrapper must preserve every selected bot action');
  assert.deepEqual([
    adaptiveNoOp.result.finished,adaptiveNoOp.result.winner,
    adaptiveNoOp.result.actions,adaptiveNoOp.result.turns,
    adaptiveNoOp.result.prizesRemaining,adaptiveNoOp.result.deckHashes
  ],[
    originalNoOp.finished,originalNoOp.winner,
    originalNoOp.actions,originalNoOp.turns,
    originalNoOp.prizesRemaining,originalNoOp.deckHashes
  ]);

  return {
    kind:'rank11-conditional-K0-two-Tool-opening-source-v2',
    sourceSeed:SOURCE_SEED,sourceRank:11,candidateRank:1,
    engine:plan.engineRevision,fieldManifestDigest:plan.manifestDigest,
    candidateDigest:plan.candidateDigest,
    initialOwnHand:adaptive.initialOwnHand,
    attempted:adaptive.attempted,completed:adaptive.completed,
    aborted:adaptive.aborted,issuedActions:adaptive.issuedActions,
    actualFirstPlayerSlot:game.firstTurnSlot,
    sourceDeckHashes:game.deckHashes,
    control:{winner:control.winner,actions:control.actions,
      turns:control.turns,remainingPrizes:control.prizesRemaining,
      actualRank11FirstTurn:control.decisionTrace.filter(e=>
        e.playerSlot===0&&e.turnBefore===1).slice(0,20)},
    conditional:{winner:game.winner,actions:game.actions,
      turns:game.turns,remainingPrizes:game.prizesRemaining,
      actualRank11FirstTurn:game.decisionTrace.filter(e=>
        e.playerSlot===0&&e.turnBefore===1).slice(0,20)},
    matchedSourceOpening:true,
    noOpSourceControl:{
      seed:noOpSeed,triggered:adaptiveNoOp.attempted,
      exactMeaningfulActionTraceEquality:true,
      controlWinner:originalNoOp.winner,
      controlActions:originalNoOp.actions,
      controlTurns:originalNoOp.turns
    },
    qualifiedForCompetitiveInference:false,
    scope:'One rule-based contingent opener, not a competitive or generally skilled player'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,SOURCE_SEED};
