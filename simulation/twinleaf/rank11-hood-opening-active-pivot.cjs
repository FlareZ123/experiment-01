'use strict';

const assert=require('node:assert/strict');
const {runWithResearchProfile,RANK11_AUTONOMOUS_PROFILE}=
  require('./policy-profiles.cjs');
const candidate=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');

/**
 * Actual-root, player-perspective early action and active-position evidence.
 * Collected only after selected actions, with no hidden opponent card names.
 * @param {object} game
 */
function concise(game) {
  const source=game.decisionTrace||[];
  const own=source.filter(row=>row.playerSlot===1);
  const pass=own.filter(row=>row.action==='PassTurnAction');
  const attacks=game.attackDeclarationTrace?.filter(row=>row.playerSlot===1)||[];
  return {
    firstTurnSlot:game.firstTurnSlot,
    drawLogVerified:game.verifiedByDrawLog===true,
    finished:game.finished,
    winnerDiagnostic:game.winner,
    prizesRemainingDiagnostic:game.prizesRemaining,
    candidateFirstPasses:pass.slice(0,12).map(row=>({
      turn:row.turnBefore,actionOrdinal:row.actionOrdinal,
      active:row.publicBoardBeforePass?.[1]?.active??null,
      bench:row.publicBoardBeforePass?.[1]?.bench?.map(p=>({
        name:p.name,energy:p.energyCards,tool:p.toolCards}))??[],
      hand:row.decisionHandBefore?.ownHandPrintings||[]
    })),
    candidateAbilities:(game.abilityTrace||[]).filter(row=>row.seat===1)
      .slice(0,15),
    candidateAttacks:attacks.slice(0,20).map(row=>({
      turn:row.turnBefore,attack:row.attackName,
      actionOrdinal:row.actionOrdinal,trigger:row.triggerAction
    })),
    sourceAttacks:(game.attackDeclarationTrace||[])
      .filter(row=>row.playerSlot===0).slice(0,6).map(row=>({
        turn:row.turnBefore,attack:row.attackName
      })),
    playedCandidateCards:game.cardsPlayedBySeat?.[1]||{},
    rootActionCount:game.actions
  };
}

/** Narrow original-deal setup position counterfactual, no qualified wins. */
function run() {
  const {planAichi}=require('../evaluation/aichi-pilot.cjs');
  const plan=planAichi(candidate,{allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
  const rank11=plan.opponents.find(row=>row.rank===11);
  assert.equal(rank11?.status,'ready');
  const common={
    deckA:rank11.cards,deckB:plan.candidate.cards,
    rank11SourceSeat:0,seed:1244180408,maxActions:450,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    label:'rank11-hood-opening-shadowrider-selected-pivot'
  };
  const play=extra=>runWithResearchProfile({...common,...extra},
    RANK11_AUTONOMOUS_PROFILE);
  const original=play({});
  const adjusted=play({shadowRiderOpeningPivot:true});
  const restored=play({});
  assert.equal(original.verifiedByDrawLog,true);
  assert.equal(adjusted.verifiedByDrawLog,true);
  assert.equal(original.firstTurnSlot,0);
  assert.equal(adjusted.firstTurnSlot,0);
  assert.deepEqual(original.deckHashes,adjusted.deckHashes);
  assert.deepEqual(original.decisionTrace,restored.decisionTrace);
  const before=concise(original),after=concise(adjusted);
  const originalActive=before.candidateFirstPasses[0]?.active?.name;
  const changedActive=after.candidateFirstPasses[0]?.active?.name;
  return {
    schema:'rank11-hood-selected-opening-active-pivot-v1',
    seed:common.seed,engine:'twinleafgg/'+plan.engineRevision,
    exactSourceRank:11,trueFirstTurnSeat:0,
    selectedStartRule:'reorder already selected legal starting Basics only',
    originalStartActive:originalActive,
    pivotStartActive:changedActive,
    startChoiceChanged:originalActive!==changedActive,
    original:before,pivot:after,
    restoredBaselineDecisionTraceEqual:true,
    qualifiedCompetitiveGames:0,
    warning:'One historical source deal, unchanged decklists; weak opponent/own tactical policies, no paper clock or 99.5 strength inference.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,concise};
