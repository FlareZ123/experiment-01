'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runWithResearchProfile,RANK11_AUTONOMOUS_PROFILE} =
  require('./policy-profiles.cjs');
const {observe} = require('./rank11-hood-source-opportunity.cjs');
const {withEarlyShadowRiderHood} = require('./early-shadow-rider-hood.cjs');
const {withProtectedUnderworldDoor} = require('./protected-underworld-door.cjs');
const candidate = require('../../results/aichi-2026/candidate-hood-shadow-rider.json');

/**
 * Acting-player action and attack evidence, never opponent-private information.
 * Every declared attack remains declaration-only until independently audited.
 * @param {object} game
 * @returns {object}
 */
function candidateEarlyEffectEvidence(game) {
  const decisions=(game.decisionTrace||[]).filter(row =>
    row.playerSlot===1 && row.turnBefore<=10).slice(0,70);
  return {
    selectedDecisions:decisions.map(row=>({
      turn:row.turnBefore,ordinal:row.actionOrdinal,
      action:row.action,card:row.card??null,
      ability:row.ability??null,
      attack:row.attack??row.attackChoice?.name??null,
      passActive:row.publicBoardBeforePass?.[1]?.active??null,
      handBefore:row.decisionHandBefore?.ownHandPrintings??null
    })),
    declaredAbilities:(game.abilityTrace||[]).filter(row =>
      row.seat===1 && row.turn<=12),
    candidateAttackDeclarations:(game.attackDeclarationTrace||[])
      .filter(row=>row.playerSlot===1 && row.turnBefore<=12)
      .map(row=>({turn:row.turnBefore,name:row.attackName,
        trigger:row.triggerAction,ordinal:row.actionOrdinal})),
    candidateRootAttacks:(game.attackTrace||[])
      .filter(row=>row.seat===1 && row.turn<=12)
      .map(row=>({turn:row.turn,attack:row.attack})),
    candidatePlayedCards:game.cardsPlayedBySeat?.[1]||{}
  };
}

/**
 * One actual-deal counterfactual. Both arms retain exact deck IDs, seed,
 * engine rules and source-opponent policy. Instrumentation runs only after
 * the original policy's chosen action or as a source Store observer.
 *
 * @returns {object}
 */
function run() {
  const plan = planAichi(candidate,{
    allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const rank11 = plan.opponents.find(row => row.rank===11);
  assert.equal(rank11?.status,'ready');
  const request = {
    deckA:rank11.cards,deckB:plan.candidate.cards,
    rank11SourceSeat:0,seed:1244180408,maxActions:450,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    label:'rank11-hood-first-tool-target-original-source'
  };
  const game = () => runWithResearchProfile(request,RANK11_AUTONOMOUS_PROFILE);
  const baseline = observe(game);
  const alternative = withEarlyShadowRiderHood(1,()=>observe(game));
  const protectedDoor = withEarlyShadowRiderHood(1,()=>
    withProtectedUnderworldDoor(1,()=>observe(game)));
  const restored = observe(game);
  assert.equal(baseline.game.verifiedByDrawLog,true);
  assert.equal(alternative.result.game.verifiedByDrawLog,true);
  assert.equal(baseline.game.firstTurnSlot,0,
    'Published source must genuinely start first');
  assert.deepEqual(baseline.game.deckHashes,alternative.result.game.deckHashes);
  assert.deepEqual(baseline.game.deckHashes,protectedDoor.result.result.game.deckHashes);
  assert.deepEqual(baseline.game.decisionTrace,restored.game.decisionTrace,
    'Original chosen-action policy must be restored after experiment');
  assert.deepEqual(baseline.hoodAttachments,restored.hoodAttachments);
  const interventions = alternative.policyAudit.events.filter(row =>
    row.kind==='selected-root-play');
  const physical = alternative.result.hoodAttachments;
  const observedAttachment = interventions.length === 1 &&
    physical.some(row => row.current.some(entry =>
      entry.pokemon===interventions[0].target.pokemon));
  const equippedProtected = alternative.result.events.filter(event =>
    event.garbodorTools>0 && event.vmax.some(vm => vm.hood && !vm.blocked));
  return {
    schema:'rank11-hood-target-original-deal-counterfactual-v1',
    physicalSourceSeat:0,physicalCandidateSeat:1,
    trueFirstTurnSlot:baseline.game.firstTurnSlot,
    seed:request.seed,engine:'twinleafgg/'+plan.engineRevision,
    sourceRank:11,sourceListCount:rank11.cards.length,
    candidateListCount:plan.candidate.cards.length,
    sourceEngineDeckDigests:baseline.game.deckHashes,
    original:{
      hoodAttachments:baseline.hoodAttachments,
      earlyEffectEvidence:candidateEarlyEffectEvidence(baseline.game),
      initialOwnActions:baseline.game.decisionTrace.filter(row =>
        row.playerSlot===1 && row.turnBefore<=4).slice(0,20)
        .map(row=>({turn:row.turnBefore,action:row.action,
          card:row.card||null,ordinal:row.actionOrdinal})),
      gameFinished:baseline.game.finished,
      diagnosticPrizesRemaining:baseline.game.prizesRemaining
    },
    alternative:{
      policyAudit:alternative.policyAudit,
      earlyEffectEvidence:candidateEarlyEffectEvidence(alternative.result.game),
      actualHoodAttachments:physical,
      matchingSelectedToolAttachment:observedAttachment,
      protectedVmaxWhileOpponentToolEquipped:equippedProtected,
      gameFinished:alternative.result.game.finished,
      diagnosticPrizesRemaining:alternative.result.game.prizesRemaining
    },
    withProtectedDoor:{
      hoodPolicyAudit:protectedDoor.policyAudit,
      doorPolicyAudit:protectedDoor.result.policyAudit,
      actualHoodAttachments:protectedDoor.result.result.hoodAttachments,
      earlyEffectEvidence:candidateEarlyEffectEvidence(protectedDoor.result.result.game),
      gameFinished:protectedDoor.result.result.game.finished,
      diagnosticPrizesRemaining:protectedDoor.result.result.game.prizesRemaining
    },
    restoredControlByteIdentical:true,
    qualifiedCompetitiveGames:0,
    warning:'Selected historical source deal; automatic target policy is a narrow mechanistic counterfactual. No independent matchup strength, card-printing certification, competitive turn policy, or timed-game inference.'
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
