'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch}=require('./headless.cjs');
const {withRank11DirectBoostShake}=require('./rank11-direct-boostshake.cjs');
const {withRank11AutonomousOpener}=require('./rank11-autonomous-opener.cjs');
const {withNightWatchEffectJournal}=require('./rank11-night-watch-effect-journal.cjs');

const SEED=2809154458;
/** Resolve the pinned compiled Store, without modifying vendor code. */
function pinnedStore() {
  return require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
}

/**
 * Source-dealt replay from a previously observed favorable lock opportunity.
 * Read-only post-action snapshots explain whether the actual Night Watch
 * declarations materialized as expected hand/deck/damage changes.
 * This seed was selected after observing the outcome and cannot estimate win rate.
 */
function run() {
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(deck=>deck.rank===11);
  assert.equal(source?.status,'ready');
  const request={
    deckA:source.cards,deckB:plan.candidate.cards,seed:SEED,
    label:'rank11-nightwatch-effect-audit-unqualified-v1',
    maxActions:160,strictPromptValidation:true,
    forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    capturePhysicalZoneIntegrity:true
  };
  const observed=withRank11DirectBoostShake(0,()=>
    withRank11AutonomousOpener(0,()=>
      withNightWatchEffectJournal(()=>runMatch(request),pinnedStore()),
      {allowSecondGlobalTurn:true,version:'rank11-vstar-own-first-v2-composed'})
  );
  const game=observed.result.result.result;
  const journal=observed.result.result;
  const declared=game.attackDeclarationTrace.filter(event=>
    event.playerSlot===1 && event.attackName==='Night Watch');
  assert.equal(game.firstTurnSlot,1,'Historical source must actually start second');
  assert.equal(observed.policyAudit.completed,true,'Actual Tool-Garbodor line changed');
  assert.equal(game.finished,true,'Previously observed terminal game changed');
  assert.equal(game.winner,1,'Previously observed reference victory changed');
  assert.equal(declared.length,3,'Printed/Perfection attack history changed');
  assert.equal(journal.records.length,declared.length,
    'Real source attack declaration was missed by observer');
  for(const record of journal.records) {
    assert.equal(record.status,'first-no-prompt-boundary',
      'A Night Watch effect is still pending');
  }
  const rows=journal.records.map((record,index)=>{
    const from=record.before.players[0];
    const to=record.after.players[0];
    return {
      ordinal:index+1,turn:record.turnBefore,
      initiatingRootAction:record.actionName,
      resolutionDispatches:record.stages.map(stage=>stage.actionName),
      detailStages:record.stages.map(stage=>({
        ordinal:stage.ordinal,action:stage.actionName,prompt:stage.promptAudit,
        beforeHand:stage.beforeHand,beforeDeck:stage.beforeDeck,
        afterHand:stage.after.players[0].hand,
        afterDeck:stage.after.players[0].deck
      })),
      before:{hand:from.hand,deck:from.deck,prizes:from.prizes,
        active:from.active},
      after:{hand:to.hand,deck:to.deck,prizes:to.prizes,
        active:to.active},
      handChange:to.hand-from.hand,
      deckChange:to.deck-from.deck,
      prizeChange:to.prizes-from.prizes,
      sameActive:from.active?.name===to.active?.name,
      activeDamageChange:from.active?.name===to.active?.name?
        to.active.damage-from.active.damage:null
    };
  });
  return {
    schema:'rank11-pinned-source-NightWatch-actual-effect-observer-v1',
    seed:SEED,sourceRank:11,candidateRank:1,
    sourceDigest:plan.manifestDigest,engineRevision:plan.engineRevision,
    firstTurnSlot:game.firstTurnSlot,verifiedByDrawLog:game.verifiedByDrawLog,
    sourceToolGarbodorCompleted:observed.policyAudit.completed,
    sourceLockWitness:observed.policyAudit.nextTurnLockWitness,
    gameFinished:game.finished,engineWinner:game.winner,
    actionHorizon:request.maxActions,actualRootActions:game.actions,
    attackDeclarations:declared.map(x=>({turn:x.turnBefore,attack:x.attackName,
      rootOrdinal:x.actionOrdinal,trigger:x.triggerAction})),
    resolvedAttackRecords:rows,
    sourcePhysicalZoneIntegrity:game.physicalZoneIntegrity,
    caveat:'Single retrospectively selected conditioned source deal, read-only Store effect observations. Attack text correctness, policy competence, time and independent paper qualification remain open.',
    qualifiedForCompetitiveInference:false
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,SEED};
