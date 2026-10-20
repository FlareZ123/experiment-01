'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {frozenRank6Trial}=
  require('./agent30-rank6-bench-psychic-source-fork.cjs');
const {executeDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {withRank6GengarK1Search}=
  require('../twinleaf/agent10-rank6-telepath-gengar-search.cjs');
const {withOwnerEnergyWindowAudit}=
  require('../twinleaf/owner-energy-window-audit.cjs');

const ORIGINAL_ROOT_SHA=
  '87ef423a77ec6aafd6063fd3ad054ce3f9d29806a52ab04f21c1c6bb0e1495e4';

/** @param {object} audit */
function energySummary(audit){
  return {
    authenticOwnerTurnCount:audit.candidateOwnTurns,
    nativeManualEnergy:audit.nativeManualEnergy.map(row=>({
      turn:row.turn,energy:row.energyName,target:row.target
    })),
    powerglassLikePromptAccepted:audit.likelyPowerglassPrompts.map(row=>({
      turn:row.turn,chosen:row.chosenEnergyNames,
      activeAfter:row.activeEnergyAfter
    })),
    realPublicEnergyTransfers:audit.publicEnergyTransitionsLedger.map(row=>({
      turn:row.turnBefore,actorSeat:row.actorSeat,action:row.nativeAction,
      attachedCardDelta:row.attachedCardDelta,
      before:row.before,after:row.after
    })),
    actorDeckOrHiddenPrizeIdentitiesRead:false,
    ownHandAndPublicBoardOnly:true
  };
}

/** @param {object} game @param {object} energy */
function summary(game,energy){
  return {
    trialId:game.trial.id,rootHash:game.rootActionLedgerSha256,
    physicalSourceDeal:game.sourceDealFingerprint,
    sourceFirstHand:game.sourceFirstOwnHandSha256,
    actualStarter:game.actualStarterSeat,sourceActuallyFirst:game.sourceActuallyFirst,
    sourceAudit:game.sourceAudit,
    turn3OwnerSearches:game.candidateOwnDeckSelectionEvidence.filter(e=>e.turn===3),
    earlyOwnerSearches:game.candidateOwnDeckSelectionEvidence.filter(e=>e.turn<=5),
    actionCount:game.actionCount,turns:game.turns,
    attackDeclarations:game.attackDeclarations,
    candidateSettlements:game.candidateAttackSettlement,
    settledPublicAttackCount:game.settledPublicAttackCount,
    firstCandidatePostSourceRoot:game.firstCandidatePostSourceRoot,
    finished:game.finished,winner:game.winner,
    endReason:game.endReason,finalPrizes:game.finalPrizes,
    finalBoard:game.finalBoard,energy:energySummary(energy),qualifiedCompetitiveGame:false
  };
}

/** @returns {object} */
function run(){
  const root=path.resolve(__dirname,'../..');
  const output=path.join(root,'vendor/twinleaf/ptcg-server/output');
  const deps={
    Store:require(path.join(output,'game/store/store')).Store,
    SimpleTacticsAi:require(path.join(output,
      'simple-bot/simple-tactics-ai')).SimpleTacticsAi,
    ResolvePromptAction:require(path.join(output,
      'game/store/actions/resolve-prompt-action')).ResolvePromptAction,
    GamePhase:require(path.join(output,
      'game/store/state/state')).GamePhase
  };
  const fixed=frozenRank6Trial();
  const play=()=>withOwnerEnergyWindowAudit(0,()=>
    executeDevelopment(fixed.trial,fixed.prepared,{
      compressorPayload:true,opportunityAudit:true,lateCompressorPayload:true
    }));
  const control=play();
  const baseline=control.result;
  assert.equal(baseline.rootActionLedgerSha256,ORIGINAL_ROOT_SHA,
    'Frozen original root ledger must be identical before counterfactual');
  assert.equal(baseline.attackDeclarations.candidate,0);
  assert.equal(baseline.actionCount,260);
  assert.equal(baseline.sourceActuallyFirst,false);
  const played=withRank6GengarK1Search(deps,play,{seat:0,turn:3});
  const alternative=played.result.result;
  const audit=played.audit;
  const alternativeEnergy=played.result.audit;
  assert.equal(alternative.verifiedFirstTurn,true);
  assert.equal(alternative.actualStarterSeat,baseline.actualStarterSeat);
  assert.equal(alternative.sourceDealFingerprint,baseline.sourceDealFingerprint,
    'Source physical deal changed between original and K1 fork');
  assert.equal(alternative.sourceFirstOwnHandSha256,baseline.sourceFirstOwnHandSha256,
    'Source opening hand changed before the owner t3 intervention');
  return {
    schema:'agent10-authenticated-owner-telepath-t3-sourcefork-v1',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    originalRootSHA256:ORIGINAL_ROOT_SHA,
    candidateDeckUnchanged:true,opponentDeckUnchanged:true,
    originalPreviouslySelectedDevelopmentSeed:true,
    originalSourceDealConserved:true,
    actualStartConserved:true,
    sourceOpeningHandConserved:true,
    original:{...summary(baseline,control.audit)},
    intervened:{...summary(alternative,alternativeEnergy)},
    ownerDeckK1ForkAudit:audit,
    sourceGameOutcomesQualified:false,
    numericalWinRateQualified:false,
    caveat:'One already-selected source deal, actual authorized owner-deck choice only; generic bot hidden-information-unsafe, gameplay and paper clock unqualified'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={energySummary,summary,run,ORIGINAL_ROOT_SHA};
