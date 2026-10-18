'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch} = require('./headless.cjs');
const {withRank11DirectBoostShake} = require('./rank11-direct-boostshake.cjs');
const {withRank11AutonomousOpener} = require('./rank11-autonomous-opener.cjs');

// Archived authentic rank-11 owner-visible held-Shake opportunities, selected
// before this response test. Source-rank11 actually first for the first pair,
// actually second for the second pair. Selection is conditioned on opportunity;
// none of these records estimates a field win probability.
const FIXED_SEEDS = Object.freeze([
  {seed:1325646358,expectedRank11ActualFirst:true},
  {seed:3316498962,expectedRank11ActualFirst:true},
  {seed:1769876458,expectedRank11ActualFirst:false},
  {seed:2809154458,expectedRank11ActualFirst:false}
]);

/**
 * Unaltered source-60 versus published rank1 reference, with opt-in composite
 * rank11 opener. Extend the authentic source deal beyond the previous 48
 * actions to inspect the opponent's first attack decisions after real lock.
 * All trials, including errors and incomplete matches, are preserved.
 * @returns {object}
 */
function run() {
  const plan = planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source = plan.opponents.find(deck=>deck.rank===11);
  assert.equal(source?.status,'ready');
  assert.equal(source.cards.length,60);
  assert.equal(plan.candidate.cards.length,60);
  const rows=[];
  for (const entry of FIXED_SEEDS) {
    const seed=entry.seed;
    try {
      const coupled=withRank11DirectBoostShake(0,()=>withRank11AutonomousOpener(
        0,()=>runMatch({
          deckA:source.cards,deckB:plan.candidate.cards,seed,
          label:'rank11-conditioned-hybrid-lock-versus-rank1-response-v1',
          maxActions:160,
          strictPromptValidation:true,forestSealSearchCorrection:true,
          battleCompressorPositiveSelectionCorrection:true,
          isolatePolicyRandomness:true,captureDecisionTrace:true,
          captureAttackPassProbes:true,capturePhysicalZoneIntegrity:true
        }),
        {allowSecondGlobalTurn:true,version:'rank11-vstar-own-first-v2-composed'}
      ));
      const audit=coupled.policyAudit;
      const game=coupled.result.result;
      const vstar=coupled.result.policyAudit;
      const first=game.firstTurnSlot===0;
      const lockTurn=audit.nextTurnLockWitness?.turn ?? null;
      const afterLock=lockTurn===null ? [] :
        game.decisionTrace.filter(event=>
          event.playerSlot===1 && event.turnBefore>=lockTurn);
      const declarations=game.attackDeclarationTrace.filter(event=>
        event.playerSlot===1);
      const opponentDeclarations=game.attackDeclarationTrace.filter(event=>
        event.playerSlot===0);
      const postLockDeclarations=lockTurn===null ? [] :
        declarations.filter(event=>event.turnAfter>=lockTurn);
      const postLockOpponentDeclarations=lockTurn===null ? [] :
        opponentDeclarations.filter(event=>event.turnAfter>=lockTurn);
      rows.push({
        seed,sourcePhysicalSeat:0,candidatePhysicalSeat:1,
        expectedRank11ActualFirst:entry.expectedRank11ActualFirst,
        actualRank11First:first,actualFirstTurnSlot:game.firstTurnSlot,
        actualFirstOrderMatchesArchive:entry.expectedRank11ActualFirst===first,
        rank11Direct:{completed:audit.completed,opportunityTurn:audit.opportunityTurn,
          selectedRoute:audit.route,selectedTool:audit.selectedTool,
          abnormal:audit.aborted,nextTurnLockWitness:audit.nextTurnLockWitness},
        rank11Vstar:{completeAtDecisionBoundary:vstar.completeAtDecisionBoundary,
          opportunityDetected:vstar.opportunityDetected},
        rootActions:game.actions,finished:game.finished,winner:game.winner,
        candidateAllAttackDeclarations:declarations.map(event=>({
          turn:event.turnAfter,attack:event.attackName,
          trigger:event.triggerAction,ordinal:event.actionOrdinal
        })),
        candidatePostLockAttackDeclarations:postLockDeclarations.map(event=>({
          turn:event.turnAfter,attack:event.attackName,
          trigger:event.triggerAction,ordinal:event.actionOrdinal
        })),
        opponentPostLockAttackDeclarations:postLockOpponentDeclarations.map(event=>({
          turn:event.turnAfter,attack:event.attackName,
          trigger:event.triggerAction,ordinal:event.actionOrdinal
        })),
        candidateFirstPostLockDecisions:afterLock.slice(0,16).map(event=>({
          ordinal:event.actionOrdinal,turn:event.turnBefore,
          action:event.action,card:event.card??null,
          ability:event.ability??null,attack:event.attack??null,
          attackPassProbe:event.attackPassProbe??null
        })),
        candidatePostLockPasses:afterLock.filter(event=>event.action==='PassTurnAction').length,
        candidatePostLockRootAttacks:afterLock.filter(event=>event.action==='AttackAction').length,
        abilityNames:game.abilityTrace.filter(event=>event.playerSlot===1).map(event=>event.ability),
        sourcePhysicalIntegrity:game.physicalZoneIntegrity,
        attackDeclarationProtocol:game.attackDeclarationTraceProtocol,
        qualifiedForCompetitiveInference:false
      });
    } catch(error) {
      rows.push({seed,expectedRank11ActualFirst:entry.expectedRank11ActualFirst,
        error:String(error?.stack||error),qualifiedForCompetitiveInference:false});
    }
  }
  return {
    study:'authentic conditioned rank11 lock and published rank1 response diagnostic',
    status:'mechanical decision-screen, not competitive games',
    sourceRank11Digest:source.cards.length===60?plan.manifestDigest:null,
    referenceCandidateDigest:plan.candidateDigest,
    engineRevision:plan.engineRevision,
    frozenSeedSet:FIXED_SEEDS,rootActionHorizon:160,
    physicalSeats:{rank11:0,rank1Reference:1},
    rows,qualifiedForCompetitiveInference:false
  };
}

if (require.main===module) process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={FIXED_SEEDS,run};
